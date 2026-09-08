import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, IsPositive } from 'class-validator';
import { TransactionType } from '../account-transaction.entity';

export class CreateTransactionDto {
    @IsEnum(TransactionType)
    type: TransactionType;

    @IsNumber()
    @IsPositive()
    amount: number;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
