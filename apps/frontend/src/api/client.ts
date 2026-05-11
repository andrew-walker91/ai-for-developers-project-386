import type { components } from './schema';

type EventType = components['schemas']['EventType'];
type Slot = components['schemas']['Slot'];
type Booking = components['schemas']['Booking'];
type CreateBooking = components['schemas']['CreateBooking'];
type Error = components['schemas']['Error'];

function isApiError(data: unknown): data is Error {
  return typeof data === 'object' && data !== null && 'code' in data && 'message' in data;
}

const TOKEN_KEY = 'admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: options?.method,
    body: options?.body,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (res.status === 204) {
    return undefined as T;
  }
  if (res.status === 401) {
    clearAdminToken();
    window.location.href = '/admin/login';
    throw new Error('Сессия истекла, войдите заново');
  }
  const data = await res.json();
  if (!res.ok || isApiError(data)) {
    throw new Error(isApiError(data) ? data.message : `HTTP ${res.status}`);
  }
  return data as T;
}

function adminHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request<unknown>('/api/admin/logout', {
      method: 'POST',
      headers: adminHeaders(),
    }),

  getEventTypes: () => request<EventType[]>('/api/event-types'),

  getEventType: (id: string) => request<EventType>(`/api/event-types/${id}`),

  getSlots: (eventTypeId: string, date: string) =>
    request<Slot[]>(`/api/slots?eventTypeId=${eventTypeId}&date=${date}`),

  createBooking: (data: CreateBooking) =>
    request<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getBookings: () =>
    request<Booking[]>('/api/bookings', { headers: adminHeaders() }),

  deleteBooking: (id: string) =>
    request<unknown>(`/api/bookings/${id}`, { method: 'DELETE', headers: adminHeaders() }),
};

export type { EventType, Slot, Booking, CreateBooking };
