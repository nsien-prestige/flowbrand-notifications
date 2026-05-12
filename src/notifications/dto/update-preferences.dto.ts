import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdatePreferencesDto {
    @ApiPropertyOptional({ description: 'Enable or disable all in-app notifications for a user', example: true })
    @IsOptional()
    @IsBoolean()
    general_enabled?: boolean;

    @ApiPropertyOptional({ description: 'Enable or disable all email notifications for a user', example: true })
    @IsOptional()
    @IsBoolean()
    push_email_enabled?: boolean;
}