import { Outlet, Link } from 'react-router-dom';
import { AppShell, Group, Anchor, Button, Container } from '@mantine/core';

export function AppLayout() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Anchor component={Link} to="/" fz="xl" fw={700} underline="never" c="inherit">
              Calendar
            </Anchor>
            <Group>
              <Button variant="light" component={Link} to="/event-types">
                Записаться
              </Button>
              <Button variant="subtle" component={Link} to="/admin">
                Админка
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
