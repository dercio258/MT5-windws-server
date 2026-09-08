import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsObject, Min } from 'class-validator';
import { AccountType } from '../account.entity';

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    broker: string;

    @IsEnum(AccountType)
    @IsOptional()
    type?: AccountType = AccountType.LIVE;

    @IsString()
    @IsOptional()
    currency?: string = 'USD';

    @IsNumber()
    @Min(0)
    @IsOptional()
    initialBalance?: number = 0;

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
