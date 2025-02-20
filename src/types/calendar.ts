
// Define the event types and statuses as literal types
export type EventType = 'technical' | 'sales';
export type EventStatus = 'scheduled' | 'completed' | 'canceled';

// Define the filter types separately
export type EventTypeFilter = 'all' | EventType;
export type EventStatusFilter = 'all' | EventStatus;

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  event_type: EventType;
  category: string;
  status: EventStatus;
  assigned_to?: string;
}

export interface EventModalData {
  id?: string;
  title: string;
  start: string;
  end: string;
  description: string;
  event_type: EventType;
  category: string;
  status: EventStatus;
  assigned_to?: string;
}

export interface DbEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
  event_type: EventType;
  category: string;
  status: EventStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export const EVENT_CATEGORIES = {
  technical: [
    'installation',
    'maintenance',
    'repair',
    'inspection',
    'emergency'
  ]
} as const;

// Define constants for UI rendering
export const EVENT_TYPE_OPTIONS: Array<{ value: EventTypeFilter; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'technical', label: 'Teknik' },
  { value: 'sales', label: 'Satış' }
];

export const EVENT_STATUS_OPTIONS: Array<{ value: EventStatusFilter; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'scheduled', label: 'Planlandı' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'canceled', label: 'İptal Edildi' }
];
