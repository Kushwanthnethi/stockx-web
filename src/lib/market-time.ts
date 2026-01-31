import { toZonedTime } from 'date-fns-tz';

export enum MarketSession {
    CLOSED = 'CLOSED',
    PRE_OPEN = 'PRE_OPEN',
    OPEN = 'OPEN',
    POST_CLOSE = 'POST_CLOSE'
}

// NSE Trading Holidays 2026
const NSE_HOLIDAYS_2026: Record<string, string> = {
    '2026-01-26': 'Republic Day',
    '2026-03-03': 'Holi',
    '2026-03-26': 'Shri Ram Navami',
    '2026-03-31': 'Shri Mahavir Jayanti',
    '2026-04-03': 'Good Friday',
    '2026-04-14': 'Dr. Baba Saheb Ambedkar Jayanti',
    '2026-05-01': 'Maharashtra Day',
    '2026-05-28': 'Bakri Id',
    '2026-06-26': 'Muharram',
    '2026-09-14': 'Ganesh Chaturthi',
    '2026-10-02': 'Mahatma Gandhi Jayanti',
    '2026-10-20': 'Dussehra',
    '2026-11-10': 'Diwali-Balipratipada',
    '2026-11-24': 'Prakash Gurpurb Sri Guru Nanak Dev',
    '2026-12-25': 'Christmas'
};

// Special Trading Sessions (Sundays/Holidays where market is open)
const SPECIAL_TRADING_SESSIONS: Record<string, string> = {
    '2026-02-01': 'Union Budget Special Session'
};

export function getHolidayReason(): string | null {
    const timeZone = 'Asia/Kolkata';
    const now = new Date();
    const zonedDate = toZonedTime(now, timeZone);

    const year = zonedDate.getFullYear();
    const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
    const date = String(zonedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;

    return NSE_HOLIDAYS_2026[dateString] || null;
}

export function getSpecialSessionReason(): string | null {
    const timeZone = 'Asia/Kolkata';
    const now = new Date();
    const zonedDate = toZonedTime(now, timeZone);

    const year = zonedDate.getFullYear();
    const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
    const date = String(zonedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;

    return SPECIAL_TRADING_SESSIONS[dateString] || null;
}

export function getMarketSession(): MarketSession {
    const timeZone = 'Asia/Kolkata';
    const now = new Date();
    const zonedDate = toZonedTime(now, timeZone);

    // Check for Holiday
    if (getHolidayReason()) return MarketSession.CLOSED;

    const day = zonedDate.getDay();
    const isSpecialSession = !!getSpecialSessionReason();

    // 0 = Sunday, 6 = Saturday
    // Bypass weekend check if it's a special session
    if (!isSpecialSession && (day === 0 || day === 6)) return MarketSession.CLOSED;

    const hours = zonedDate.getHours();
    const minutes = zonedDate.getMinutes();
    const currentTime = hours * 60 + minutes;

    // 9:00 AM = 540 mins
    // 9:15 AM = 555 mins
    // 3:30 PM (15:30) = 930 mins
    // 4:00 PM (16:00) = 960 mins

    if (currentTime >= 540 && currentTime < 555) {
        return MarketSession.PRE_OPEN;
    }

    if (currentTime >= 555 && currentTime < 930) {
        return MarketSession.OPEN;
    }

    if (currentTime >= 930 && currentTime < 960) {
        return MarketSession.POST_CLOSE;
    }

    return MarketSession.CLOSED;
}

export function isMarketOpen(): boolean {
    return getMarketSession() === MarketSession.OPEN;
}

export function getMarketStatusText(): string {
    const holidayReason = getHolidayReason();
    if (holidayReason) return `Closed - ${holidayReason}`;

    const session = getMarketSession();
    const specialReason = getSpecialSessionReason();

    switch (session) {
        case MarketSession.PRE_OPEN:
            return specialReason ? `${specialReason} (Pre-Open)` : "Pre-Opening Session";
        case MarketSession.OPEN:
            return specialReason ? `${specialReason} (Live)` : "Live Market";
        case MarketSession.POST_CLOSE:
            return specialReason ? `${specialReason} (Post-Close)` : "Post-Closing Session";
        default:
            const timeZone = 'Asia/Kolkata';
            const now = new Date();
            const zonedDate = toZonedTime(now, timeZone);
            const day = zonedDate.getDay();
            if (!specialReason && (day === 0 || day === 6)) return "Market Closed - Weekend";
            return "Market Closed";
    }
}
