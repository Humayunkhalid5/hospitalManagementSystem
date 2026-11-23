import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'timestamptz' }) appointmentDate: Date;
  @Column() reason: string;
  @Column({ default: 'scheduled' }) status: string;
  @Column() patientId: number;
  @Column() doctorId: number;
  @ManyToOne(() => Patient, (p) => p.appointments, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'patientId' }) patient: Patient;
  @ManyToOne(() => Doctor, (d) => d.appointments, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'doctorId' }) doctor: Doctor;
  @CreateDateColumn() createdAt: Date;
}
