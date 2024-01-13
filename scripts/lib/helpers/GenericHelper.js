/**
 * This Generic Helper class provides static methods
 * shared by all helpers
 */
export class GenericHelper {
    /**
     * a helper function to capitalize a given string
     * @param {string} value - String to capitalize
     * @returns {string}
     */
    static capitalize(value) {
        if (typeof value !== 'string') {
            return value;
        }
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    /**
     * convert the given number to a string and add a + sign if it is positive or 0.
     * @param {number} value - The number to quantify
     * @returns {string}
     */
    static quantifyNumber(value) {
        if (typeof value === 'undefined' || isNaN(parseInt(value))) {
            return value;
        } else {
            return parseInt(value) < 0 ? `${value}` : `+${value}`;
        }
    }

    /**
     * Return the short ordinal of the provided number
     * @param {number} number - a number
     * @returns {string}
     */
    static shortOrdinal(number) {
        if (isNaN(parseInt(number))) {
            return number;
        }
        number = parseInt(number);
        switch (number) {
            case 1:
                return '1st';
            case 2:
                return '2nd';
            case 3:
                return '3rd';
            default:
                return `${number}th`;
        }
    }
}
