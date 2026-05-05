import type { components } from './schema';

type EventType = components['schemas']['EventType'];
type CreateEventType = components['schemas']['CreateEventType'];
type Slot = components['schemas']['Slot'];
type Booking = components['schemas']['Booking'];
type CreateBooking = components['schemas']['CreateBooking'];
type Error = components['schemas']['Error'];

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

function isApiError(data: unknown): data is Error {
  return typeof data === 'object' && data !== null && 'code' in data && 'message' in data;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || isApiError(data)) {
    throw new Error(isApiError(data) ? data.message : `HTTP ${res.status}`);
  }
  return data as T;
}

function adminHeaders(): Record<string, string> {
  return ADMIN_SECRET ? { 'X-Admin-Secret': ADMIN_SECRET } : {};
}

export const api = {
  getEventTypes: () => request<EventType[]>('/api/event-types'),

  getEventType: (id: string) => request<EventType>(`/api/event-types/${id}`),

  createEventType: (data: CreateEventType) =>
    request<EventType>('/api/event-types', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: adminHeaders(),
    }),

  getSlots: (eventTypeId: string, date: string) =>
    request<Slot[]>(`/api/slots?eventTypeId=${eventTypeId}&date=${date}`),

  createBooking: (data: CreateBooking) =>
    request<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getBookings: () =>
    request<Booking[]>('/api/bookings', { headers: adminHeaders() }),

  deleteBooking: (id: string) =>
    fetch(`/api/bookings/${id}`, { method: 'DELETE', headers: adminHeaders() }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),
};

export type { EventType, CreateEventType, Slot, Booking, CreateBooking };
