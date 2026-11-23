import { IsDateString, IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt() patientId: number;
  @IsInt() doctorId: number;
  @IsDateString() appointmentDate: string;
  @IsString() @MinLength(3) reason: string;
  @IsOptional() @IsIn(['scheduled', 'completed', 'cancelled']) status?: string;
}
