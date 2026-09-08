import { IsString, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { EconomicEventCategory, EconomicEventImpact, EconomicEventStatus } from '../entities/economic-event.entity';

export class UpdateEconomicEventDto {
    @IsString()
    @IsOptional()
    @MaxLength(255)
    title?: string;

    @IsString()
    @IsOptional()
    @MaxLength(10)
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
    currency?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    country?: string;

    @IsDateString()
    @IsOptional()
    eventDate?: string;

    @IsEnum(EconomicEventImpact)
    @IsOptional()
    impact?: EconomicEventImpact;

    @IsEnum(EconomicEventCategory)
    @IsOptional()
    category?: EconomicEventCategory;

    @IsEnum(EconomicEventStatus)
    @IsOptional()
    status?: EconomicEventStatus;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    actual?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    forecast?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    previous?: string;

    @IsString()
    @IsOptional()
    @MaxLength(30)
    unit?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
