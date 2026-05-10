import { useState, useEffect } from 'react';
import { Title, Text, Table, Badge, Group, Stack, Card, SimpleGrid, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api, type Booking, type EventType } from '@/api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getBookings(), api.getEventTypes()])
      .then(([b, et]) => {
        if (cancelled) return;
        setBookings(b);
        setEventTypes(et);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        notifications.show({ title: 'Ошибка', message: (e as Error).message, color: 'red' });
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const getEventTypeName = (id: string) => eventTypes.find((et) => et.id === id)?.name ?? id;

  return (
    <Stack gap="xl" py={{ base: 'sm', md: 'md' }}>
      <LoadingOverlay visible={loading} />

      <Group>
        <Title order={2}>Админка</Title>
      </Group>

      <Title order={3}>Предстоящие встречи</Title>
      {bookings.length === 0 && !loading ? (
        <Text c="dimmed">Нет бронирований</Text>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Гость</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Тип встречи</Table.Th>
              <Table.Th>Дата встречи</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bookings.map((b) => (
              <Table.Tr key={b.id}>
                <Table.Td>{b.guestName}</Table.Td>
                <Table.Td>{b.guestEmail}</Table.Td>
                <Table.Td>{getEventTypeName(b.eventTypeId)}</Table.Td>
                <Table.Td>{dayjs(b.startTime).format('DD.MM.YYYY HH:mm')}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Title order={3}>Типы событий</Title>
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
                <Text size="sm" c="dimmed" lh={1.6}>{et.description}</Text>
              </div>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
