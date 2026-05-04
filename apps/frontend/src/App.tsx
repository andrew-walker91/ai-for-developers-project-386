import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { EventTypesPage } from './pages/EventTypesPage';
import { SlotsPage } from './pages/SlotsPage';
import { AdminPage } from './pages/AdminPage';

const theme = createTheme({ primaryColor: 'blue' });

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/event-types" element={<EventTypesPage />} />
            <Route path="/event-types/:eventTypeId/slots" element={<SlotsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}
