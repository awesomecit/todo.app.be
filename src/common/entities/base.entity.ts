import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

const TIMESTAMP_WITH_TIME_ZONE = 'timestamp with time zone'; // PostgreSQL specific

/**
 * Base entity con campi comuni a tutte le entità del sistema
 * Fornisce struttura standard per:
 * - Identificazione univoca (uuid, id)
 * - Audit trail (createdAt, updatedAt)
 * - Soft delete (deletedAt)
 * - Stato attivazione (active)
 * - Versioning per optimistic locking (version)
 */
export abstract class BaseEntity {
  /**
   * Identificatore univoco UUID per l'entità
   * Utilizzato come chiave primaria per garantire unicità globale
   */
  @PrimaryColumn('uuid')
  uuid: string;

  /**
   * ID incrementale per uso interno del database
   * Fornisce un identificatore numerico sequenziale per performance
   */
  @Column({
    type: 'int',
    generated: 'increment',
    nullable: false,
    unique: true,
  })
  id: number;

  /**
   * Timestamp di creazione dell'entità
   * Impostato automaticamente alla prima creazione
   */
  @CreateDateColumn({ type: TIMESTAMP_WITH_TIME_ZONE, name: 'created_at' })
  createdAt: Date;

  /**
   * Timestamp dell'ultimo aggiornamento dell'entità
   * Aggiornato automaticamente ad ogni modifica
   */
  @UpdateDateColumn({ type: TIMESTAMP_WITH_TIME_ZONE, name: 'updated_at' })
  updatedAt: Date;

  /**
   * Timestamp di eliminazione logica (soft delete)
   * null = entità attiva, Date = entità eliminata logicamente
   */
  @Column({
    type: TIMESTAMP_WITH_TIME_ZONE,
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;

  /**
   * Flag di stato attivazione dell'entità
   * true = entità attiva, false = entità disattivata
   * Default: true (impostato automaticamente alla creazione)
   */
  @Column({ default: true, nullable: false })
  active: boolean;

  /**
   * Versione dell'entità per optimistic locking
   * Incrementata automaticamente ad ogni aggiornamento
   */
  @VersionColumn()
  version: number;

  /**
   * Hook eseguito prima dell'inserimento nel database
   * Garantisce che il flag active sia impostato correttamente solo se non è definito
   */
  @BeforeInsert()
  setDefaultActive(): void {
    if (this.active === undefined || this.active === null) {
      this.active = true;
    }
  }
}
