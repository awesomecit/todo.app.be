#!/usr/bin/env node

/**
 * Auto Release Script
 *
 * Gestisce il processo di rilascio automatico con:
 * - Analisi intelligente dei commit
 * - Calcolo automatico della versione
 * - Generazione del changelog
 * - Tagging Git e push automatico
 * - Rollback in caso di errori
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoRelease {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      force: options.force || false,
      releaseType: options.releaseType || null,
      skipTests: options.skipTests || false,
      skipBuild: options.skipBuild || false,
      ...options,
    };

    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    this.backupSuffix = '.backup-' + Date.now();
  }

  /**
   * Esegue un comando con gestione degli errori
   * @param {string} command Il comando da eseguire
   * @param {boolean} silent Se true, non mostra l'output
   * @returns {string} L'output del comando
   */
  execCommand(command, silent = false) {
    try {
      const options = {
        encoding: 'utf8',
        stdio: silent ? ['pipe', 'pipe', 'ignore'] : 'inherit',
      };

      if (this.options.dryRun) {
        console.log(`🧪 DRY RUN: Would execute: ${command}`);
        return '';
      }

      return execSync(command, options);
    } catch (error) {
      throw new Error(`Command failed: ${command}\nError: ${error.message}`);
    }
  }

  /**
   * Analizza i commit per determinare il tipo di release
   * @returns {Object} Risultati dell'analisi
   */
  async analyzeCommits() {
    console.log('🔍 Analyzing commits for release...');

    try {
      if (this.options.dryRun) {
        console.log(
          '🧪 DRY RUN: Would analyze commits with release-analyzer.js',
        );
        // Ritorna un risultato simulato per dry-run
        return {
          analysis: {
            needsRelease: true,
            releaseType: 'minor',
            summary: { total: 5, major: 0, minor: 1, patch: 1, none: 3 },
          },
        };
      }

      const analysisOutput = this.execCommand(
        'node scripts/release-analyzer.js --json',
        true,
      );
      const analysis = JSON.parse(analysisOutput);

      console.log(`📊 Analysis completed:`);
      console.log(
        `   • Needs Release: ${analysis.analysis.needsRelease ? '✅ Yes' : '❌ No'}`,
      );
      console.log(`   • Release Type: ${analysis.analysis.releaseType}`);
      console.log(`   • Total Commits: ${analysis.analysis.summary.total}`);

      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze commits: ${error.message}`);
    }
  }

  /**
   * Calcola la nuova versione
   * @param {string} releaseType Il tipo di release
   * @returns {Object} Informazioni sulla nuova versione
   */
  async calculateVersion(releaseType) {
    console.log(`🔢 Calculating new version for ${releaseType} release...`);

    try {
      if (this.options.dryRun) {
        console.log(`🧪 DRY RUN: Would calculate version for ${releaseType}`);
        // Ritorna un risultato simulato per dry-run
        return {
          previousVersion: '0.1.0',
          newVersion:
            releaseType === 'major'
              ? '1.0.0'
              : releaseType === 'minor'
                ? '0.2.0'
                : '0.1.1',
          bumped: true,
          releaseType,
        };
      }

      const versionOutput = this.execCommand(
        `node scripts/version-calculator.js ${releaseType} --json`,
        true,
      );
      const versionInfo = JSON.parse(versionOutput);

      console.log(`📦 Version calculation:`);
      console.log(`   • Current: ${versionInfo.previousVersion}`);
      console.log(`   • New: ${versionInfo.newVersion}`);
      console.log(`   • Bumped: ${versionInfo.bumped ? '✅ Yes' : '❌ No'}`);

      return versionInfo;
    } catch (error) {
      throw new Error(`Failed to calculate version: ${error.message}`);
    }
  }

  /**
   * Crea un backup dei file critici
   */
  createBackups() {
    console.log('💾 Creating backups...');

    const filesToBackup = [this.packageJsonPath, this.changelogPath];

    filesToBackup.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const backupPath = filePath + this.backupSuffix;
        if (!this.options.dryRun) {
          fs.copyFileSync(filePath, backupPath);
        }
        console.log(`   📁 Backed up: ${path.basename(filePath)}`);
      }
    });
  }

  /**
   * Ripristina i file dal backup
   */
  restoreBackups() {
    console.log('🔄 Restoring from backups...');

    const filesToRestore = [this.packageJsonPath, this.changelogPath];

    filesToRestore.forEach(filePath => {
      const backupPath = filePath + this.backupSuffix;
      if (fs.existsSync(backupPath)) {
        if (!this.options.dryRun) {
          fs.copyFileSync(backupPath, filePath);
          fs.unlinkSync(backupPath);
        }
        console.log(`   📁 Restored: ${path.basename(filePath)}`);
      }
    });
  }

  /**
   * Pulisce i file di backup
   */
  cleanupBackups() {
    console.log('🧹 Cleaning up backups...');

    const filesToCleanup = [
      this.packageJsonPath + this.backupSuffix,
      this.changelogPath + this.backupSuffix,
    ];

    filesToCleanup.forEach(backupPath => {
      if (fs.existsSync(backupPath)) {
        if (!this.options.dryRun) {
          fs.unlinkSync(backupPath);
        }
        console.log(`   🗑️  Removed: ${path.basename(backupPath)}`);
      }
    });
  }

  /**
   * Aggiorna la versione nel package.json
   * @param {string} newVersion La nuova versione
   */
  updatePackageVersion(newVersion) {
    console.log(`📝 Updating package.json to version ${newVersion}...`);

    if (!this.options.dryRun) {
      const packageJson = JSON.parse(
        fs.readFileSync(this.packageJsonPath, 'utf8'),
      );
      packageJson.version = newVersion;
      fs.writeFileSync(
        this.packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n',
      );
    }

    console.log(`   ✅ Package version updated`);
  }

  /**
   * Genera il changelog
   * @param {string} version La versione per il changelog
   */
  generateChangelog(version) {
    console.log('📖 Generating changelog...');

    try {
      this.execCommand('npm run release:notes');
      console.log('   ✅ Changelog generated');
    } catch (error) {
      console.warn(`   ⚠️  Changelog generation failed: ${error.message}`);
    }
  }

  /**
   * Esegue i test
   */
  runTests() {
    if (this.options.skipTests) {
      console.log('⚡ Skipping tests (--skip-tests)');
      return;
    }

    console.log('🧪 Running tests...');
    this.execCommand('npm run test:coverage:check');
    console.log('   ✅ Tests passed');
  }

  /**
   * Esegue il build
   */
  runBuild() {
    if (this.options.skipBuild) {
      console.log('⚡ Skipping build (--skip-build)');
      return;
    }

    console.log('🏗️ Building project...');
    this.execCommand('npm run build');
    console.log('   ✅ Build completed');
  }

  /**
   * Committa i cambiamenti
   * @param {string} version La versione del release
   */
  commitChanges(version) {
    console.log(`📝 Committing release changes...`);

    this.execCommand('git add .');
    this.execCommand(`git commit -m "chore(release): bump version to ${version}

- Update package.json version
- Generate changelog
- Prepare for release"`);

    console.log('   ✅ Changes committed');
  }

  /**
   * Crea il tag Git
   * @param {string} version La versione per il tag
   */
  createGitTag(version) {
    console.log(`🏷️ Creating Git tag v${version}...`);

    const tagMessage = `Release v${version}

$(git log --oneline --since="$(git describe --tags --abbrev=0 2>/dev/null || echo 'HEAD')" --pretty=format:"- %s" | head -10)`;

    this.execCommand(`git tag -a v${version} -m "${tagMessage}"`);
    console.log('   ✅ Git tag created');
  }

  /**
   * Pusha i cambiamenti e i tag
   */
  pushChanges() {
    console.log('🚀 Pushing changes and tags...');

    // Imposta variabile per evitare loop del pre-push hook
    process.env.SKIP_PRE_PUSH_HOOK = 'true';

    this.execCommand('git push origin HEAD');
    this.execCommand('git push origin --tags');

    console.log('   ✅ Changes and tags pushed');
  }

  /**
   * Esegue il rilascio completo
   */
  async performRelease() {
    let releaseStarted = false;

    try {
      console.log('🚀 Starting automated release process...\n');

      // Fase 1: Analisi
      const analysis = await this.analyzeCommits();

      if (!analysis.analysis.needsRelease && !this.options.force) {
        console.log(
          '📝 No release needed. Use --force to create release anyway.',
        );
        return { success: false, reason: 'No release needed' };
      }

      const releaseType =
        this.options.releaseType || analysis.analysis.releaseType;

      // Fase 2: Calcolo versione
      const versionInfo = await this.calculateVersion(releaseType);

      if (!versionInfo.bumped && !this.options.force) {
        console.log(
          '📝 No version bump needed. Use --force to create release anyway.',
        );
        return { success: false, reason: 'No version bump needed' };
      }

      // Fase 3: Backup
      this.createBackups();
      releaseStarted = true;

      // Fase 4: Test e Build
      this.runTests();
      this.runBuild();

      // Fase 5: Aggiornamenti
      this.updatePackageVersion(versionInfo.newVersion);
      this.generateChangelog(versionInfo.newVersion);

      // Fase 6: Git operations
      this.commitChanges(versionInfo.newVersion);
      this.createGitTag(versionInfo.newVersion);
      this.pushChanges();

      // Fase 7: Cleanup
      this.cleanupBackups();

      console.log(
        `\n🎉 Release v${versionInfo.newVersion} completed successfully!`,
      );
      console.log(`📊 Release Summary:`);
      console.log(`   • Type: ${releaseType}`);
      console.log(
        `   • Version: ${versionInfo.previousVersion} → ${versionInfo.newVersion}`,
      );
      console.log(`   • Commits: ${analysis.analysis.summary.total}`);

      return {
        success: true,
        version: versionInfo.newVersion,
        type: releaseType,
        summary: analysis.analysis.summary,
      };
    } catch (error) {
      console.error(`\n❌ Release failed: ${error.message}`);

      if (releaseStarted) {
        console.log('🔄 Attempting rollback...');
        try {
          this.restoreBackups();
          console.log('✅ Rollback completed');
        } catch (rollbackError) {
          console.error(`❌ Rollback failed: ${rollbackError.message}`);
        }
      }

      return { success: false, error: error.message };
    }
  }
}

// Esecuzione script se chiamato direttamente
if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    skipTests: args.includes('--skip-tests'),
    skipBuild: args.includes('--skip-build'),
    releaseType: args.find(arg => arg.startsWith('--type='))?.split('=')[1],
  };

  console.log('🔧 Auto-Release Configuration:');
  console.log(`   • Dry Run: ${options.dryRun ? '✅ Yes' : '❌ No'}`);
  console.log(`   • Force: ${options.force ? '✅ Yes' : '❌ No'}`);
  console.log(`   • Skip Tests: ${options.skipTests ? '✅ Yes' : '❌ No'}`);
  console.log(`   • Skip Build: ${options.skipBuild ? '✅ Yes' : '❌ No'}`);
  console.log(`   • Release Type: ${options.releaseType || 'auto-detect'}`);
  console.log('');

  const autoRelease = new AutoRelease(options);

  autoRelease
    .performRelease()
    .then(result => {
      if (result.success) {
        console.log('\n✨ Automated release completed successfully!');
        process.exit(0);
      } else {
        console.log(
          `\n📝 Release skipped: ${result.reason || 'Unknown reason'}`,
        );
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(`\n💥 Fatal error: ${error.message}`);
      process.exit(2);
    });
}

module.exports = AutoRelease;
