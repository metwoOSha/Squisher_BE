import { ApiProperty } from '@nestjs/swagger';
import { LinkDto } from './link.dto.js';

export class LinkWithClicksDto extends LinkDto {
    @ApiProperty({ description: 'Total clicks recorded for this link', example: 12 })
    clicks: number;
}
