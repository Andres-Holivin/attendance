// /**
//  * Utility functions for handling date and timezone conversions
//  */

// /**
//  * Convert UTC date to local timezone for display
//  */
export function utcToLocal(utcDate: string | Date): Date {
    return new Date(utcDate);
}

/**
 * Check if an employee is late based on UTC times
 */
export function isEmployeeLate(checkInUtc: string | Date, workStartHour: number = 9): boolean {
    const checkInLocal = utcToLocal(checkInUtc);
    const workStartLocal = new Date(checkInLocal);
    workStartLocal.setHours(workStartHour, 0, 0, 0);

    return checkInLocal > workStartLocal;
}