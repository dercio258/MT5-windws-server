import { Injectable, Logger } from '@nestjs/common';
import { EconomicCalendarService } from '../economic-calendar/economic-calendar.service';

@Injectable()
export class FinnhubService {
    private readonly logger = new Logger(FinnhubService.name);

    constructor(
        private readonly calendarService: EconomicCalendarService
    ) {}

    async getEconomicCalendar(userId?: string, accountId?: string) {
        return this.calendarService.getEconomicCalendarLegacy(userId, accountId);
    }
}
