/**
 * GenericHelper module
 * @module GenericHelper
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * @class
 * This Generic Helper class provides universal static methods
 */
export class genericHelper {
    /**
     * a helper function to capitalize a given string
     * @param {string} value String to capitalize
     * @returns {string} Returns a capitalized string.
     * @static
     */
    static capitalize(value) {
        if (typeof value !== 'string') {
            return value;
        }
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    /**
     * a fallback method for missing method arguments
     * @param {string} argName the name of the argument
     * @param {string} functionName the name of the function
     * @throws {Error}
     * @static
     */
    static isRequiredArg(argName, functionName) {
        throw new Error(`\`${argName}\` is a required argument for pf2eHelper.${functionName}!`);
    }

    /**
     * convert the given number to a string and add a + sign if it is positive or 0.
     * @param {number} value The number to quantify
     * @returns {string} Returns a string where the number is correctly prefixed with + or -
     * @static
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
     * @param {number} number a number
     * @returns {string} Returns a short ordinal of the given number
     * @static
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
