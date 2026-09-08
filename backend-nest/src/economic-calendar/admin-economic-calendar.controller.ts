import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { EconomicCalendarService } from './economic-calendar.service';
import { CreateEconomicEventDto } from './dto/create-economic-event.dto';
import { UpdateEconomicEventDto } from './dto/update-economic-event.dto';
import { CompleteEventDto } from './dto/complete-event.dto';
import { PostponeEventDto } from './dto/postpone-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { AdminAuthGuard } from '../admin/admin-auth.guard';

@Controller('admin/economic-calendar')
@UseGuards(AdminAuthGuard)
export class AdminEconomicCalendarController {
    constructor(private readonly calendarService: EconomicCalendarService) {}

    @Get()
    async listEvents(@Query() query: QueryEventsDto) {
        return this.calendarService.getEvents(query);
    }

    @Get(':id')
    async getEventDetails(@Param('id') id: string) {
        return this.calendarService.getEventById(id, true);
    }

    @Post()
    async createEvent(@Body() dto: CreateEconomicEventDto, @Req() req: any) {
        const adminEmail = req.admin?.email || 'ADMIN';
        return this.calendarService.createEvent(dto, adminEmail);
    }

    @Patch(':id')
    async updateEvent(
        @Param('id') id: string,
        @Body() dto: UpdateEconomicEventDto,
        @Req() req: any
    ) {
        const adminEmail = req.admin?.email || 'ADMIN';
        return this.calendarService.updateEvent(id, dto, adminEmail);
    }

    @Post(':id/complete')
    async completeEvent(
        @Param('id') id: string,
        @Body() dto: CompleteEventDto,
        @Req() req: any
    ) {
        const adminEmail = req.admin?.email || 'ADMIN';
        return this.calendarService.completeEvent(id, dto.actual, adminEmail);
    }

    @Post(':id/cancel')
    async cancelEvent(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const adminEmail = req.admin?.email || 'ADMIN';
        return this.calendarService.cancelEvent(id, adminEmail);
    }

    @Post(':id/postpone')
    async postponeEvent(
        @Param('id') id: string,
        @Body() dto: PostponeEventDto,
        @Req() req: any
    ) {
        const adminEmail = req.admin?.email || 'ADMIN';
        return this.calendarService.postponeEvent(id, dto.newEventDate, adminEmail);
    }

    @Post(':id/duplicate')
    async duplicateEvent(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const adminEmail = req.admin?.email || 'ADMIN';
        return this.calendarService.duplicateEvent(id, adminEmail);
    }

    @Delete(':id')
    async deleteEvent(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const adminEmail = req.admin?.email || 'ADMIN';
        return this.calendarService.deleteEvent(id, adminEmail);
    }
}
