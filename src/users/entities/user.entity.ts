import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

const TIMESTAMP_WITH_TIME_ZONE = 'timestamp with time zone'; // PostgreSQL specific

@Entity('user')
// @Index(['role']) // Indice semplice per query per ruolo
export class User {
  @PrimaryColumn('uuid')
  uuid: string;

  @Column({
    type: 'int',
    generated: 'increment',
    nullable: false,
    unique: true,
  })
  id: number;

  @CreateDateColumn({ type: TIMESTAMP_WITH_TIME_ZONE, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: TIMESTAMP_WITH_TIME_ZONE, name: 'updated_at' })
  updatedAt: Date;

  @Column({
    type: TIMESTAMP_WITH_TIME_ZONE,
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;

  @Column({ default: true, nullable: false })
  active: boolean;

  @Column({ name: 'username', length: 20, unique: true, nullable: false })
  username: string;

  @Column({ name: 'first_name', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', length: 50 })
  lastName: string;

  @Column({ length: 100 })
  password: string;

  @Column({ unique: true, length: 255, nullable: false })
  email: string;

  // Data anagrafica - usa DATE per evitare problemi di fuso orario
  @Column({
    type: 'date',
    nullable: true,
    name: 'birth_date',
    comment: 'User birth date (date only, no time component)',
  })
  birthDate?: Date;

  // @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  // role: UserRole;

  @BeforeInsert()
  setDefaultActive() {
    if (
      this.active === undefined ||
      this.active === null ||
      this.active === false
    ) {
      this.active = true;
    }
  }
}
