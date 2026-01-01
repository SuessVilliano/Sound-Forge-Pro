
import { TourDate } from '../types';

// Mock Data representing a raw Google Calendar API response
const MOCK_CALENDAR_RESPONSE = {
  items: [
    {
      id: "evt_1",
      summary: "Live at The Fillmore",
      location: "San Francisco, CA",
      start: { dateTime: "2025-06-12T20:00:00-07:00" },
      description: "Tickets: https://ticketmaster.com/event/123",
      status: "confirmed"
    },
    {
      id: "evt_2",
      summary: "Coachella Festival Set",
      location: "Indio, CA",
      start: { dateTime: "2025-04-18T16:00:00-07:00" },
      description: "Main Stage",
      status: "confirmed"
    },
    {
      id: "evt_3",
      summary: "Brooklyn Steel Show",
      location: "Brooklyn, NY",
      start: { dateTime: "2025-07-10T19:30:00-04:00" },
      description: "Sold out show.",
      status: "confirmed"
    },
    {
      id: "evt_4",
      summary: "Glastonbury Festival",
      location: "Pilton, UK",
      start: { dateTime: "2025-06-28T21:00:00+01:00" },
      description: "Pyramid Stage",
      status: "confirmed"
    }
  ]
};

export const googleCalendarService = {
    
    /**
     * Simulates Google OAuth2 Flow
     */
    connectAccount: async (): Promise<{ email: string, connected: boolean }> => {
        console.log("[GCal] Initiating OAuth2 flow...");
        await new Promise(r => setTimeout(r, 1500)); // Simulate popup delay
        return {
            email: "management@soundforge.club",
            connected: true
        };
    },

    /**
     * Fetches events and maps them to TourDate objects
     */
    getTourDates: async (calendarId: string): Promise<TourDate[]> => {
        console.log(`[GCal] Fetching events for ${calendarId}...`);
        await new Promise(r => setTimeout(r, 1000)); // Simulate API latency

        // In a real app, this would be:
        // const res = await gapi.client.calendar.events.list({ calendarId, timeMin: (new Date()).toISOString(), ... });
        
        const rawEvents = MOCK_CALENDAR_RESPONSE.items;

        return rawEvents.map(evt => {
            // 1. Parse Venue from Summary (Strip "Live at" prefixes if common)
            let venue = evt.summary;
            if (venue.toLowerCase().startsWith("live at ")) {
                venue = venue.substring(8);
            }

            // 2. Extract Ticket Link from Description if present
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const linkMatch = evt.description?.match(urlRegex);
            const ticketLink = linkMatch ? linkMatch[0] : undefined;

            // 3. Determine Status based on description keywords
            let status = 'Tickets Available';
            if (evt.description?.toLowerCase().includes('sold out')) status = 'Sold Out';
            if (evt.description?.toLowerCase().includes('cancelled')) status = 'Cancelled';

            return {
                id: evt.id,
                date: evt.start.dateTime.split('T')[0], // YYYY-MM-DD
                venue: venue,
                city: evt.location || 'Unknown City',
                status: status,
                ticketLink: ticketLink
            };
        });
    }
};
