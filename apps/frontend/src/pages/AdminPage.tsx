import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Text, Table, Button, Group, Stack, LoadingOverlay, Modal, ScrollArea } from '@mantine/core';
import { showSuccess, showError } from '@/api/notifications';
import { api, getAdminToken, type Booking, type EventType } from '@/api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export const AdminPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate('/admin/login', { replace: true });
      return;
    }
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
        showError((e as Error).message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [navigate]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteBooking(deleteTarget.id);
      showSuccess('Встреча удалена');
      setDeleteTarget(null);
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    } catch (e: unknown) {
      showError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const getEventTypeName = (id: string) => eventTypes.find((et) => et.id === id)?.name ?? id;

  return (
    <Stack gap="xl" py={{ base: 'sm', md: 'md' }}>
      <LoadingOverlay visible={loading} />

      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Подтверждение удаления"
        centered
      >
        {deleteTarget && (
          <Stack gap="md">
            <Text size="sm">
              Вы уверены, что хотите удалить встречу <b>{deleteTarget.guestName}</b>{' '}
              на {dayjs(deleteTarget.startTime).format('DD.MM.YYYY HH:mm')}?
            </Text>
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setDeleteTarget(null)}>
                Отмена
              </Button>
              <Button color="red" loading={deleting} onClick={handleDelete}>
                Удалить
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Group>
        <Title order={2}>Админка</Title>
      </Group>

      <Title order={3}>Предстоящие встречи</Title>
      {bookings.length === 0 && !loading ? (
        <Text c="dimmed">Нет бронирований</Text>
      ) : (
        <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Гость</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Тип встречи</Table.Th>
              <Table.Th>Дата встречи</Table.Th>
              <Table.Th w={80}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bookings.map((b) => (
              <Table.Tr key={b.id}>
                <Table.Td>{b.guestName}</Table.Td>
                <Table.Td>{b.guestEmail}</Table.Td>
                <Table.Td>{getEventTypeName(b.eventTypeId)}</Table.Td>
                <Table.Td>{dayjs(b.startTime).format('DD.MM.YYYY HH:mm')}</Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => setDeleteTarget(b)}
                  >
                    Удалить
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        </ScrollArea>
      )}
    </Stack>
  );
}
