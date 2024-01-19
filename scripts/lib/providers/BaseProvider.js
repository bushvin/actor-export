/**
 * BaseProvider module
 * @module BaseProvider
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * @class
 * The base Provider class with required basic functionality for all providers
 * @param {Object} actor The Foundry VTT actor object.
 */
export class baseProvider {
    constructor(actor) {
        this.actor = actor;
        this.actorName = this.actor.name || '';
        this.logPrefix = 'actor-export';
        this.sourceFileURI = undefined;
        this.destinationFileName = undefined;
    }

    /**
     * The default function to download whatever provider is used
     * This is here to not fail when the provider definition doesn't have it.
     * @param sourceFileURI the URI of the file to use
     * @param destinationFileName the name of the file to be saved
     * @param execPost the function to be executed after execution
     */
    download(sourceFileURI, destinationFileName, execPost = function () {}) {}

    /**
     * A function to fetch an image and return an image object promise
     * @param {string} src The URL to the image to be used
     * @returns {Promise} the image promise
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Notifier to display messages while parsing data. Will use the Foundry VTT notifier by default
     * But falls back on `console` if ui.notifications is not (yet) available
     * @param {string} severity the severity of the message debug, error, warning or info
     * @param {string} message what to show
     * @param {Object} options additional options for ui.notifications.
     */
    notify(severity, message, options) {
        if (typeof ui !== 'undefined' && typeof ui.notifications !== undefined) {
            const msg = `${this.logPrefix} | ${message}`;
            switch (severity) {
                case 'error':
                    ui.notifications.error(msg, options);
                    break;
                case 'warn':
                    ui.notifications.warn(msg, options);
                    break;
                case 'debug':
                    ui.notifications.debug(msg, options);
                    break;
                default:
                    ui.notifications.info(msg, options);
            }
        } else {
            switch (severity) {
                case 'error':
                    console.error(msg);
                    break;
                case 'warn':
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
}
