/**
 * GenericHelper module
 * @module GenericHelper
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * Generic Property Error class
 * @class
 * @augments Error
 * @param {string} moduleName the name of the module the error has occurred in
 * @param {string} className the name of the class the error has occurred in
 * @param {string} methodName the name of the method the error has occurred in
 * @param {string} message the error message
 * @param {string} errorClassName the name of the error class
 */
export class genericPropertyError extends Error {
    constructor(moduleName, className, methodName, message, errorClassName = 'genericPropertyError') {
        const msg = `${moduleName} | ${className}.${methodName} | ${message}`;
        if (
            typeof ui !== 'undefined' &&
            typeof ui.notifications !== 'undefined' &&
            typeof ui.notifications.error !== 'undefined'
        ) {
            ui.notifications.error(msg, { permanent: true });
        } else {
            console.error(errorClassName, msg);
        }
        super(msg);
        this.name = errorClassName;
    }
}

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
     * Return a checkmark based on the outcome of the provided logical value
     * @param {boolean} value the value to evaulate
     * @param {string} checked character to use when checked (default: x)
     * @param {string} unchecked character to use when unchecked (default: empty string)
     * @returns {string}
     */
    static evalCheckMark(value, checked = 'x', unchecked = '') {
        if (value === true) {
            return checked;
        }
        return unchecked;
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

    /**
     * Strip html tags from text, possibly replacing opening and/or closing tags
     * @param {string} html the HTML code to strip
     * @param {string} tag the name of the tag to strip
     * @param {string} openTagReplace the value to use to replace the opening tag with
     * @param {string} closeTagReplace the value to use to replace the closing tag with
     * @returns {string} the stripped html text
     */
    static stripHTMLtag(html, tag, openTagReplace = '', closeTagReplace = '') {
        tag = tag.trim().toLowerCase();
        if (['hr', 'br'].includes(tag)) {
            let re = new RegExp(`<${tag} \/>`, 'gi');
            html = html.replace(re, openTagReplace);
        } else {
            let pre = new RegExp(`<${tag}[^>]*>\\s*`, 'i');
            let post = new RegExp(`\\s*</${tag}>`, 'i');
            while (true) {
                let originalHtml = html;
                html = html.replace(pre, openTagReplace);
                html = html.replace(post, closeTagReplace);
                if (originalHtml === html) {
                    break;
                }
            }
        }
        return html;
    }

    /**
     * Strip html tags from html elements based on the parent element tag
     * @param {string} html the HTML code to strip
     * @param {string} tag the name of the parent tag to strip child tags
     * @param {string} childTag the name of the child tag to strip
     * @param {string} openTagReplace the value to use to replace the opening tag with
     * @param {string} closeTagReplace the value to use to replace the closing tag with
     * @returns {string} the stripped html text
     */
    static stripNestedHTMLtag(html, tag, childTag, openTagReplace = '', closeTagReplace = '') {
        tag = tag.trim().toLowerCase();
        childTag = childTag.trim().toLowerCase();
        let openTag = new RegExp(`<${tag}[^>]*>`, 'i');
        let closeTag = new RegExp(`</${tag}>`, 'i');
        let startIndex = 0;
        while (true) {
            let originalHtml = html;
            let searchHtml = html.substring(startIndex);
            let openMatch = openTag.exec(searchHtml);
            let closeMatch = closeTag.exec(searchHtml);
            if (openMatch === null || closeMatch === null) {
                break;
            }
            let htmlPart = searchHtml.substring(openMatch.index + openMatch[0].length, closeMatch.index);
            htmlPart = this.stripHTMLtag(htmlPart, childTag, openTagReplace, closeTagReplace);
            html =
                html.substring(0, startIndex) +
                searchHtml.substring(0, openMatch.index + openMatch[0].length) +
                htmlPart +
                searchHtml.substring(closeMatch.index);
            startIndex = startIndex + closeMatch.index + closeMatch[0].length;
            if (originalHtml === html) {
                break;
            }
        }
        return html;
    }

    /**
     * Return an array with unique elements
     * @param {array} array the array to parse
     * @returns {array}
     */
    static unique(array) {
        const uniqueArray = [];
        array.forEach((element) => {
            if (uniqueArray.indexOf(element) === -1) {
                uniqueArray.push(element);
            }
        });
        return uniqueArray;
    }
}
