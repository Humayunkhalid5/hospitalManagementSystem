import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Roles } from '../auth/decorators';

@Controller('appointments')
export class AppointmentsController {
  constructor(private service: AppointmentsService) {}
  @Post() create(@Body() dto: CreateAppointmentDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAppointmentDto) { return this.service.update(id, dto); }
  @Roles('admin') @Delete(':id') @HttpCode(204) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
