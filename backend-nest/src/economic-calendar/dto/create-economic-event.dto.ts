import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { EconomicEventCategory, EconomicEventImpact, EconomicEventStatus } from '../entities/economic-event.entity';

export class CreateEconomicEventDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
    currency: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    country?: string;

    @IsDateString()
    @IsNotEmpty()
    eventDate: string;

    @IsEnum(EconomicEventImpact)
    @IsNotEmpty()
    impact: EconomicEventImpact;

    @IsEnum(EconomicEventCategory)
    @IsNotEmpty()
    category: EconomicEventCategory;

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
