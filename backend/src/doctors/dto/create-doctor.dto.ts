import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class CreateDoctorDto {
  @IsString() @Length(2, 50) firstName: string;
  @IsString() @Length(2, 50) lastName: string;
  @IsString() @Length(2, 80) specialization: string;
  @Matches(/^\+?[0-9\s-]{7,15}$/, { message: 'phone must be a valid phone number' }) phone: string;
  @IsEmail() email: string;
}
