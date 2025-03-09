const moment = require('moment-timezone');

class DateConverter {
    /**
     * Convert AD (Gregorian) date to BS (Nepali) date
     * @param {Date|string} adDate - Date in AD format
     * @returns {string} - Date in BS format (YYYY-MM-DD)
     */
    static convertADToBS(adDate) {
        if (!adDate) return null;

        // Convert input to moment object
        const date = moment(adDate).tz('Asia/Kathmandu');
        
        // Get AD date components
        const adYear = date.year();
        const adMonth = date.month() + 1; // moment months are 0-based
        const adDay = date.date();

        // Base date for conversion (2000/01/01 AD = 2056/09/17 BS)
        const base = {
            ad: { year: 2000, month: 1, day: 1 },
            bs: { year: 2056, month: 9, day: 17 }
        };

        // Days in each month of BS calendar
        const bsMonthDays = [
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2056
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2057
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2058
            [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2059
            [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2060
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2061
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2062
            [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2063
            [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2064
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2065
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2066
            [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2067
            [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2068
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2069
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2070
            [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2071
            [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2072
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2073
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2074
            [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2075
            [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2076
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2077
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2078
            [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2079
            [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2080
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2081
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2082
            [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2083
            [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2084
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2085
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2086
            [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2087
            [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2088
            [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2089
            [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2090
        ];

        // Calculate total days from base date to input date
        const baseDate = moment([base.ad.year, base.ad.month - 1, base.ad.day]);
        const diffDays = date.diff(baseDate, 'days');

        let bsYear = base.bs.year;
        let bsMonth = base.bs.month;
        let bsDay = base.bs.day;
        let daysCount = diffDays;

        // Add days to base BS date
        while (daysCount > 0) {
            const yearIndex = bsYear - 2056;
            if (yearIndex >= bsMonthDays.length) {
                throw new Error('Date out of supported range');
            }

            const daysInMonth = bsMonthDays[yearIndex][bsMonth - 1];
            const remainingDays = daysInMonth - bsDay + 1;

            if (daysCount >= remainingDays) {
                daysCount -= remainingDays;
                bsMonth++;
                bsDay = 1;

                if (bsMonth > 12) {
                    bsYear++;
                    bsMonth = 1;
                }
            } else {
                bsDay += daysCount;
                daysCount = 0;
            }
        }

        // Format the result
        return `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;
    }

    /**
     * Convert BS (Nepali) date to AD (Gregorian) date
     * @param {string} bsDate - Date in BS format (YYYY-MM-DD)
     * @returns {Date} - Date in AD format
     */
    static convertBSToAD(bsDate) {
        if (!bsDate) return null;

        // Parse BS date
        const [bsYear, bsMonth, bsDay] = bsDate.split('-').map(Number);

        // Base date for conversion (2056/09/17 BS = 2000/01/01 AD)
        const base = {
            ad: { year: 2000, month: 1, day: 1 },
            bs: { year: 2056, month: 9, day: 17 }
        };

        // Calculate total days from base BS date to input BS date
        let totalDays = 0;
        
        // Add days for complete years
        for (let year = base.bs.year; year < bsYear; year++) {
            const yearIndex = year - 2056;
            if (yearIndex >= bsMonthDays.length) {
                throw new Error('Date out of supported range');
            }
            totalDays += bsMonthDays[yearIndex].reduce((a, b) => a + b, 0);
        }

        // Add days for complete months of current year
        const yearIndex = bsYear - 2056;
        for (let month = 1; month < bsMonth; month++) {
            totalDays += bsMonthDays[yearIndex][month - 1];
        }

        // Add remaining days
        totalDays += bsDay - base.bs.day;

        // Convert to AD date
        const adDate = moment([base.ad.year, base.ad.month - 1, base.ad.day])
            .add(totalDays, 'days')
            .format('YYYY-MM-DD');

        return new Date(adDate);
    }

    /**
     * Format date in Nepali format
     * @param {string} bsDate - Date in BS format (YYYY-MM-DD)
     * @returns {string} - Formatted date string
     */
    static formatBSDate(bsDate) {
        if (!bsDate) return '';

        const [year, month, day] = bsDate.split('-');
        return `${year} साल ${month} महिना ${day} गते`;
    }

    /**
     * Get current date in BS format
     * @returns {string} - Current date in BS format (YYYY-MM-DD)
     */
    static getCurrentBSDate() {
        return this.convertADToBS(new Date());
    }

    /**
     * Validate BS date
     * @param {string} bsDate - Date in BS format (YYYY-MM-DD)
     * @returns {boolean} - Whether the date is valid
     */
    static isValidBSDate(bsDate) {
        try {
            const [year, month, day] = bsDate.split('-').map(Number);

            if (year < 2056 || year > 2090) return false;
            if (month < 1 || month > 12) return false;

            const yearIndex = year - 2056;
            const daysInMonth = bsMonthDays[yearIndex][month - 1];

            return day >= 1 && day <= daysInMonth;
        } catch (error) {
            return false;
        }
    }
}

module.exports = DateConverter;
