// hcf-painel/src/features/login/services/NotificationService.ts

import { notification } from 'antd';
import { ApiError } from '../../../@types/components';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public showErrorNotification(error: ApiError): void {
    if (error.codigo === 400 || error.codigo === 422) {
      this.showWarningNotification('Falha', error.mensagem);
    } else {
      this.showErrorNotificationMessage('Falha', 'Houve um problema ao realizar o login, tente novamente.');
    }
  }

  private showWarningNotification(message: string, description: string): void {
    notification.warning({
      message,
      description
    });
  }

  private showErrorNotificationMessage(message: string, description: string): void {
    notification.error({
      message,
      description
    });
  }
}