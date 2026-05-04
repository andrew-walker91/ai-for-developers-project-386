import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/ru';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DatesProvider settings={{ locale: 'ru' }}>
      <App />
    </DatesProvider>
  </StrictMode>,
);
