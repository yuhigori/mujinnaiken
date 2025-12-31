export function generateKeyCode(): string {
    return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

export function canAccessKeyCode(startTime: Date, endTime: Date): boolean {
    const now = new Date();
    const beforeMin = parseInt(process.env.KEY_BEFORE_MIN || '30');
    const afterMin = parseInt(process.env.KEY_AFTER_MIN || '30');

    const accessStartTime = new Date(startTime.getTime() - beforeMin * 60 * 1000);
    const accessEndTime = new Date(endTime.getTime() + afterMin * 60 * 1000);

    return now >= accessStartTime && now <= accessEndTime;
}

export function isWithinViewingTime(startTime: Date, endTime: Date): boolean {
    const now = new Date();
    return now >= startTime && now <= endTime;
}
