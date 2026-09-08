import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { EconomicCalendarService } from '../economic-calendar/economic-calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finnhub')
@UseGuards(JwtAuthGuard)
export class FinnhubController {
    constructor(private readonly calendarService: EconomicCalendarService) { }

    @Get('calendar')
    async getCalendar(
        @Req() req,
        @Query('accountId') queryAccountId?: string
    ) {
        const accountId = queryAccountId || req.headers['x-account-id'];
        return this.calendarService.getEconomicCalendarLegacy(req.user?.id, accountId);
    }
}

