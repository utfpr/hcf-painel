import { notification } from 'antd';
import { NotificationConfig } from '../@types/components';

export const useNotification = () => {
  const showNotification = ({ type, message, description }: NotificationConfig) => {
    notification[type]({
      message,
      description
    });
  };

  return { showNotification };
};