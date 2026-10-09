import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WorkerAuthGuard implements CanActivate {
    private readonly logger = new Logger(WorkerAuthGuard.name);

    constructor(private readonly configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const headers = req.headers || {};

        const workerId = headers['x-worker-id'];
        const workerKey = headers['x-worker-key'];

        const expectedKey = this.configService.get<string>('WORKER_KEY') 
            || this.configService.get<string>('MT5_WORKER_KEY') 
            || 'secret_worker_key_change_me';

        if (!workerKey || workerKey !== expectedKey) {
            this.logger.warn(`Tentativa de acesso não autorizada ao MT5 Worker. ID: ${workerId}`);
            throw new UnauthorizedException('Invalid or missing X-Worker-Key');
        }

        req.workerId = workerId || 'unknown-worker';
        return true;
    }
}
