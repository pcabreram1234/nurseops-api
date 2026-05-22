import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResolveOperationalAlertDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: 'The clinical resolution note must be at least 10 characters long.' })
    resolutionNotes!: string;

    @IsString()
    @IsNotEmpty()
    resolvedById!: string;
}