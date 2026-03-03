export interface Holiday {
    id: string;
    title: string;
    message: string;
    startDate: string; // ISO string or parsable date
    endDate: string;   // ISO string or parsable date
    imageType?: 'holi' | 'diwali' | 'generic'; // to select an illustration
}

export const HOLIDAYS: Holiday[] = [
    {
        id: 'holi-2026',
        title: 'Happy Holi',
        message: 'Please note that markets are closed on 3 March and will open at 09:15 AM on 4 March.',
        // Start showing March 2nd 5:00 PM IST (11:30 AM UTC), until March 4th 12:00 PM IST
        startDate: '2026-03-02T17:00:00+05:30',
        endDate: '2026-03-04T12:00:00+05:30',
        imageType: 'holi'
    }
];

export function getActiveHoliday(): Holiday | null {
    const now = new Date();

    for (const holiday of HOLIDAYS) {
        const start = new Date(holiday.startDate);
        const end = new Date(holiday.endDate);

        if (now >= start && now <= end) {
            return holiday;
        }
    }

    return null;
}
