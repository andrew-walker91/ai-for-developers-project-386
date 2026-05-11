import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Text, Card, Badge, Button, Group, Stack, SimpleGrid, Grid,
  TextInput, Avatar, LoadingOverlay, Divider, Paper, ThemeIcon, Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { showSuccess, showError } from '@/api/notifications';
import { api, type EventType, type Slot } from '@/api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const OWNER = { name: 'Андрейка', role: 'Владелец календаря', avatar: '/avatar.jpg' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SlotsPage = () => {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
          showError((e as Error).message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [eventTypeId]);

  useEffect(() => {
    if (!eventTypeId || !selectedDate) return;
    let cancelled = false;
    api.getSlots(eventTypeId, dayjs(selectedDate).format('YYYY-MM-DD'))
      .then((data) => {
        if (!cancelled) {
          setSlots(Array.isArray(data) ? data : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          showError((e as Error).message);
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
  const cardBg = useMemo(() => colorScheme === 'dark'
    ? 'linear-gradient(180deg, rgba(26,27,30,0.98) 0%, rgba(22,23,26,0.98) 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', [colorScheme]);
  const selectedSlotBg = useMemo(() => colorScheme === 'dark'
    ? 'linear-gradient(135deg, rgba(18, 94, 179, 0.15) 0%, rgba(28, 126, 214, 0.22) 100%)'
    : 'linear-gradient(135deg, rgba(18, 94, 179, 0.06) 0%, rgba(28, 126, 214, 0.10) 100%)', [colorScheme]);

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
      showSuccess('Встреча забронирована!');
      navigate('/');
    } catch (e: unknown) {
      showError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [selectedSlot, eventTypeId, navigate, trimmedGuestEmail, trimmedGuestName]);

  const formatTime = (iso: string) => dayjs(iso).format('HH:mm');
  const formatWeekday = (date: string) => {
    const weekday = dayjs(date).locale('ru').format('dddd');
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  };

  if (!eventType && !loading) {
    return <Text c="dimmed">Тип события не найден</Text>;
  }

  return (
    <Stack gap="md" py={0}>
      <LoadingOverlay visible={loading} />

      <Group mb={0}>
        <Button variant="subtle" onClick={() => navigate('/event-types')}>← Назад</Button>
      </Group>

      <Grid align="flex-start" gap="lg">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Stack gap="md">
            <Card padding="lg" style={{ background: cardBg }}>
              <Group>
                <Avatar size={44} radius="xl" src={OWNER.avatar} />
                <Stack gap={0}>
                  <Text fw={700}>{OWNER.name}</Text>
                  <Text size="xs" c="dimmed">{OWNER.role}</Text>
                </Stack>
              </Group>
            </Card>
            {eventType && (
              <Card padding="lg" style={{ background: cardBg }}>
                <Text fw={700} fz="lg" mb="xs">{eventType.name}</Text>
                <Text size="sm" c="dimmed" mb="md" lh={1.6}>{eventType.description}</Text>
                <Badge
                    color="blue"
                    variant="filled"
                    px="sm"
                    py={12}
                    styles={{ root: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' } }}
                  >
                    {eventType.durationMinutes} мин
                  </Badge>
              </Card>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card padding="lg" style={{ background: cardBg }}>
            <Text fw={700} mb="md">Выберите дату</Text>
            <DatePicker
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              excludeDate={(date: string) => {
                const d = dayjs(date).day();
                return d === 0 || d === 6;
              }}
              minDate={new Date()}
              maxDate={dayjs().add(14, 'day').toDate()}
              defaultLevel="month"
              maxLevel="month"
              fullWidth
            />
            <Text size="xs" c="dimmed" mt="sm" ta="center">
              Запись доступна на ближайшие 14 дней
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card padding="lg" style={{ background: cardBg }}>
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
                    background: selectedSlotBg,
                    border: colorScheme === 'dark' ? '1px solid rgba(18, 94, 179, 0.3)' : '1px solid rgba(18, 94, 179, 0.12)',
                  }}
                >
                  <Group align="flex-start" wrap="nowrap" gap="sm">
                    <ThemeIcon size={36} radius="xl" variant="light" color="blue">✓</ThemeIcon>
                    <Stack gap={2}>
                      <Text fw={600} fz="md">Вы выбрали слот</Text>
                      <Text size="sm" c="dimmed">Проверьте дату и время перед подтверждением.</Text>
                      <Text mt="sm" size="sm" c="gray.7">
                        {selectedDate ? `${formatWeekday(selectedDate)}, ${dayjs(selectedDate).locale('ru').format('D MMMM YYYY')}` : ''}
                      </Text>
                      <Text fw={700} fz="xl">{formatTime(selectedSlot.startTime)} — {formatTime(selectedSlot.endTime)}</Text>
                    </Stack>
                  </Group>
                </Paper>

                <Divider label="Ваши данные" labelPosition="center" />

                <Stack gap="md">
                  <TextInput
                    label="Имя и фамилия"
                    placeholder="например, Даша Поздина"
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
