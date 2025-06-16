import { createEvents } from 'ics';

interface EventDetails {
  title: string;
  description: string;
  startTime: Date;
  duration: { hours: number; minutes: number };
  location: string;
}

export async function generateCalendarEvent(event: EventDetails): Promise<string> {
  return new Promise((resolve, reject) => {
    createEvents([
      {
        title: event.title,
        description: event.description,
        start: [
          event.startTime.getFullYear(),
          event.startTime.getMonth() + 1,
          event.startTime.getDate(),
          event.startTime.getHours(),
          event.startTime.getMinutes(),
        ],
        duration: { hours: event.duration.hours, minutes: event.duration.minutes },
        location: event.location,
      },
    ], (error, value) => {
      if (error) {
        reject(error);
      }
      resolve(value);
    });
  });
}