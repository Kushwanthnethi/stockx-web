import { toZonedTime } from 'date-fns-tz';

export enum MarketSession {
    CLOSED = 'CLOSED',
    PRE_OPEN = 'PRE_OPEN',
    OPEN = 'OPEN',
    POST_CLOSE = 'POST_CLOSE'
}

export function getMarketSession(): MarketSession {
    const timeZone = 'Asia/Kolkata';
    const now = new Date();
    const zonedDate = toZonedTime(now, timeZone);

    const day = zonedDate.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) return MarketSession.CLOSED;

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
    const session = getMarketSession();
    switch (session) {
        case MarketSession.PRE_OPEN:
            return "Pre-Opening Session";
        case MarketSession.OPEN:
            return "Live Market";
        case MarketSession.POST_CLOSE:
            return "Post-Closing Session";
        default:
            return "Market Closed";
    }
}
