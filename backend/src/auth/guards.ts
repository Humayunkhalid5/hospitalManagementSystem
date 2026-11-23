import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC, ROLES } from './decorators';

/** Authentication: requires a valid Bearer JWT unless route is @Public() */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private reflector: Reflector) {}
  async canActivate(ctx: ExecutionContext) {
    if (this.reflector.getAllAndOverride(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()])) return true;
    const req = ctx.switchToHttp().getRequest();
    const [type, token] = (req.headers.authorization ?? '').split(' ');
    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Missing token');
    try { req.user = await this.jwt.verifyAsync(token); } catch { throw new UnauthorizedException('Invalid or expired token'); }
    return true;
  }
}

/** Authorization: checks @Roles() metadata against the user's role */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES, [ctx.getHandler(), ctx.getClass()]);
    if (!roles) return true;
    const { user } = ctx.switchToHttp().getRequest();
    if (!user || !roles.includes(user.role)) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
