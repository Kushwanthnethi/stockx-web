import { useEffect } from 'react';
import { toZonedTime } from 'date-fns-tz';
import { getHolidayReason, getSpecialSessionReason } from '@/lib/market-time';

const TIME_ZONE = 'Asia/Kolkata';

// Times in IST: [hours, minutes]
const REFRESH_MILESTONES = [
    [9, 0],   // 09:00 AM - Pre-open start
    [9, 15],  // 09:15 AM - Live market start
    [15, 30], // 03:30 PM - Market close
    [15, 45], // 03:45 PM - Post-close start
    [16, 0]   // 04:00 PM - Post-close end
];

export function useMarketAutoRefresh() {
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const scheduleNextRefresh = () => {
            const now = new Date();
            const zonedNow = toZonedTime(now, TIME_ZONE);

            const currentYear = zonedNow.getFullYear();
            const currentMonth = zonedNow.getMonth();
            const currentDate = zonedNow.getDate();
            const currentHours = zonedNow.getHours();
            const currentMinutes = zonedNow.getMinutes();
            const currentSeconds = zonedNow.getSeconds();

            // Find the next milestone for today
            let nextMilestone: Date | null = null;

            // Check if today is a trading day
            const isHoliday = !!getHolidayReason();
            const isSpecialSession = !!getSpecialSessionReason();
            const dayOfWeek = zonedNow.getDay(); // 0 = Sunday, 6 = Saturday
            const isWeekend = !isSpecialSession && (dayOfWeek === 0 || dayOfWeek === 6);

            const isTradingDayToday = !isHoliday && !isWeekend;

            if (isTradingDayToday) {
                for (const [milestoneHour, milestoneMinute] of REFRESH_MILESTONES) {
                    if (
                        currentHours < milestoneHour ||
                        (currentHours === milestoneHour && currentMinutes < milestoneMinute)
                    ) {
                        nextMilestone = new Date(zonedNow);
                        nextMilestone.setHours(milestoneHour, milestoneMinute, 0, 0);
                        break;
                    }
                }
            }

            // If no milestone found for today (either all passed or not a trading day), schedule for 09:00 AM on the next trading day
            if (!nextMilestone) {
                let nextTradingDate = new Date(zonedNow);
                nextTradingDate.setHours(0, 0, 0, 0); // Start at midnight of current day to safely increment

                // Keep looking for the next valid trading day
                while (true) {
                    nextTradingDate.setDate(nextTradingDate.getDate() + 1); // Add a day

                    const nextZoned = toZonedTime(nextTradingDate, TIME_ZONE);
                    const nextYear = nextZoned.getFullYear();
                    const nextMonth = String(nextZoned.getMonth() + 1).padStart(2, '0');
                    const nextDateStr = String(nextZoned.getDate()).padStart(2, '0');
                    const dateString = `${nextYear}-${nextMonth}-${nextDateStr}`;

                    // We need a helper to check holiday by date, but since getHolidayReason uses current time,
                    // we can temporarily alter logic, OR we can just schedule for next day at 9AM and it will self-correct
                    // if that day is a holiday. Yes, it's safer to just schedule for the next day's 09:00 AM regardless,
                    // and when that time hits, the hook will re-run and either refresh or wait. 
                    // To be safe, let's just schedule for the very next day at 09:00.

                    nextMilestone = new Date(zonedNow);
                    nextMilestone.setDate(nextMilestone.getDate() + 1);
                    nextMilestone.setHours(9, 0, 0, 0);
                    break;
                }
            }

            // Calculate milliseconds until next milestone
            // Note: Since `zonedNow` and `nextMilestone` might have slight variations if we just subtract them directly
            // due to Date object timezone handling, it's safer to compare UTC times.

            // To be entirely accurate, let's calculate the UTC milliseconds difference
            // We know nextMilestone has the target local time in IST.
            // We need to get the absolute MS difference.

            // Wait, nextMilestone was derived from `new Date(zonedNow)`, which has the same local timezone offset as `now` in Node/V8 timezone.
            // A simpler way: calculate target timestamp in UTC.
            const currentMs = now.getTime();

            // Let's create the target time in IST string and parse it back to get exact MS
            const targetYear = nextMilestone.getFullYear();
            const targetMonth = String(nextMilestone.getMonth() + 1).padStart(2, '0');
            const targetDate = String(nextMilestone.getDate()).padStart(2, '0');
            const targetHours = String(nextMilestone.getHours()).padStart(2, '0');
            const targetMinutes = String(nextMilestone.getMinutes()).padStart(2, '0');

            // "YYYY-MM-DDTHH:mm:ss.000+05:30"
            const isoString = `${targetYear}-${targetMonth}-${targetDate}T${targetHours}:${targetMinutes}:00.000+05:30`;
            const targetMs = new Date(isoString).getTime();

            // Add a small buffer (500ms) to ensure we are past the exact second when it fires
            const msUntilRefresh = Math.max(0, targetMs - currentMs) + 500;

            console.log(`[Auto-Refresh] Next refresh scheduled at ${isoString} (in ${Math.round(msUntilRefresh / 1000)} seconds)`);

            timeoutId = setTimeout(() => {
                console.log("[Auto-Refresh] Triggering page reload for market milestone update...");
                window.location.reload();
            }, msUntilRefresh);
        };

        scheduleNextRefresh();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);
}
