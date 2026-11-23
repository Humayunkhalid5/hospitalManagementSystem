import { SetMetadata } from '@nestjs/common';
import { Role } from './user.entity';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);
export const ROLES = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
