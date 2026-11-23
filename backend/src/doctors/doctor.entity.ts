import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn() id: number;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column() specialization: string;
  @Column() phone: string;
  @Column({ unique: true }) email: string;
  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => Appointment, (a) => a.doctor) appointments: Appointment[];
}
