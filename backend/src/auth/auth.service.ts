import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { AuthDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>, private jwt: JwtService) {}

  async register(dto: AuthDto) {
    if (await this.users.findOneBy({ email: dto.email })) throw new ConflictException('Email already registered');
    const isFirst = (await this.users.count()) === 0; // first account becomes admin
    const user = await this.users.save(this.users.create({
      email: dto.email, password: await bcrypt.hash(dto.password, 10), role: isFirst ? 'admin' : 'staff',
    }));
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: AuthDto) {
    const user = await this.users.findOneBy({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Invalid credentials');
    const access_token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { access_token, role: user.role };
  }
}
