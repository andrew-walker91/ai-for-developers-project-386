import { useState, useEffect } from 'react';
import { Title, Text, Table, Badge, Group, Stack, Card, LoadingOverlay } from '@mantine/core';
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
      <Group align="stretch">
        {eventTypes.map((et) => (
          <Card
            key={et.id}
            padding="lg"
            maw={280}
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)',
              borderColor: 'rgba(28, 42, 65, 0.08)',
            }}
          >
            <Text fw={700} mb="xs">{et.name}</Text>
            <Text size="sm" c="dimmed" lh={1.6}>{et.description}</Text>
            <Badge color="blue" variant="light" mt="md">{et.durationMinutes} мин</Badge>
          </Card>
        ))}
      </Group>
    </Stack>
  );
}
