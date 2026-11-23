import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    @InjectRepository(Patient) private patients: Repository<Patient>,
    @InjectRepository(Doctor) private doctors: Repository<Doctor>,
  ) {}

  private async check(dto: Partial<CreateAppointmentDto>, selfId?: number) {
    if (dto.patientId && !(await this.patients.existsBy({ id: dto.patientId }))) throw new NotFoundException('Patient not found');
    if (dto.doctorId && !(await this.doctors.existsBy({ id: dto.doctorId }))) throw new NotFoundException('Doctor not found');
    if (dto.doctorId && dto.appointmentDate) {
      const clash = await this.repo.findOneBy({ doctorId: dto.doctorId, appointmentDate: new Date(dto.appointmentDate) });
      if (clash && clash.id !== selfId) throw new ConflictException('Doctor already has an appointment at that time');
    }
  }

  async create(dto: CreateAppointmentDto) {
    await this.check(dto);
    return this.repo.save(this.repo.create({ ...dto, appointmentDate: new Date(dto.appointmentDate) }));
  }
  findAll() { return this.repo.find({ relations: { patient: true, doctor: true }, order: { appointmentDate: 'DESC' } }); }
  async findOne(id: number) {
    const a = await this.repo.findOne({ where: { id }, relations: { patient: true, doctor: true } });
    if (!a) throw new NotFoundException(`Appointment ${id} not found`);
    return a;
  }
  async update(id: number, dto: UpdateAppointmentDto) {
    const a = await this.findOne(id);
    if (!Object.keys(dto).length) throw new BadRequestException('Nothing to update');
    await this.check({ doctorId: a.doctorId, appointmentDate: a.appointmentDate.toISOString(), ...dto }, id);
    const { appointmentDate, ...rest } = dto;
    await this.repo.update(id, { ...rest, ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }) });
    return this.findOne(id);
  }
  async remove(id: number) { await this.repo.remove(await this.findOne(id)); }
}
