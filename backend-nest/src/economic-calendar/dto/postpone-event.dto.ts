import { IsDateString, IsNotEmpty } from 'class-validator';

export class PostponeEventDto {
    @IsDateString()
    @IsNotEmpty()
    newEventDate: string;
}
