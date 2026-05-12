import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as SYS_MSG from '../shared/constants/MESSAGES';
import { NotificationsService } from './notifications.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import type { Request } from 'express'
import { SkipAuth } from 'src/shared/decorators/skip-auth.decorator';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @ApiOperation({ summary: "List the authenticated user's notifications" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: SYS_MSG.REQUEST_SUCCESSFUL })
  async list(
    @Req() request: Request,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    const user = request['user'] as { id: string };
    return this.notificationsService.listForUser(user.id, Number(page) || 1, Number(limit) || 10);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: HttpStatus.OK, description: SYS_MSG.REQUEST_SUCCESSFUL })
  async markRead(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request) {
    const user = request['user'] as { id: string };
    return this.notificationsService.markRead(id, user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: "Update the authenticated user's notification preferences" })
  @ApiResponse({ status: HttpStatus.OK, description: SYS_MSG.PREFERENCES_UPDATED })
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  async updatePreference(@Req() req: Request, @Body() dto: UpdatePreferencesDto) {
    const user = req['user'] as { id: string };
    return this.notificationsService.updatePreferences(user.id, dto)
  }

  @Get('preferences')
  @ApiOperation({ summary: "Get the authenticated user's notification preferences" })
  @ApiResponse({ status: HttpStatus.OK, description: SYS_MSG.PREFERENCES_FETCHED })
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  async getPreferences(@Req() req: Request) {
      const user = req['user'] as { id: string };
      return this.notificationsService.getPreferences(user.id);
   }
}
