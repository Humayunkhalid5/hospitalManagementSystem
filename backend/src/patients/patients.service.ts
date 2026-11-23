import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(@InjectRepository(Patient) private repo: Repository<Patient>) {}
  create(dto: CreatePatientDto) { return this.repo.save(this.repo.create(dto)); }
  findAll() { return this.repo.find({ order: { id: 'DESC' } }); }
  async findOne(id: number) {
    const p = await this.repo.findOne({ where: { id }, relations: { appointments: { doctor: true } } });
    if (!p) throw new NotFoundException(`Patient ${id} not found`);
    return p;
  }
  async update(id: number, dto: UpdatePatientDto) {
    const p = await this.findOne(id);
    return this.repo.save(Object.assign(p, dto));
  }
  async remove(id: number) { await this.repo.remove(await this.findOne(id)); }
}
