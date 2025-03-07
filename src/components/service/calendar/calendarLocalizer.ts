
import { dateFnsLocalizer } from "react-big-calendar";
import { format, parse, getDay, getMonth, getYear, startOfWeek, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

// Set up calendar localizer with Turkish locale
const locales = {
  'tr': tr
};

export const getTurkishLocalizer = () => {
  return dateFnsLocalizer({
    format,
    parse: (value: string) => parseISO(value),
    startOfWeek: () => startOfWeek(new Date(), { locale: tr }),
    getDay,
    getMonth,
    getYear,
    locales,
  });
};

export const turkishMessages = {
  today: 'Bugün',
  previous: 'Önceki',
  next: 'Sonraki',
  month: 'Ay',
  week: 'Hafta',
  day: 'Gün',
  agenda: 'Ajanda',
  date: 'Tarih',
  time: 'Saat',
  event: 'Etkinlik',
  allDay: 'Tüm gün',
  noEventsInRange: 'Bu aralıkta servis talebi yok'
};
