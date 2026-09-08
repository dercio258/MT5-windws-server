import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers?.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const secret = this.configService.get<string>('JWT_SECRET') || 'dev_secret';
            try {
                const payload = await this.jwtService.verifyAsync(token, { secret });
                request.user = payload;
            } catch (_) {
                // If token is expired or invalid, keep req.user as undefined
                request.user = null;
            }
        } else {
            request.user = null;
        }

        return true;
    }
}
