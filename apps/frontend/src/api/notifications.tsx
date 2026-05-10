import { notifications } from '@mantine/notifications';

const checkIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const crossIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const showSuccess = (message: string) => {
  notifications.show({
    title: 'Успешно',
    message,
    color: 'green',
    icon: checkIcon,
    withBorder: true,
    autoClose: 3000,
  });
}

export const showError = (message: string) => {
  notifications.show({
    title: 'Ошибка',
    message,
    color: 'red',
    icon: crossIcon,
    withBorder: true,
    autoClose: 5000,
  });
}
