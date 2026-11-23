import { IsDateString, IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreatePatientDto {
  @IsString() @Length(2, 50) firstName: string;
  @IsString() @Length(2, 50) lastName: string;
  @IsDateString() dateOfBirth: string;
  @IsIn(['male', 'female', 'other']) gender: string;
  @Matches(/^\+?[0-9\s-]{7,15}$/, { message: 'phone must be a valid phone number' }) phone: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() address?: string;
}
