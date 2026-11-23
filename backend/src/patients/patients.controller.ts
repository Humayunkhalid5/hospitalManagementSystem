import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Roles } from '../auth/decorators';

@Controller('patients')
export class PatientsController {
  constructor(private service: PatientsService) {}
  @Post() create(@Body() dto: CreatePatientDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) { return this.service.update(id, dto); }
  @Roles('admin') @Delete(':id') @HttpCode(204) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
