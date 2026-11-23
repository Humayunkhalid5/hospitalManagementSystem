import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn() id: number;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column({ type: 'date' }) dateOfBirth: string;
  @Column() gender: string;
  @Column() phone: string;
  @Column({ nullable: true }) email?: string;
  @Column({ nullable: true }) address?: string;
  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => Appointment, (a) => a.patient) appointments: Appointment[];
}
