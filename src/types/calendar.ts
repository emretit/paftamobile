
export const EVENT_TYPES = ['all', 'technical', 'sales'] as const;
export const EVENT_STATUSES = ['all', 'scheduled', 'completed', 'canceled'] as const;

export type EventTypeFilter = typeof EVENT_TYPES[number];
export type EventStatusFilter = typeof EVENT_STATUSES[number];

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  event_type: 'technical' | 'sales';
  category: string;
  status: 'scheduled' | 'completed' | 'canceled';
  assigned_to?: string;
}

export interface EventModalData {
  id?: string;
  title: string;
  start: string;
  end: string;
  description: string;
  event_type: 'technical' | 'sales';
  category: string;
  status: 'scheduled' | 'completed' | 'canceled';
  assigned_to?: string;
}

export interface DbEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
  event_type: 'technical' | 'sales';
  category: string;
  status: 'scheduled' | 'completed' | 'canceled';
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
