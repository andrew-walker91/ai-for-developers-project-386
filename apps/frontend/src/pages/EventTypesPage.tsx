import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Text, Card, SimpleGrid, Badge, Button, Group, Stack, Avatar, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api, type EventType } from '@/api/client';

const OWNER = { name: 'Tota', role: 'Владелец календаря' };

export function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getEventTypes()
      .then(setEventTypes)
      .catch((e) => notifications.show({ title: 'Ошибка', message: e.message, color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack gap="xl" py="xl">
      <LoadingOverlay visible={loading} />

      <Group>
        <Avatar size={48} radius="xl" color="blue">{OWNER.name[0]}</Avatar>
        <Stack gap={0}>
          <Title order={3}>{OWNER.name}</Title>
          <Text size="sm" c="dimmed">{OWNER.role}</Text>
        </Stack>
      </Group>

      <Title order={2}>Выберите тип встречи</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {eventTypes.map((et) => (
          <Card key={et.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={600}>{et.name}</Text>
              <Badge color="blue" variant="light">{et.durationMinutes} мин</Badge>
            </Group>
            <Text size="sm" c="dimmed" mb="md">{et.description}</Text>
            <Button fullWidth variant="light" onClick={() => navigate(`/event-types/${et.id}/slots`)}>
              Выбрать время
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      {eventTypes.length === 0 && !loading && (
        <Text c="dimmed" ta="center">Нет доступных типов встреч</Text>
      )}
    </Stack>
  );
}
