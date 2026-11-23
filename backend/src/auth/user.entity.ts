import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type Role = 'admin' | 'staff';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) email: string;
  @Column() password: string;
  @Column({ type: 'varchar', default: 'staff' }) role: Role;
}
