
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";

// Create a pre-configured localizer with moment
export const localizer = momentLocalizer(moment);

// Messages for Turkish localization
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
  event: 'Olay',
  allDay: 'Tüm gün',
  noEventsInRange: 'Bu aralıkta servis talebi yok'
};
