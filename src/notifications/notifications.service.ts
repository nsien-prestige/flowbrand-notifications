import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as SYS_MSG from '../shared/constants/MESSAGES';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(NotificationPreference)
    private readonly notificationPreferenceRepository: Repository<NotificationPreference>
  ) { }

  async listForUser(userId: string, page: number, limit: number) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unread = await this.notificationRepository.count({ where: { user_id: userId, is_read: false } });
    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.REQUEST_SUCCESSFUL,
      data: {
        total_notification_count: total,
        total_unread_notification_count: unread,
        current_page: page,
        total_pages: Math.ceil(total / Math.max(limit, 1)),
        notifications,
      },
    };
  }

  async markRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({ where: { id: notificationId } });
    if (!notification || notification.user_id !== userId) {
      throw new HttpException('Notification preference not found', HttpStatus.NOT_FOUND);
    }
    notification.is_read = true;
    notification.read_at = new Date();
    await this.notificationRepository.save(notification);
    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.REQUEST_SUCCESSFUL,
      data: { id: notification.id, is_read: notification.is_read, read_at: notification.read_at },
    };
  }

  async getPreferences(userId: string) {
    let preference = await this.notificationPreferenceRepository.findOne({
      where: { user_id: userId },
    })

    if (!preference) {
      preference = this.notificationPreferenceRepository.create({
        user_id: userId,
        general_enabled: true,
        push_email_enabled: false,
      })
      await this.notificationPreferenceRepository.save(preference)
    }

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.PREFERENCES_FETCHED,
      data: {
        user_id: preference.user_id,
        general_enabled: preference.general_enabled,
        push_email_enabled: preference.push_email_enabled,
        updated_at: preference.updated_at
      }
    }
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    let preference = await this.notificationPreferenceRepository.findOne({
      where: { user_id: userId }
    })

    if (!preference) {
      preference = this.notificationPreferenceRepository.create({
        user_id: userId,
        general_enabled: true,
        push_email_enabled: false,
      })
      await this.notificationPreferenceRepository.save(preference)
    }

    if (dto.general_enabled !== undefined) {
      preference.general_enabled = dto.general_enabled
    }

    if (dto.push_email_enabled !== undefined) {
      preference.push_email_enabled = dto.push_email_enabled
    }

    await this.notificationPreferenceRepository.save(preference)

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.PREFERENCES_UPDATED,
      data: {
        user_id: preference.user_id,
        general_enabled: preference.general_enabled,
        push_email_enabled: preference.push_email_enabled,
        updated_at: preference.updated_at
      }
    }
  }
}
