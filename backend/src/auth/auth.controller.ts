import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { Public } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Public() @Post('register') register(@Body() dto: AuthDto) { return this.auth.register(dto); }
  @Public() @Post('login') login(@Body() dto: AuthDto) { return this.auth.login(dto); }
}
