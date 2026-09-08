import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CompleteEventDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    actual: string;
}
