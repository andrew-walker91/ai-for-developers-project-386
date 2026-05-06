import { useState, useEffect } from 'react';
import {
  Title, Text, Table, Button, Badge, Group, Stack, Card, Modal,
  TextInput, NumberInput, Textarea, LoadingOverlay,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api, type Booking, type EventType } from '@/api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [creating, setCreating] = useState(false);

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

  const refreshData = () => {
    Promise.all([api.getBookings(), api.getEventTypes()])
      .then(([b, et]) => {
        setBookings(b);
        setEventTypes(et);
      })
      .catch((e: unknown) => {
        notifications.show({ title: 'Ошибка', message: (e as Error).message, color: 'red' });
      });
  };

  const handleCreateEventType = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.createEventType({ name: newName, description: newDesc, durationMinutes: newDuration });
      notifications.show({ title: 'Создано', message: 'Тип события создан', color: 'green' });
      setNewName('');
      setNewDesc('');
      setNewDuration(30);
      setModalOpened(false);
      refreshData();
    } catch (e: unknown) {
      notifications.show({ title: 'Ошибка', message: (e as Error).message, color: 'red' });
    } finally {
      setCreating(false);
    }
  };

  const getEventTypeName = (id: string) => eventTypes.find((et) => et.id === id)?.name ?? id;

  return (
    <Stack gap="xl" py="xl">
      <LoadingOverlay visible={loading} />

      <Group justify="space-between">
        <Title order={2}>Админка</Title>
        <Button onClick={() => setModalOpened(true)}>+ Тип события</Button>
      </Group>

      <Title order={3}>Предстоящие встречи</Title>
      {bookings.length === 0 && !loading ? (
        <Text c="dimmed">Нет бронирований</Text>
      ) : (
        <Table striped highlightOnHover>
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
      <Group>
        {eventTypes.map((et) => (
          <Card key={et.id} shadow="sm" padding="md" radius="md" withBorder>
            <Text fw={600}>{et.name}</Text>
            <Text size="sm" c="dimmed">{et.description}</Text>
            <Badge color="blue" variant="light" mt="xs">{et.durationMinutes} мин</Badge>
          </Card>
        ))}
      </Group>

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Новый тип события">
        <Stack gap="md">
          <TextInput label="Название" required value={newName} onChange={(e) => setNewName(e.currentTarget.value)} />
          <Textarea label="Описание" value={newDesc} onChange={(e) => setNewDesc(e.currentTarget.value)} />
          <NumberInput label="Длительность (мин)" min={5} value={newDuration} onChange={(v) => setNewDuration(Number(v) || 30)} />
          <Button fullWidth loading={creating} onClick={handleCreateEventType}>
            Создать
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
