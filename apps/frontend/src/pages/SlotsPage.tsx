import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Text, Card, Badge, Button, Group, Stack, SimpleGrid,
  TextInput, Avatar, LoadingOverlay, Divider,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { api, type EventType, type Slot } from '@/api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const OWNER = { name: 'Андрейка', role: 'Владелец календаря' };

export function SlotsPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!eventTypeId) return;
    let cancelled = false;
    api.getEventType(eventTypeId)
      .then((data) => {
        if (!cancelled) {
          setEventType(data as EventType);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          notifications.show({ title: 'Ошибка', message: (e as Error).message, color: 'red' });
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [eventTypeId]);

  useEffect(() => {
    if (!eventTypeId || !selectedDate) return;
    let cancelled = false;
    api.getSlots(eventTypeId, selectedDate)
      .then((data) => {
        if (!cancelled) {
          setSlots(Array.isArray(data) ? data : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          notifications.show({ title: 'Ошибка', message: (e as Error).message, color: 'red' });
          setSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [eventTypeId, selectedDate]);

  const availableSlots = useMemo(() => slots.filter((s) => s.isAvailable), [slots]);
  const unavailableSlots = useMemo(() => slots.filter((s) => !s.isAvailable), [slots]);

  const handleBooking = useCallback(async () => {
    if (!selectedSlot || !eventTypeId) return;
    if (guestName.length < 2) {
      notifications.show({ title: 'Ошибка', message: 'Имя должно быть не менее 2 символов', color: 'red' });
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(guestEmail)) {
      notifications.show({ title: 'Ошибка', message: 'Введите корректный email', color: 'red' });
      return;
    }
    setSubmitting(true);
    try {
      await api.createBooking({ eventTypeId, slotId: selectedSlot.id, guestName, guestEmail });
      notifications.show({ title: 'Успешно', message: 'Встреча забронирована!', color: 'green' });
      navigate('/');
    } catch (e: unknown) {
      notifications.show({ title: 'Ошибка', message: (e as Error).message, color: 'red' });
    } finally {
      setSubmitting(false);
    }
  }, [selectedSlot, eventTypeId, guestName, guestEmail, navigate]);

  const formatTime = (iso: string) => dayjs(iso).format('HH:mm');
  const formatDate = (dateStr: string) => dayjs(dateStr).format('DD.MM.YYYY');

  if (!eventType && !loading) {
    return <Text c="dimmed">Тип события не найден</Text>;
  }

  return (
    <Stack gap="xl" py="xl">
      <LoadingOverlay visible={loading} />

      <Group>
        <Button variant="subtle" onClick={() => navigate('/event-types')}>← Назад</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Stack gap="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <Avatar size={40} radius="xl" color="blue">{OWNER.name[0]}</Avatar>
              <Stack gap={0}>
                <Text fw={600}>{OWNER.name}</Text>
                <Text size="xs" c="dimmed">{OWNER.role}</Text>
              </Stack>
            </Group>
          </Card>
          {eventType && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text fw={600} mb="xs">{eventType.name}</Text>
              <Text size="sm" c="dimmed" mb="xs">{eventType.description}</Text>
              <Badge color="blue" variant="light">{eventType.durationMinutes} мин</Badge>
            </Card>
          )}
          {selectedDate && (
            <Text size="sm" c="dimmed">Дата: {formatDate(selectedDate)}</Text>
          )}
          {selectedSlot && (
            <Text size="sm">Время: {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}</Text>
          )}
        </Stack>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Выберите дату</Text>
          <DatePicker
            value={selectedDate || null}
            onChange={(date) => {
              if (date === null) {
                setSelectedDate('');
                return;
              }

              setSelectedDate(date);
            }}
            minDate={new Date()}
            maxDate={dayjs().add(14, 'day').toDate()}
            defaultLevel="month"
            maxLevel="month"
          />
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} mb="md">Доступные слоты</Text>
          {!selectedDate && !loading && (
            <Text size="sm" c="dimmed">Выберите дату, чтобы увидеть слоты</Text>
          )}
          {selectedDate && availableSlots.length === 0 && !loading && (
            <Text size="sm" c="dimmed">Нет свободных слотов на эту дату</Text>
          )}
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
            {availableSlots.map((slot) => (
              <Button
                key={slot.id}
                size="xs"
                variant={selectedSlot?.id === slot.id ? 'filled' : 'light'}
                onClick={() => setSelectedSlot(slot)}
              >
                {formatTime(slot.startTime)}
              </Button>
            ))}
          </SimpleGrid>
          {unavailableSlots.length > 0 && (
            <>
              <Divider label="Занято" labelPosition="center" mt="md" />
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
                {unavailableSlots.map((slot) => (
                  <Button key={slot.id} size="xs" variant="default" disabled>
                    {formatTime(slot.startTime)} (занято)
                  </Button>
                ))}
              </SimpleGrid>
            </>
          )}

          {selectedSlot && (
            <>
              <Divider label="Ваши данные" labelPosition="center" my="sm" />
              <TextInput
                label="Имя"
                placeholder="Введите имя"
                value={guestName}
                onChange={(e) => setGuestName(e.currentTarget.value)}
                required
              />
              <TextInput
                label="Email"
                placeholder="email@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.currentTarget.value)}
                required
              />
              <Button fullWidth loading={submitting} onClick={handleBooking}>
                Забронировать
              </Button>
            </>
          )}
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
