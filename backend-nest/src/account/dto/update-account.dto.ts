import { IsString, IsOptional, IsNumber, IsEnum, IsObject, Min } from 'class-validator';
import { AccountType } from '../account.entity';

export class UpdateAccountDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    broker?: string;

    @IsEnum(AccountType)
    @IsOptional()
    type?: AccountType;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    initialBalance?: number;

    @IsObject()
    @IsOptional()
    propFirmRules?: {
        profitTarget?: number;
        dailyLossLimit?: number;
        maxDrawdown?: number;
        minTradingDays?: number;
        rulesDescription?: string;
        [key: string]: any;
    };
}
