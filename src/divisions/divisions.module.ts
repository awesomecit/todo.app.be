import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivisionsController } from './divisions.controller';
import { DivisionsService } from './divisions.service';
import { Division } from './entities/division.entity';
import { DivisionRepository } from './repositories/division.repository';

/**
 * Divisions Module - NestJS module for Division feature
 * Note: Uses PLURAL naming convention for NestJS resources
 *
 * This module provides:
 * - Division entity management
 * - CRUD operations for divisions
 * - Hierarchical division support
 * - Business validation and logic
 */
@Module({
  imports: [TypeOrmModule.forFeature([Division])],
  controllers: [DivisionsController],
  providers: [DivisionsService, DivisionRepository],
  exports: [
    DivisionsService,
    DivisionRepository,
    TypeOrmModule, // Export TypeOrmModule to allow other modules to use Division entity
  ],
})
export class DivisionsModule {}
