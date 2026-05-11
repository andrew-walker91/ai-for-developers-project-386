import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Group, Anchor, Button, Container, Box } from '@mantine/core';
import { getAdminToken, clearAdminToken } from '@/api/client';

export const AppLayout = () => {
  const navigate = useNavigate();
  const token = getAdminToken();

  const handleLogout = () => {
    clearAdminToken();
    navigate('/');
  };

  return (
    <Box>
      <Box
        component="header"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,251,0.98) 100%)',
          borderBottom: '1px solid rgba(28, 42, 65, 0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container size="lg" h={56}>
          <Group h={56} justify="space-between" wrap="nowrap">
            <Anchor component={Link} to="/" fz="xl" fw={800} underline="never" c="dark.8">
              Hexlet Calendar
            </Anchor>
            <Group gap="xs" wrap="nowrap">
              <Button
                variant="light"
                color="dark"
                component={Link}
                to="/event-types"
                size="compact-sm"
                visibleFrom="xs"
                style={{ background: 'rgba(28, 42, 65, 0.07)' }}
              >
                Записаться
              </Button>
              <Button
                variant="light"
                color="dark"
                component={Link}
                to="/event-types"
                size="compact-sm"
                hiddenFrom="xs"
                style={{ background: 'rgba(28, 42, 65, 0.07)' }}
              >
                Запись
              </Button>
              {token ? (
                <>
                  <Button variant="filled" component={Link} to="/admin" size="compact-sm" visibleFrom="xs">
                    Админка
                  </Button>
                  <Button variant="filled" component={Link} to="/admin" size="compact-sm" hiddenFrom="xs">
                    Админ
                  </Button>
                  <Button variant="outline" color="red" onClick={handleLogout} size="compact-sm" visibleFrom="xs">
                    Выйти
                  </Button>
                </>
              ) : (
                <Button variant="filled" component={Link} to="/admin/login" size="compact-sm">
                  Админка
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </Box>

      <Container size="lg" py="md">
        <Outlet />
      </Container>
    </Box>
  );
}
