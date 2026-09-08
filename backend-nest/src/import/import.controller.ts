import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Req, Logger, BadRequestException, Query } from '@nestjs/common';
import { FastifyFileInterceptor } from '../common/interceptors/fastify-file.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportParserService } from './report-parser.service';
import { Mt5Service } from '../mt5/mt5.service';
import { ImportMethod } from '../mt5/import-log.entity';
import { PlanPermissionService, PlanTier } from '../payment/plan-permission.service';
import { PlanGuard, RequirePlan } from '../payment/plan.guard';

@Controller('import')
@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan(PlanTier.BASIC)
export class ImportController {
    private readonly logger = new Logger(ImportController.name);

    constructor(
        private readonly reportParser: ReportParserService,
        private readonly mt5Service: Mt5Service,
        private readonly planPermissionService: PlanPermissionService
    ) { }

    @Post('report')
    @UseInterceptors(new FastifyFileInterceptor('file'))
    async uploadReport(
        @UploadedFile() file: any,
        @Req() req,
        @Query('accountId') queryAccountId?: string
    ) {
        if (!file) throw new BadRequestException('Nenhum arquivo enviado');

        const userId = req.user.id;
        // Resolve target account: query parameter, body field or x-account-id header
        let targetAccountId = queryAccountId || req.body?.accountId || (req.headers['x-account-id'] as string) || undefined;
        if (targetAccountId === 'all' || targetAccountId === 'undefined' || targetAccountId === 'null' || targetAccountId === '') {
            targetAccountId = undefined;
        }

        this.logger.log(`Processando relatório para Usuário ${userId}, Conta solicitada: ${targetAccountId || 'Auto (Principal)'}, Tamanho: ${file.size} bytes`);

        let trades = [];

        try {
            // Detect encoding (UTF-16LE is common for MT5 reports)
            let content: string;
            const buffer = file.buffer;
            
            if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
                content = buffer.toString('utf16le');
                this.logger.log('Detected UTF-16LE encoding');
            } else {
                content = buffer.toString('utf-8');
            }

            const userPlan = await this.planPermissionService.getUserPlan(userId);

            if (file.mimetype?.includes('html') || file.originalname?.endsWith('.html') || file.originalname?.endsWith('.htm')) {
                trades = this.reportParser.parseHtml(content);
            } else if (file.mimetype?.includes('csv') || file.originalname?.endsWith('.csv')) {
                trades = this.reportParser.parseCsv(content);
            } else {
                throw new BadRequestException('Formato de arquivo não suportado. Por favor envie .html ou .csv');
            }

            if (trades.length === 0) {
                this.logger.warn('Nenhum trade encontrado no arquivo');
                return { success: false, count: 0, message: 'Nenhuma operação encontrada no relatório.' };
            }

            this.logger.log(`Analisadas ${trades.length} operações. Salvando diretamente na conta de destino...`);

            // Save trades com a conta de destino
            const result = await this.mt5Service.saveHistory(trades, ImportMethod.FILE, userId, targetAccountId);

            return {
                success: true,
                message: result.message || `Importamos ${result.count} operações com sucesso!`,
                count: result.count,
                accountId: result.accountId || targetAccountId
            };

        } catch (e) {
            this.logger.error(`Falha na importação: ${e.message}`);
            throw new BadRequestException(`Falha na importação: ${e.message}`);
        }
    }
}
