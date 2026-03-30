import { google } from "googleapis";
import { prisma } from "./prisma";

/**
 * Build an authenticated Google OAuth2 client for a given user
 */
export async function getGoogleAuthClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
    },
  });

  if (!user?.googleRefreshToken) {
    throw new Error("Google Calendar not connected. Please connect your Google account.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry?.getTime(),
  });

  // Auto-refresh token if expired
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token || tokens.access_token) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: tokens.access_token ?? user.googleAccessToken,
          googleRefreshToken: tokens.refresh_token ?? user.googleRefreshToken,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    }
  });

  return oauth2Client;
}

/**
 * Create a Google Calendar event when a booking is confirmed
 */
export async function createGoogleCalendarEvent(
  userId: string,
  params: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    guestEmail: string;
    guestName: string;
    location?: string;
  }
) {
  try {
    const auth = await getGoogleAuthClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const event = await calendar.events.insert({
      calendarId: "primary",
      sendUpdates: "all",
      requestBody: {
        summary: params.title,
        description: params.description,
        location: params.location,
        start: { dateTime: params.startTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: params.endTime.toISOString(), timeZone: "UTC" },
        attendees: [{ email: params.guestEmail, displayName: params.guestName }],
        conferenceData: undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 1440 }, // 24h before
            { method: "popup", minutes: 15 },
          ],
        },
      },
    });

    return event.data.id;
  } catch (error) {
    console.error("Failed to create Google Calendar event:", error);
    return null; // Don't block booking if calendar fails
  }
}

/**
 * Delete a Google Calendar event when a booking is cancelled
 */
export async function deleteGoogleCalendarEvent(userId: string, googleEventId: string) {
  try {
    const auth = await getGoogleAuthClient(userId);
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({ calendarId: "primary", eventId: googleEventId });
  } catch (error) {
    console.error("Failed to delete Google Calendar event:", error);
  }
}

/**
 * Get busy time slots from Google Calendar (FreeBusy query)
 */
export async function getGoogleCalendarBusySlots(
  userId: string,
  timeMin: Date,
  timeMax: Date
): Promise<Array<{ start: Date; end: Date }>> {
  try {
    const auth = await getGoogleAuthClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    const busy = response.data.calendars?.["primary"]?.busy ?? [];
    return busy
      .filter((b) => b.start && b.end)
      .map((b) => ({
        start: new Date(b.start!),
        end: new Date(b.end!),
      }));
  } catch {
    return []; // If calendar not connected, return no busy slots
  }
}
