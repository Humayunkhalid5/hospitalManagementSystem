import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({ imports: [TypeOrmModule.forFeature([Appointment, Patient, Doctor])], controllers: [AppointmentsController], providers: [AppointmentsService] })
export class AppointmentsModule {}
