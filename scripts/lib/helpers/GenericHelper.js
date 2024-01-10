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
}
