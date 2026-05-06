import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme, Badge, Button, Card, Paper } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { EventTypesPage } from './pages/EventTypesPage';
import { SlotsPage } from './pages/SlotsPage';
import { AdminPage } from './pages/AdminPage';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'xl',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  colors: {
    black: ['#ffffff', '#f2f2f2', '#e6e6e6', '#d9d9d9', '#cccccc', '#bfbfbf', '#b3b3b3', '#a6a6a6', '#999999', '#333333'],
  },
  headings: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '3.15rem', lineHeight: '1.02' },
      h2: { fontSize: '2.15rem', lineHeight: '1.08' },
      h3: { fontSize: '1.45rem', lineHeight: '1.14' },
    },
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        radius: 'xl',
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: 'transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease, border-color 140ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 22px rgba(24, 88, 182, 0.14)',
          },
        },
      },
    }),
    Card: Card.extend({
      defaultProps: {
        radius: 'xl',
        withBorder: true,
        shadow: 'sm',
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        radius: 'xl',
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        radius: 'xl',
      },
    }),
  },
});

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
