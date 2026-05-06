import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Text, Card, Badge, Button, Group, Stack, SimpleGrid, Grid,
  TextInput, Avatar, LoadingOverlay, Divider, Paper, ThemeIcon, Tooltip,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { api, type EventType, type Slot } from '@/api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const OWNER = { name: 'Андрейка', role: 'Владелец календаря', avatar: '/avatar.jpg' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SlotsPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const trimmedGuestName = guestName.trim();
  const trimmedGuestEmail = guestEmail.trim();
  const nameError = !nameTouched
    ? null
    : trimmedGuestName.length === 0
      ? 'Укажите имя и фамилию'
      : trimmedGuestName.length < 2
        ? 'Укажите имя и фамилию хотя бы из 2 символов'
        : null;
  const emailError = !emailTouched
    ? null
    : trimmedGuestEmail.length === 0
      ? 'Укажите email'
      : !EMAIL_PATTERN.test(trimmedGuestEmail)
        ? 'Введите корректный email, чтобы получить подтверждение'
        : null;

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
    setNameTouched(true);
    setEmailTouched(true);

    if (trimmedGuestName.length < 2) {
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedGuestEmail)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.createBooking({
        eventTypeId,
        slotId: selectedSlot.id,
        guestName: trimmedGuestName,
        guestEmail: trimmedGuestEmail,
      });
      notifications.show({ title: 'Успешно', message: 'Встреча забронирована!', color: 'green' });
      navigate('/');
    } catch (e: unknown) {
      notifications.show({ title: 'Ошибка', message: (e as Error).message, color: 'red' });
    } finally {
      setSubmitting(false);
    }
  }, [selectedSlot, eventTypeId, navigate, trimmedGuestEmail, trimmedGuestName]);

  const formatTime = (iso: string) => dayjs(iso).format('HH:mm');
  const formatDate = (dateStr: string) => dayjs(dateStr).format('DD.MM.YYYY');
  const formatWeekday = (dateStr: string) => {
    const weekday = dayjs(dateStr).locale('ru').format('dddd');
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  };

  if (!eventType && !loading) {
    return <Text c="dimmed">Тип события не найден</Text>;
  }

  return (
    <Stack gap="lg" py={{ base: 0, md: 'xs' }}>
      <LoadingOverlay visible={loading} />

      <Group mb={0}>
        <Button variant="subtle" onClick={() => navigate('/event-types')}>← Назад</Button>
      </Group>

      <Grid align="flex-start" gap="lg">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Stack gap="md">
            <Card padding="lg" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
              <Group>
                <Avatar size={44} radius="xl" src={OWNER.avatar} />
                <Stack gap={0}>
                  <Text fw={700}>{OWNER.name}</Text>
                  <Text size="xs" c="dimmed">{OWNER.role}</Text>
                </Stack>
              </Group>
            </Card>
            {eventType && (
              <Card padding="lg" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
                <Text fw={700} fz="lg" mb="xs">{eventType.name}</Text>
                <Text size="sm" c="dimmed" mb="md" lh={1.6}>{eventType.description}</Text>
<Badge
                    color="blue"
                    variant="filled"
                    px="sm"
                    py={12}
                    styles={{ root: { fontSize: 13, fontWeight: 800, textAlign: 'center', minWidth: 48 } }}
                  >
                    {eventType.durationMinutes} мин
                  </Badge>
              </Card>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
            <Text fw={700} mb="md">Выберите дату</Text>
            <DatePicker
              value={selectedDate || null}
              onChange={(date) => {
                if (date === null) {
                  setSelectedDate('');
                  setSelectedSlot(null);
                  return;
                }

                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              minDate={new Date()}
              maxDate={dayjs().add(14, 'day').toDate()}
              defaultLevel="month"
              maxLevel="month"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card padding="lg" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)' }}>
            <Text fw={700} mb="md">Доступные слоты</Text>
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
                  size="sm"
                  variant={selectedSlot?.id === slot.id ? 'filled' : 'light'}
                  color={selectedSlot?.id === slot.id ? 'blue' : 'dark'}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {formatTime(slot.startTime)}
                </Button>
              ))}
            </SimpleGrid>
            {unavailableSlots.length > 0 && (
              <>
                <Divider label="Занято" labelPosition="center" mt="lg" mb="sm" />
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
                  {unavailableSlots.map((slot) => (
                    <Tooltip key={slot.id} label="Этот слот уже занят" withArrow>
                      <span>
                        <Button size="sm" variant="default" disabled fullWidth>
                          {formatTime(slot.startTime)}
                        </Button>
                      </span>
                    </Tooltip>
                  ))}
                </SimpleGrid>
              </>
            )}

            {selectedSlot && (
              <Stack gap="md" mt="xl">
                <Paper
                  p="lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(18, 94, 179, 0.09) 0%, rgba(28, 126, 214, 0.14) 100%)',
                    border: '1px solid rgba(18, 94, 179, 0.16)',
                  }}
                >
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon size={42} radius="xl" variant="filled" color="blue">✓</ThemeIcon>
                    <Stack gap={4}>
                      <Text fw={800} fz="lg">Вы выбрали слот</Text>
                      <Text size="sm" c="dimmed">Проверьте дату и время перед подтверждением.</Text>
                      <Text size="sm" fw={600} c="blue.7">{formatWeekday(selectedDate)}</Text>
                      <Text fw={800} fz="1.45rem">{formatDate(selectedDate)}</Text>
                      <Text fz="lg" fw={600}>{formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}</Text>
                    </Stack>
                  </Group>
                </Paper>

                <Divider label="Ваши данные" labelPosition="center" />

                <Stack gap="md">
                  <TextInput
                    label="Имя и фамилия"
                    placeholder="Например, Анна Петрова"
                    value={guestName}
                    onChange={(e) => setGuestName(e.currentTarget.value)}
                    onBlur={() => setNameTouched(true)}
                    error={nameError}
                    required
                  />
                  <TextInput
                    label="Email"
                    placeholder="email@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.currentTarget.value)}
                    onBlur={() => setEmailTouched(true)}
                    error={emailError}
                    required
                  />
                </Stack>

                <Button fullWidth size="md" loading={submitting} onClick={handleBooking}>
                  Подтвердить запись
                </Button>
              </Stack>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
