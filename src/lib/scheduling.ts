import { prisma } from "./prisma";
import { getGoogleCalendarBusySlots } from "./google-calendar";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";


/**
 * Generate all available time slots for a given host + event type + date
 */
export async function getAvailableSlots(
  hostId: string,
  eventTypeId: string,
  date: Date, // local date in host's timezone
  visitorTimezone: string
): Promise<{ start: Date; end: Date; display: string }[]> {
  // 1. Get event type details
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: { select: { timezone: true } } },
  });
  if (!eventType || !eventType.isActive) return [];

  const hostTimezone = eventType.user.timezone || "UTC";
  const duration = eventType.duration; // minutes
  const buffer = eventType.bufferTime || 0;

  // 2. Get day of week in host's timezone
  const hostDate = toZonedTime(date, hostTimezone);
  const dayOfWeek = hostDate.getDay();

  // 3. Check for date override (blocked day)
  const dateStr = format(hostDate, "yyyy-MM-dd");
  const override = await prisma.dateOverride.findFirst({
    where: { userId: hostId, date: new Date(dateStr) },
  });
  if (override?.isBlocked) return [];

  // 4. Get weekly availability for this day
  let availability = await prisma.availability.findFirst({
    where: { userId: hostId, dayOfWeek, isActive: true },
  });

  // If override has custom hours, use those
  if (override?.startTime && override?.endTime) {
    availability = {
      ...availability!,
      startTime: override.startTime,
      endTime: override.endTime,
    };
  }
  if (!availability) return [];

  // 5. Build raw slots across the availability window
  const dayStart = fromZonedTime(
    `${dateStr}T${availability.startTime}:00`,
    hostTimezone
  );
  const dayEnd = fromZonedTime(
    `${dateStr}T${availability.endTime}:00`,
    hostTimezone
  );

  const rawSlots: { start: Date; end: Date }[] = [];
  let cursor = dayStart.getTime();
  while (cursor + duration * 60000 <= dayEnd.getTime()) {
    rawSlots.push({
      start: new Date(cursor),
      end: new Date(cursor + duration * 60000),
    });
    cursor += (duration + buffer) * 60000;
  }

  // 6. Get existing bookings for this host on this day
  const existingBookings = await prisma.booking.findMany({
    where: {
      hostId,
      status: { in: ["CONFIRMED", "PENDING"] },
      startTime: { gte: startOfDay(date) },
      endTime: { lte: endOfDay(addDays(date, 1)) },
    },
  });

  // 7. Get Google Calendar busy slots
  const googleBusy = await getGoogleCalendarBusySlots(
    hostId,
    startOfDay(date),
    endOfDay(addDays(date, 1))
  );

  // 8. Filter out occupied slots
  const allBusy = [
    ...existingBookings.map((b: { startTime: Date; endTime: Date }) => ({ start: b.startTime, end: b.endTime })),
    ...googleBusy,
  ];

  const available = rawSlots.filter((slot) => {
    return !allBusy.some(
      (busy) => slot.start < busy.end && slot.end > busy.start
    );
  });

  // 9. Convert to visitor's timezone for display
  return available.map((slot) => {
    const visitorStart = toZonedTime(slot.start, visitorTimezone);
    const display = visitorStart.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: visitorTimezone,
    });
    return { start: slot.start, end: slot.end, display };
  });
}

/**
 * Check if a specific slot is still available (race-condition guard)
 */
export async function isSlotAvailable(
  hostId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const conflict = await prisma.booking.findFirst({
    where: {
      hostId,
      status: { in: ["CONFIRMED", "PENDING"] },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });
  return !conflict;
}
