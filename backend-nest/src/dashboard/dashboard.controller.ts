import { Controller, Get, Post, Patch, Body, Req, UseGuards, UseInterceptors, UploadedFile, Param, Query } from '@nestjs/common';
import { FastifyFileInterceptor } from '../common/interceptors/fastify-file.interceptor';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlanGuard, RequirePlan } from '../payment/plan.guard';
import { PlanTier } from '../payment/plan-permission.service';
import { SessionService } from './session.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan(PlanTier.BASIC)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly sessionService: SessionService
    ) { }

    private resolveAccountId(req: any, queryAccountId?: string): string | undefined {
        const id = queryAccountId || (req.headers['x-account-id'] as string) || undefined;
        if (!id || id === 'all' || id === 'undefined' || id === 'null') {
            return undefined;
        }
        return id;
    }

    @Post('sessions/check')
    async checkSession(@Body() body: { country: string, datetime_utc?: string, user_region?: string }) {
        return this.sessionService.calculateSession(body.country, body.datetime_utc, body.user_region);
    }

    @Get('performance')
    async getPerformance(
        @Req() req,
        @Query('accountId') queryAccountId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        return this.dashboardService.getPerformance(req.user.id, accountId, startDate, endDate);
    }

    @Get('trades')
    async getTrades(
        @Req() req,
        @Query('accountId') queryAccountId?: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limitStr?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        const limit = limitStr ? parseInt(limitStr, 10) : 100;
        return this.dashboardService.getTrades(req.user.id, accountId, endDate, limit);
    }

    @Get('trades/recent')
    async getRecentTrades(
        @Req() req,
        @Query('accountId') queryAccountId?: string,
        @Query('limit') limitStr?: string,
        @Query('endDate') endDate?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        const limit = limitStr ? parseInt(limitStr, 10) : 5;
        return this.dashboardService.getTrades(req.user.id, accountId, endDate, limit);
    }

    @Get('trades/:id')
    async getTradeDetails(@Req() req, @Param('id') id: string) {
        return this.dashboardService.getTradeDetails(req.user.id, id);
    }

    @Post('mental-log')
    async saveMentalLog(
        @Req() req,
        @Body() body: any,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId || body?.accountId);
        return this.dashboardService.saveMentalLog(req.user.id, body, accountId);
    }

    @Get('mental-log/today')
    async getTodayMentalLog(
        @Req() req,
        @Query('session') session: string,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        return this.dashboardService.getTodayMentalLog(req.user.id, session, accountId);
    }

    @Post('mental-log/image')
    @UseInterceptors(new FastifyFileInterceptor('file', { dest: './uploads' }))
    async uploadMentalLogImage(
        @Req() req,
        @UploadedFile() file,
        @Body('session') session: string,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId || req.body?.accountId);
        const imageUrl = `/uploads/${file.filename}`;
        await this.dashboardService.saveMentalLogImage(req.user.id, imageUrl, session, accountId);
        return { imageUrl };
    }

    @Get('mental-log/history')
    async getMentalLogHistory(
        @Req() req,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        return this.dashboardService.getMentalLogHistory(req.user.id, accountId);
    }

    @Get('technical-journal/:date')
    async getTechnicalJournal(
        @Req() req,
        @Param('date') date: string,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        return this.dashboardService.getTechnicalJournal(req.user.id, date, accountId);
    }

    @Post('technical-journal')
    async createTechnicalJournal(@Req() req, @Body() body: any, @Query('accountId') queryAccountId?: string) {
        const userId = req.user.id || req.user.userId;
        const date = body.date;
        const accountId = this.resolveAccountId(req, queryAccountId || body.accountId);
        return this.dashboardService.saveTechnicalJournal(userId, date, body, accountId);
    }

    @Patch('trades/:id')
    async updateTrade(@Req() req, @Param('id') id: string, @Body() body: any) {
        return this.dashboardService.updateTradeMetadata(req.user.id, id, body);
    }

    @Get('heatmap')
    async getHeatmap(
        @Req() req,
        @Query('accountId') queryAccountId?: string,
        @Query('endDate') endDate?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        return this.dashboardService.getHeatmapData(req.user.id, accountId, endDate);
    }

    @Get('weekly-summary')
    async getWeeklySummary(
        @Req() req,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        return this.dashboardService.getWeeklySummary(req.user.id, accountId);
    }

    @Get('report')
    async getReport(
        @Req() req,
        @Query('accountId') queryAccountId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('symbol') symbol?: string,
        @Query('type') type?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        const userId = req.user.id || req.user.userId;
        return this.dashboardService.getReportData(userId, accountId, startDate, endDate, symbol, type);
    }

    @Post('backtest/simulate')
    async simulateBacktest(
        @Req() req,
        @Body() body: any,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId || body.accountId);
        const userId = req.user.id || req.user.userId;
        return this.dashboardService.simulateBacktest(userId, accountId, body);
    }

    @Post('backtest/save')
    async saveBacktest(
        @Req() req,
        @Body() body: any,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId || body.accountId);
        const userId = req.user.id || req.user.userId;
        return this.dashboardService.saveBacktestSession(userId, { ...body, accountId });
    }

    @Get('backtest/history')
    async getBacktestHistory(
        @Req() req,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = this.resolveAccountId(req, queryAccountId);
        const userId = req.user.id || req.user.userId;
        return this.dashboardService.getBacktestHistory(userId, accountId);
    }
}

