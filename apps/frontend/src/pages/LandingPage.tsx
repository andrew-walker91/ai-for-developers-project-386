import { useEffect, useState } from 'react';
import { Title, Text, Button, Stack, SimpleGrid, Card, Paper, Badge, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { showError } from '@/api/notifications';
import { api, type EventType } from '@/api/client';

export const LandingPage = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  useEffect(() => {
    api.getEventTypes()
      .then(setEventTypes)
      .catch((e: Error) => showError(e.message));
  }, []);

  return (
    <Stack gap="xl" py={{ base: 'sm', md: 'md' }}>
      <Paper
        p={{ base: 'xl', md: '3rem' }}
        ta="center"
        style={{
          background: 'linear-gradient(135deg, #125eb3 0%, #1858b6 58%, #1c7ed6 100%)',
          boxShadow: '0 22px 48px rgba(17, 39, 77, 0.18)',
        }}
      >
        <Box mb="lg">
          <Text
            span
            fw={700}
            fz="sm"
            c="white"
            px="md"
            py={8}
            style={{
              display: 'inline-block',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: 'rgba(11, 45, 84, 0.34)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 999,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            Онлайн-запись без лишних шагов
          </Text>
        </Box>
        <Title order={1} c="white" mb="md" maw={720} mx="auto">
          Запишитесь на встречу
        </Title>
        <Text size="xl" c="white" maw={640} mx="auto" mb="xl" style={{ opacity: 0.9 }}>
          Выберите формат, найдите удобный слот и подтвердите бронь за пару минут.
        </Text>
        <Button
          size="lg"
          variant="white"
          component={Link}
          to="/event-types"
          c="blue.8"
          styles={{ root: { '&:hover': { background: '#eef4ff' } } }}
        >
          Записаться
        </Button>
      </Paper>

      <Stack gap="xs" ta="center">
        <Title order={2}>Форматы встреч</Title>
        <Text size="lg" c="dimmed" maw={720} mx="auto">
          На главной доступны все базовые сценарии: быстрая консультация, подробный разбор и длинная стратегическая сессия.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        {eventTypes.map((eventType) => (
          <Card
            key={eventType.id}
            padding="lg"
            h="100%"
            style={{
              background: '#ffffff',
              borderColor: 'rgba(28, 42, 65, 0.08)',
              textAlign: 'center',
            }}
          >
            <Stack h="100%" justify="space-between" align="center">
              <div>
                <Badge
                  color="blue"
                  variant="filled"
                  mb="lg"
                  px="sm"
                  py={12}
                  styles={{ root: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' } }}
                >
                  {eventType.durationMinutes} мин
                </Badge>
                <Text fw={700} fz="lg" mb="sm">{eventType.name}</Text>
                <Text size="sm" c="dimmed" lh={1.6}>{eventType.description}</Text>
              </div>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
