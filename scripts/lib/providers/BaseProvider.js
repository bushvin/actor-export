/**
 * BaseProvider module
 * This module should be used as the basis for new providers
 * @module BaseProvider
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * @class
 * An error class to use for raising Provider-related errors
 * @param {string} className The name of the class the error is related to
 * @param {string} methodName The name of the method the error is related to
 * @param {string} message An error message
 * @param {string} [errorClassName='providerError'] the name of the error class raising the error
 */
export class providerError extends Error {
    constructor(className, methodName, message, errorClassName = 'providerError') {
        const msg = `${className}.${methodName} | ${message}`;
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
 * The base Provider class with required basic functionality for all providers
 * @param {Object} actor The Foundry VTT actor object.
 */
export class baseProvider {
    constructor(actor) {
        this.actor = actor;
        this.actorName = this.actor.name || '';
        this.customProviderFile = undefined;
        this.logPrefix = 'actor-export';
        this.providerRootPath = undefined;
        this.providerFilePath = undefined;
        this.providerDestinationFileName = undefined;
        this.overrideProviderPath = undefined;
        this.overrideFilePath = undefined;
        this.overrideDestinationFileName = undefined;
        this.debugProvider = false;
    }

    /**
     * Cleanup Foundry Markup entries
     * @param {string} value the string to be cleaned
     * @param {object} helper the helper object to use to clean up the value
     * @returns {string} Returns the cleaned string
     */
    cleanFoundryMarkup(value, helper) {
        if (typeof value !== 'string') {
            return value;
        }
        if (!helper || typeof helper.stripHTMLtag !== 'function' || typeof helper.stripNestedHTMLtag !== 'function') {
            return value;
        }
        value = helper.stripHTMLtag(value, 'a', '');
        value = helper.stripHTMLtag(value, 'br', '', '\n');
        value = helper.stripHTMLtag(value, 'hr', '-----\n');
        value = helper.stripHTMLtag(value, 'p', '', '\n');
        value = helper.stripHTMLtag(value, 'section', '', '\n');
        value = helper.stripHTMLtag(value, 'strong');
        value = helper.stripHTMLtag(value, 'em');
        value = helper.stripHTMLtag(value, 'span');
        value = helper.stripNestedHTMLtag(value, 'ol', 'li', '- ');
        value = helper.stripHTMLtag(value, 'ol');
        value = helper.stripNestedHTMLtag(value, 'ul', 'li', '- ');
        value = helper.stripHTMLtag(value, 'ul');
        value = helper.stripHTMLtag(value, 'h1', '#');
        value = helper.stripHTMLtag(value, 'h2', '##');
        value = helper.stripHTMLtag(value, 'h3', '###');
        value = helper.stripHTMLtag(value, 'h4', '####');
        value = helper.stripHTMLtag(value, 'h5', '#####');
        value = helper.stripHTMLtag(value, 'h6', '######');
        return value;
    }

    /**
     * Deep clone the Provider
     * @returns {Object}
     */
    clone() {
        let obj;
        try {
            obj = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
            const properties = Object.getOwnPropertyNames(obj);
            for (let i = 0; i < properties.length; i++) {
                if (
                    properties[i] !== 'actor' &&
                    typeof obj[properties[i]] === 'object' &&
                    obj[properties[i]] !== null
                ) {
                    try {
                        // Let's be safe and only create clones of objects we can clone
                        obj[properties[i]] = structuredClone(obj[properties[i]]);
                    } catch (error) {
                        continue;
                    }
                }
            }
        } catch (error) {
            throw new providerError('baseProvider', 'clone', error.message);
        }

        return obj;
    }

    /**
     * Create a new file
     * @async
     * @returns {Promise} must return a promise with the attribute `ok` set to `true` if it is ok.
     */
    async createFile() {
        this.notify('error', 'There is no createFile method for this provider', { permanent: true });
        throw new Error(`There is no createFile method for this provider`);
    }

    /**
     * The default function to download whatever provider is used and save it
     * This is here to not fail when the provider definition doesn't have it.
     * @param {string} providerRootPath the URI of the provider
     * @param {string} providerFilePath the URI of the file to use, relative to the providerPath
     * @param {string} providerDestinationFileName the name of the file to be saved
     * @param {Function} [postDownloadFunction=Function] the function to be executed after execution
     */
    download(providerRootPath, providerFilePath, providerDestinationFileName, postDownloadFunction = function () {}) {
        this.providerRootPath = providerRootPath;
        this.providerFilePath = providerFilePath;
        this.providerDestinationFileName = providerDestinationFileName;

        // Check if the file exists
        fetch(this.providerFullFilePath, { method: 'HEAD' })
            .then(async (headResponse) => {
                if (!headResponse.ok) {
                    // File does not exist, try to create a new one from scratch
                    try {
                        return await this.createFile();
                    } catch (error) {
                        this.notify('error', 'There was an error creating the export file');
                        console.error('error:', error);
                        throw new Error(`Failed to create ${this.providerFullFilePath}: ${error.message}`);
                    }
                }
                // File exists, proceed with downloading
                return fetch(this.providerFullFilePath);
            })
            .then(async (response) => {
                if (!response) {
                    // File does not exist, no need to proceed further, this case should never be hit.
                    return;
                }
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${this.providerFullFilePath}: ${response.statusText}`);
                }
                this.fileResponse = response;
                try {
                    await this.updateFile();
                } catch (error) {
                    this.notify('error', 'There was an error updating the export file');
                    console.error('error:', error);
                    throw new Error(`Failed to update ${this.providerFullFilePath}: ${error.message}`);
                }
                try {
                    await this.saveFile();
                } catch (error) {
                    this.notify('error', 'There was an error saving the export file');
                    console.error('error:', error);
                    throw new Error(`Failed to save ${this.providerFullFilePath}: ${error.message}`);
                }
                try {
                    await postDownloadFunction();
                } catch (error) {
                    this.notify('error', 'There was an error executing post exporting');
                    console.error('error:', error);
                    throw new Error(`Failed to perform post export tasks: ${error.message}`);
                }
            })
            .catch((error) => {
                // Notify users of any errors that occurred during the download process
                this.notify('error', `Failed to download file: ${error.message}`, {
                    permanent: true,
                });
            });
    }

    /**
     * A function to fetch an image and return an image object promise
     * @param {string} src - The URL to the image to be used.
     * @returns {Promise<HTMLImageElement>} - A promise that resolves with the loaded image.
     * @throws {Error} - Throws an error if the image fails to load.
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image from ${src}`));
            img.src = src;
        });
    }

    /**
     * Notifier to display messages while parsing data.
     * Will use the Foundry VTT notifier by default but falls back on `console` if ui.notifications is not available.
     * @param {string} severity - The severity of the message (debug, error, warning, info).
     * @param {string} message - The message to display.
     * @param {Object} [options] - Additional options for ui.notifications.
     */
    notify(severity, message, options) {
        const msg = `${this.logPrefix} | ${message}`;
        if (typeof ui !== 'undefined' && typeof ui.notifications !== 'undefined') {
            switch (severity) {
                case 'error':
                    ui.notifications.error(msg, options);
                    break;
                case 'warning':
                    ui.notifications.warn(msg, options);
                    break;
                case 'debug':
                    ui.notifications.debug(msg, options);
                    break;
                default:
                    ui.notifications.info(msg, options);
            }
        } else {
            // Fallback to console logging
            switch (severity) {
                case 'error':
                    console.error(msg);
                    break;
                case 'warning':
                    console.warn(msg);
                    break;
                case 'debug':
                    console.debug(msg);
                    break;
                default:
                    console.info(msg);
            }
        }
    }

    /**
     * asynchronously parse a value through a function
     * @async
     * @param {any|Promise} value the value to be parsed
     * @param {Function} parser the parser function, arguments passed are the (awaited) value and `this`
     * @returns the parsed value
     */
    async parseValue(value, parser) {
        if (value instanceof Promise) {
            value = await value;
        }
        if (typeof parser === 'function') {
            if (typeof value === 'undefined') {
                this.notify('warning', 'The value you have specified is undefined');
            }
            try {
                return parser(value, this);
            } catch (error) {
                this.notify('error', `Parsing value ${value} through your parser failed`);
                console.error('error', error);
                throw Error(error);
            }
        } else if (typeof parser !== 'undefined') {
            this.notify('warning', `The parser you have specified is invalid.`);
            return;
        }

        return value;
    }

    /**
     * Get the full path to the provider being used
     * @returns {string} the correct URL to the provider
     */
    get providerFullFilePath() {
        if (
            typeof this.overrideFilePath !== 'undefined' &&
            (this.overrideFilePath.startsWith('http://') || this.overrideFilePath.startsWith('https://'))
        ) {
            return this.overrideFilePath;
        } else if (
            typeof this.providerFilePath !== 'undefined' &&
            (this.providerFilePath.startsWith('http://') || this.providerFilePath.startsWith('https://'))
        ) {
            return this.providerFilePath;
        }
        return (
            (this.overrideProviderPath || this.providerRootPath) +
            '/' +
            (this.overrideFilePath || this.providerFilePath)
        );
    }

    /**
     * Save the file
     * @async
     */
    async saveFile() {
        this.notify('error', 'There is no saveFile method for this provider', { permanent: true });
        throw new Error(`There is no saveFile method for this provider`);
    }

    /**
     * Update the file
     * @async
     */
    async updateFile() {
        this.notify('error', 'There is no updateFile method for this provider', { permanent: true });
        throw new Error(`There is no updateFile method for this provider`);
    }

    /**
     * Upload the file and return it as an ArrayBuffer
     * @returns {Promise}
     */
    uploadCustomProviderFile() {
        try {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.onload = (f) => resolve(f.target.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(this.customProviderFile);
            });
        } catch (error) {
            this.notify('error', 'Failed to load local file', { permanent: true });
            console.error('error', error);
            throw error;
        }
    }

    /**
     * Check if a given URL exists
     * @async
     * @param {string} url a correct url
     * @returns {boolean} whether or not the URL exists
     */
    async urlExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false; // An error occurred or the request failed
        }
    }
}
