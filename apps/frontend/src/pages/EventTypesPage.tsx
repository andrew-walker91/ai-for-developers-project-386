import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Text, Card, SimpleGrid, Badge, Button, Group, Stack, Avatar, LoadingOverlay } from '@mantine/core';
import { showError } from '@/api/notifications';
import { api, type EventType } from '@/api/client';

const OWNER = { name: 'Андрейка', role: 'Владелец календаря', avatar: '/avatar.jpg' };

export const EventTypesPage = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getEventTypes()
      .then(setEventTypes)
      .catch((e) => showError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack gap="xl" py={{ base: 'sm', md: 'md' }}>
      <LoadingOverlay visible={loading} />

      <Group>
        <Avatar size={52} radius="xl" src={OWNER.avatar} />
        <Stack gap={0}>
          <Title order={3}>{OWNER.name}</Title>
          <Text size="sm" c="dimmed">{OWNER.role}</Text>
        </Stack>
      </Group>

      <Stack gap="xs">
        <Title order={2}>Выберите тип встречи</Title>
        <Text c="dimmed" maw={620}>
          Доступны короткие консультации, подробные интервью и длинные стратегические встречи. Выберите формат, который лучше подходит под задачу.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {eventTypes.map((et) => (
          <Card
            key={et.id}
            padding="lg"
            h="100%"
            style={{
              background: '#ffffff',
              borderColor: 'rgba(28, 42, 65, 0.08)',
            }}
          >
            <Stack h="100%" justify="space-between">
              <div>
                <Group justify="space-between" wrap="nowrap" gap="xs" mb="xs">
                  <Text fw={700} fz="lg" style={{ flex: 1, minWidth: 0 }}>{et.name}</Text>
                  <Badge
                    color="blue"
                    variant="filled"
                    px="sm"
                    py={12}
                    styles={{ root: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' } }}
                  >
                    {et.durationMinutes} мин
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">{et.description}</Text>
              </div>
              <Button fullWidth variant="filled" onClick={() => navigate(`/event-types/${et.id}/slots`)}>
                Выбрать время
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {eventTypes.length === 0 && !loading && (
        <Text c="dimmed" ta="center">Нет доступных типов встреч</Text>
      )}
    </Stack>
  );
}
