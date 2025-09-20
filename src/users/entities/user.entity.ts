import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('user')
// @Index(['role']) // Indice semplice per query per ruolo
export class User extends BaseEntity {
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
}
