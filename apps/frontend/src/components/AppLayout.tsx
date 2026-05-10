import { Outlet, Link } from 'react-router-dom';
import { AppShell, Group, Anchor, Button, Container } from '@mantine/core';

export function AppLayout() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,251,0.98) 100%)',
          borderBottom: '1px solid rgba(28, 42, 65, 0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Anchor component={Link} to="/" fz="xl" fw={800} underline="never" c="dark.8">
              Hexlet Calendar
            </Anchor>
            <Group gap="sm">
              <Button
                variant="light"
                color="dark"
                component={Link}
                to="/event-types"
                style={{ background: 'rgba(28, 42, 65, 0.07)' }}
              >
                Записаться
              </Button>
              <Button variant="filled" component={Link} to="/admin">
                Админка
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" pt={6} pb={{ base: 'sm', md: 'md' }}>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
