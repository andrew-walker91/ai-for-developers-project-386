import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, TextInput, PasswordInput, Button, Stack, Card, Center } from '@mantine/core';
import { showError } from '@/api/notifications';
import { api, setAdminToken } from '@/api/client';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await api.login(username, password);
      setAdminToken(token);
      navigate('/admin', { replace: true });
    } catch {
      showError('Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="60vh">
      <Card padding="xl" w={400} withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Title order={3} ta="center">Вход в админку</Title>
            <TextInput
              label="Имя пользователя"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Пароль"
              placeholder="admin"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={loading} fullWidth>
              Войти
            </Button>
          </Stack>
        </form>
      </Card>
    </Center>
  );
}
