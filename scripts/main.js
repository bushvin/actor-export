import { semVer } from './lib/SemVer.js';
import { baseProvider } from './lib/providers/BaseProvider.js';
import './lib/FileSaver.js';

/**
 * Class to contain all relevant information and functions for the module
 */
class actorExport {
    static ID = 'actor-export';
    static SETTINGS = {
        ENABLED_PROVIDERS: 'enabledProviders',
        PROVIDER_FILTER: 'exportProviderFilter',
        PROVIDER_CUSTOM: 'exportProviderCustom',
        PROVIDER_CUSTOM_CODE: 'exportProviderCustomCode',
        SELECTED_PROVIDER_FILES: 'exportSelectedProviderFiles',
    };
    static TEMPLATES = {
        ACTOR_EXPORT: `modules/${this.ID}/templates/actor-export.hbs`,
        ACTOR_EXPORT_PROVIDER: `modules/${this.ID}/templates/actor-export-provider.hbs`,
        ACTOR_EXPORT_CUSTOM_PROVIDER: `modules/${this.ID}/templates/actor-export-custom-provider.hbs`,
    };

    /**
     * Generate a uniform message based on severity using console
     * @param {string} severity - The severity of the message
     * @param {string} message - The message to raised
     * @param {...any} args - additional arguments for console
     */
    static log(severity, message, ...args) {
        const msg = `${this.ID} | ${message}`;
        switch (severity) {
            case 'error':
                console.error(msg, ...args);
                break;
            case 'warn':
            case 'warning':
                console.warn(msg, ...args);
                break;
            case 'debug':
                console.debug(msg, ...args);
                break;
            default:
                console.info(msg, ...args);
        }
    }

    /**
     * The initialization function for themodule
     */
    static init() {
        this.log('info', 'starting');
        game.settings.registerMenu(this.ID, this.SETTINGS.PROVIDER_FILTER, {
            name: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_FILTER}.name`,
            label: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_FILTER}.label`,
            hint: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_FILTER}.hint`,
            icon: `fa fa-cogs`,
            type: actorExportProvidersDialog,
            restricted: true,
            requiresReload: true,
        });

        game.settings.registerMenu(this.ID, this.SETTINGS.PROVIDER_CUSTOM, {
            name: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_CUSTOM}.name`,
            label: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_CUSTOM}.label`,
            hint: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_CUSTOM}.hint`,
            icon: `fa fa-file-code-o`,
            type: actorExportCustomProvider,
            restricted: true,
            requiresReload: true,
        });

        game.settings.register(this.ID, this.SETTINGS.PROVIDER_CUSTOM_CODE, {
            name: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_CUSTOM_CODE}.name`,
            hint: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_CUSTOM_CODE}.hint`,
            scope: 'world',
            config: false,
            type: String,
            default: '',
            restricted: true,
            requiresReload: true,
        });

        game.settings.register(this.ID, this.SETTINGS.ENABLED_PROVIDERS, {
            name: `ACTOR-EXPORT.settings.${this.SETTINGS.ENABLED_PROVIDERS}.name`,
            hint: `ACTOR-EXPORT.settings.${this.SETTINGS.ENABLED_PROVIDERS}.hint`,
            scope: 'world',
            config: false,
            type: Array,
            default: [],
        });

        game.settings.register(this.ID, this.SETTINGS.SELECTED_PROVIDER_FILES, {
            name: `ACTOR-EXPORT.settings.${this.SETTINGS.SELECTED_PROVIDER_FILES}.name`,
            hint: `ACTOR-EXPORT.settings.${this.SETTINGS.SELECTED_PROVIDER_FILES}.hint`,
            scope: 'client',
            config: false,
            type: Array,
            default: [],
        });
    }

    /**
     * Returns an array of all providers found in ./providers
     * @returns {Array}
     */
    static async providers() {
        const providers = [];
        const ls = await FilePicker.browse('data', `modules/${this.ID}/providers`);
        for (let i = 0; i < ls.dirs.length; i++) {
            let dir = ls.dirs[i];
            let response = await fetch(`${dir}/sheet.json`);
            let json = await response.json();
            providers.push(this.evalProviderRequirements(json));
        }
        return providers;
    }

    /**
     * Evaluate and enrich the provider information. Returns the same object
     * with an additional property indicating if the provider is available to the current
     * game system and version.
     * @param {Object} provider - The provider object to evaluate
     * @returns {Object}
     */
    static evalProviderRequirements(provider) {
        const system = game.system.id;
        const system_version = game.system.version;

        provider.allowed = false;
        if (provider.requirements.length === 0) {
            provider.allowed = true;
        }
        provider.requirements.forEach((req) => {
            if (
                (typeof req.system === 'undefined' || (typeof req.system !== 'undefined' && req.system === system)) &&
                (typeof req.system_version === 'undefined' ||
                    (typeof req.system_version !== 'undefined' &&
                        this.evalVersion(system_version, req.system_version, req.operator)))
            ) {
                provider.allowed = true;
            }
        });
        return provider;
    }

    /**
     * Evaluate two semantic versions based on the operator
     * @param {string} source - version to be compared with
     * @param {string} target - version to compare
     * @param {string} operator - operator
     * @returns {boolean}
     */
    static evalVersion(source, target, operator = 'gte') {
        if (typeof operator === 'string') {
            operator = operator.toLowerCase();
        }
        if (['eq', 'ne', 'gt', 'lt', 'lte'].includes(operator)) {
            return semVer[operator](source, target);
        } else {
            return semVer.gte(source, target);
        }
    }

    /**
     * Return the full path to the specified path
     * @param {string} filePath - the path to the file to be parsed
     * @param {string} provider - unique identifier for the provider
     * @returns {string}
     */
    static parseFilePath(filePath, provider) {
        /* FIXME: check if the URI is complete before building it */
        return `/modules/${this.ID}/providers/${provider}/${filePath}`;
    }
}

/**
 * A form class for the Actor Export Dialog
 */
class actorExportDialog extends FormApplication {
    constructor(actor) {
        super();
        this.actor = actor;
    }

    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            closeOnSubmit: false,
            height: 'auto',
            width: 'auto',
            resizable: true,
            id: 'actor-export',
            submitOnChange: true,
            template: actorExport.TEMPLATES.ACTOR_EXPORT,
            title: 'ACTOR-EXPORT.export-dialog.title',
            userId: game.userId,
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;
    }

    async getData() {
        const providers = await actorExport.providers();
        this.providers = providers;
        const enabledProviders = game.settings.get(actorExport.ID, actorExport.SETTINGS.ENABLED_PROVIDERS);
        const selectedProviderFiles = game.settings.get(actorExport.ID, actorExport.SETTINGS.SELECTED_PROVIDER_FILES);
        const allowedProviders = [];
        for (let i = 0; i < providers.length; i++) {
            if (enabledProviders.includes(providers[i].id)) {
                allowedProviders.push(providers[i]);
                providers[i].isEnabled = true;
                for (let f = 0; f < providers[i].files.length; f++) {
                    if (selectedProviderFiles.includes(`${providers[i].id}.${providers[i].files[f].uri}`)) {
                        providers[i].files[f].isSelected = true;
                    } else {
                        providers[i].files[f].isSelected = false;
                    }
                }
            } else {
                providers[i].isEnabled = false;
            }
        }
        const data = super.getData();
        const overrides = {
            providers: providers,
            enabledProviders: enabledProviders,
            allowedProviders: allowedProviders,
            downloadEnabled: true,
            previewEnabled: false,
            customProvider: game.settings.get(actorExport.ID, actorExport.SETTINGS.PROVIDER_CUSTOM_CODE).trim() !== '',
        };
        const mergedData = foundry.utils.mergeObject(data, overrides);
        return mergedData;
    }

    async _updateObject(event, formData) {
        let selectedProviderFiles = [];
        document
            .getElementById('actor-export-form')
            .querySelectorAll('input[type=checkbox]')
            .forEach((input) => {
                if (input.checked) {
                    const provider = input.getAttribute('data-provider');
                    const file = input.getAttribute('data-file');
                    selectedProviderFiles.push(`${provider}.${file}`);
                }
            });
        game.settings.set(actorExport.ID, actorExport.SETTINGS.SELECTED_PROVIDER_FILES, selectedProviderFiles);
    }

    activateListeners(html) {
        super.activateListeners(html);
        /* FIXME: why doesn't this work?
        html.on('click', '.actor-export-download', this.downloadFiles(this));
        */
        const downloadButton = document.getElementById('actor-export-download');
        if (downloadButton !== null) {
            downloadButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.downloadFiles(event);
            });
        }

        const previewButton = document.getElementById('actor-export-preview');
        if (previewButton !== null) {
            document.getElementById('actor-export-preview').addEventListener('click', (event) => {
                event.preventDefault();
                this.previewFiles(event);
            });
        }
    }

    downloadFiles(event) {
        ui.notifications.info('Please wait, this may take a while...');
        const selectedFiles = {};
        document
            .getElementById('actor-export-form')
            .querySelectorAll('input[type=checkbox]')
            .forEach((input) => {
                if (input.checked) {
                    if (!Object.keys(selectedFiles).includes(input.getAttribute('data-provider'))) {
                        selectedFiles[input.getAttribute('data-provider')] = [];
                    }
                    selectedFiles[input.getAttribute('data-provider')].push(input.getAttribute('data-file'));
                }
            });
        for (let p = 0; p < Object.keys(selectedFiles).length; p++) {
            let providerId = Object.keys(selectedFiles)[p];
            let dataUri = '';
            window.actor = this.actor;
            actorExport.log('debug', 'provider:', providerId);
            actorExport.log('debug', 'actor:', actor);
            if (providerId === '_custom_') {
                const customProvider = game.settings.get(actorExport.ID, actorExport.SETTINGS.PROVIDER_CUSTOM_CODE);
                dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(customProvider);
                import(dataUri)
                    .then((module) => {
                        if (module.mapper === undefined) {
                            ui.notifications.error(
                                `${actorExport.ID} | The mapper is not (correctly) exported. Ignoring custom provider.`,
                                { permanent: true }
                            );
                        } else if (!baseProvider.prototype.isPrototypeOf(module.mapper)) {
                            ui.notifications.error(
                                `${actorExport.ID} | The obtained object (mapper) is not of type baseProvider. Ignoring custom provider.`,
                                { permanent: true }
                            );
                        } else {
                            module.mapper.download();
                        }
                    })
                    .catch((error) => {
                        actorExport.log('error', error);
                    });
            } else {
                dataUri = `/modules/${actorExport.ID}/providers/${providerId}/provider.js`;
                import(dataUri).then((module) => {
                    if (module.mapper === undefined) {
                        ui.notifications.error(
                            `${actorExport.ID} | The mapper is not (correctly) exported. Ignoring the ${providerId} provider.`,
                            { permanent: true }
                        );
                    } else if (!baseProvider.prototype.isPrototypeOf(module.mapper)) {
                        ui.notifications.error(
                            `${actorExport.ID} | The obtained object (mapper) is not of type baseProvider. Ignoring the ${providerId} provider.`,
                            { permanent: true }
                        );
                    } else {
                        for (let f = 0; f < selectedFiles[providerId].length; f++) {
                            const exportFile = this.providers[p].files[f];
                            module.mapper.file = actorExport.parseFilePath(exportFile.uri, providerId);
                            module.mapper.downloadFileName = `${module.mapper.actorName} - ${exportFile.uri}`;
                            module.mapper.download();
                        }
                    }
                });
            }
        }
    }
}

class actorExportCustomProvider extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            closeOnSubmit: true,
            resizable: true,
            id: 'actor-export-custom-provider',
            submitOnChange: false,
            template: actorExport.TEMPLATES.ACTOR_EXPORT_CUSTOM_PROVIDER,
            title: 'ACTOR-EXPORT.settings.actorExportCustomProvider.title',
            userId: game.userId,
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;
    }

    async getData() {
        const data = super.getData();
        let exampleCode = `import { baseProvider } from '${window.location.protocol}//${window.location.hostname}/modules/actor-export/scripts/lib/providers/BaseProvider.js';
        import { pdfProvider } from '${window.location.protocol}//${window.location.hostname}/modules/actor-export/scripts/lib/providers/PDFProvider.js';
        // The full URI above must be specified.

        // actor is a global variable containing the actor's information
        // baseProvider is a skeleton with base functionality for the export not to fail. It needs to be enhanced in some way.
        // pdfProvider is a fully functional class which can be used to export to premade PDFs

        const mapper = new baseProvider(actor);
        // do whatever is needed
        export { mapper };
        `;
        exampleCode = exampleCode
            .split('\n')
            .map((i) => i.trim())
            .join('\n');
        const overrides = {
            customProvider: game.settings.get(actorExport.ID, actorExport.SETTINGS.PROVIDER_CUSTOM_CODE),
            exampleCode: exampleCode,
        };
        const mergedData = foundry.utils.mergeObject(data, overrides);
        return mergedData;
    }

    async _updateObject(event, formData) {
        const oldCustomProvider = game.settings.get(actorExport.ID, actorExport.SETTINGS.PROVIDER_CUSTOM_CODE);
        const newCustomProvider = document.getElementById('actor-export-custom-provider-javascript').value;
        if (oldCustomProvider !== newCustomProvider) {
            game.settings.set(actorExport.ID, actorExport.SETTINGS.PROVIDER_CUSTOM_CODE, newCustomProvider);
        }
    }
}

/**
 * A form class for the providers settings dialog
 */
class actorExportProvidersDialog extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            closeOnSubmit: true,
            resizable: true,
            id: 'actor-export-providers',
            submitOnChange: false,
            template: actorExport.TEMPLATES.ACTOR_EXPORT_PROVIDER,
            title: 'ACTOR-EXPORT.settings.actorExportProviderDialog.title',
            userId: game.userId,
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;
    }

    async getData() {
        const providers = await actorExport.providers();
        const enabledProviders = game.settings.get(actorExport.ID, actorExport.SETTINGS.ENABLED_PROVIDERS);
        for (let i = 0; i < providers.length; i++) {
            if (enabledProviders.includes(providers[i].id)) {
                providers[i].isEnabled = true;
            } else {
                providers[i].isEnabled = false;
            }
        }
        const data = super.getData();
        const overrides = {
            providers: providers,
            enabledProviders: enabledProviders,
        };
        const mergedData = foundry.utils.mergeObject(data, overrides);
        return mergedData;
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);
        let allowedProviders = [];
        Object.keys(expandedData).forEach((key) => {
            if (expandedData[key] === true) {
                allowedProviders.push(key);
            }
        });
        game.settings.set(actorExport.ID, actorExport.SETTINGS.ENABLED_PROVIDERS, allowedProviders);
    }
}

/**
 * Set up the actor-export module
 */
Hooks.once('init', () => {
    actorExport.init();
});

/**
 * Add the 'Export' button in the character's actor dialog
 */
Hooks.on('getActorSheetHeaderButtons', (sheet, buttons) => {
    if (!['character', 'PC', 'Player', 'npc', 'pc'].includes(sheet.actor.type ?? sheet.actor.data.type)) return;
    buttons.unshift({
        label: 'ACTOR-EXPORT.actor-dialog.header-button.label',
        class: 'actor-export',
        icon: 'fa fa-address-card',
        onclick: () => {
            new actorExportDialog(sheet.actor).render(true);
            /* FIXME: is this needed? */
            // Object.values(ui.windows)
            //     .filter((w) => w instanceof actorExportDialog)[0]
            //     ?.bringToTop();
        },
    });
});
