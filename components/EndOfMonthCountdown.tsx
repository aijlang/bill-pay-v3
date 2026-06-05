import React, { useState, useEffect } from 'react';

// A utility function to pad numbers with a leading zero
const padWithZero = (num: number): string => num.toString().padStart(2, '0');

const EndOfMonthCountdown: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            // Get the last millisecond of the current month
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const difference = endOfMonth.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                setTimeLeft({ days, hours, minutes });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0 });
            }
        };

        // Calculate immediately on mount
        calculateTimeLeft();

        const timer = setInterval(calculateTimeLeft, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-sm text-slate-600 flex items-baseline gap-2" title="Time remaining this month">
            <span className="font-medium text-slate-500">Countdown to Next Month:</span>
            <span className="font-semibold tracking-wide">
                {padWithZero(timeLeft.days)}d
                <span className="mx-0.5">:</span>
                {padWithZero(timeLeft.hours)}h
                <span className="mx-0.5">:</span>
                {padWithZero(timeLeft.minutes)}m
            </span>
        </div>
    );
};

export default EndOfMonthCountdown;