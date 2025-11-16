import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../../admin/admin.service';
import { UserService } from '../../user/user.service';

export interface JwtPayload {
  userId: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private adminService: AdminService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    // First try to find admin
    const admin = await this.adminService.findById(payload.userId);

    if (admin && admin.isActive) {
      return { userId: payload.userId, email: payload.email, isAdmin: true };
    }

    // If not admin, try to find user
    const user = await this.userService.findById(payload.userId);

    if (user && user.isActive) {
      return { userId: payload.userId, email: payload.email, isAdmin: false };
    }

    throw new UnauthorizedException('Invalid or inactive account');
  }
}
