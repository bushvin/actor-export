/**
 * The base Provider class with required basic functionality
 * @param {Object} actor - The Foundry VTT actor object.
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
     * Notifier to display messages while parsing data. Will use the Foundry VTT notifier by default
     * But falls back on `console` if ui.notifications is not (yet) available
     * @param {string} severity - the severity of the message debug, error, warning or info
     * @param {string} message - what to show
     * @param {Object} options - additional options for ui.notifications.
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

    /**
     * The default function to download whatever provider is used
     * This is here to not fail when the provider definition doesn't have it.
     */
    download(sourceFileURI, destinationFileName) {}
}
