import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(@InjectRepository(Doctor) private repo: Repository<Doctor>) {}
  async create(dto: CreateDoctorDto) {
    if (await this.repo.findOneBy({ email: dto.email })) throw new ConflictException('Doctor email already exists');
    return this.repo.save(this.repo.create(dto));
  }
  findAll() { return this.repo.find({ order: { id: 'DESC' } }); }
  async findOne(id: number) {
    const d = await this.repo.findOne({ where: { id }, relations: { appointments: { patient: true } } });
    if (!d) throw new NotFoundException(`Doctor ${id} not found`);
    return d;
  }
  async update(id: number, dto: UpdateDoctorDto) { return this.repo.save(Object.assign(await this.findOne(id), dto)); }
  async remove(id: number) { await this.repo.remove(await this.findOne(id)); }
}
