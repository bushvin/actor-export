import { semVer } from './lib/SemVer.js';
import { baseProvider } from './lib/providers/BaseProvider.js';
import './lib/FileSaver.js';

/**
 * @class
 * Class to contain all relevant information and functions for the module
 */
export class actorExport {
    static ID = 'actor-export';
    static SETTINGS = {
        ALL_PROVIDERS: 'allProviders',
        ENABLED_PROVIDERS: 'enabledProviders',
        PROVIDER_FILTER: 'exportProviderFilter',
        PROVIDER_CUSTOM: 'exportProviderCustom',
        PROVIDER_CUSTOM_CODE: 'exportProviderCustomCode',
        PROVIDER_OVERRIDE_PDF_FONTS: 'exportProviderOverridePdfFonts',
        PROVIDER_OVERRIDE_PDF_FONTS_SELECTION: 'exportProviderOverridePdfFontsSelection',
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
     * The initialization function for the module
     */
    static init() {
        this.log('info', 'Starting');
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
            icon: `fa fa-file-code`,
            type: actorExportCustomProvider,
            restricted: true,
            requiresReload: true,
        });

        game.settings.register(this.ID, this.SETTINGS.PROVIDER_OVERRIDE_PDF_FONTS, {
            name: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_OVERRIDE_PDF_FONTS}.name`,
            hint: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_OVERRIDE_PDF_FONTS}.hint`,
            scope: 'client',
            config: true,
            type: Boolean,
            restricted: false,
            requiresReload: false,
            default: false,
        });

        game.settings.register(this.ID, this.SETTINGS.PROVIDER_OVERRIDE_PDF_FONTS_SELECTION, {
            name: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_OVERRIDE_PDF_FONTS_SELECTION}.name`,
            hint: `ACTOR-EXPORT.settings.${this.SETTINGS.PROVIDER_OVERRIDE_PDF_FONTS_SELECTION}.hint`,
            scope: 'client',
            config: true,
            type: String,
            choices: {
                Courier: 'Courier',
                CourierBold: 'Courier Bold',
                CourierOblique: 'Courier Oblique',
                CourierBoldOblique: 'Courier Bold Oblique',
                Helvetica: 'Helvetica',
                HelveticaBold: 'Helvetica Bold',
                HelveticaOblique: 'Helvetica Oblique',
                HelveticaBoldOblique: 'Helvetica Bold Oblique',
                TimesRoman: 'Times Roman',
                TimesRomanBold: 'Times Roman Bold',
                TimesRomanItalic: 'Times Roman Italic',
                TimesRomanBoldItalic: 'Times Roman Bold Italic',
                Symbol: 'Symbol',
                ZapfDingbats: 'Zapf Dingbats',
            },
            restricted: false,
            requiresReload: false,
            default: 'Helvetica',
        });

        game.settings.register(this.ID, this.SETTINGS.ALL_PROVIDERS, {
            name: `ACTOR-EXPORT.settings.${this.SETTINGS.ALL_PROVIDERS}.name`,
            hint: `ACTOR-EXPORT.settings.${this.SETTINGS.ALL_PROVIDERS}.hint`,
            scope: 'world',
            config: false,
            type: Array,
            default: [],
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
     * Returns an array of all providers found by the GM in ./providers
     * @returns {Array}
     */
    static async providers() {
        let providers = [];
        let ls;
        if (game.user.isGM) {
            if (parseFloat(game.version) >= 13) {
                ls = await foundry.applications.apps.FilePicker.browse('data', `modules/${this.ID}/providers`);
            } else {
                ls = await FilePicker.browse('data', `modules/${this.ID}/providers`);
            }
            for (let i = 0; i < ls.dirs.length; i++) {
                let dir = ls.dirs[i];
                let response = await fetch(`${dir}/sheet.json`);
                let json = await response.json();
                providers.push(this.evalProviderRequirements(json));
            }
            await game.settings.set(actorExport.ID, actorExport.SETTINGS.ALL_PROVIDERS, providers);
        } else {
            providers = await game.settings.get(actorExport.ID, actorExport.SETTINGS.ALL_PROVIDERS);
        }
        return providers;
    }

    static sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Evaluate and enrich the provider information. Returns the same object
     * with an additional property indicating if the provider is available to the current
     * game version, system version and module version(s)
     * @param {Object} provider - The provider object to evaluate
     * @returns {Object}
     */
    static evalProviderRequirements(provider) {
        const foundryvtt_version = game.version;
        const system = game.system.id;
        const system_version = game.system.version;
        const modules = game.modules.filter((f) => f.active);

        provider.allowed = false;
        if (provider.requirements.length === 0) {
            provider.allowed = true;
        }
        const allowed = [];
        provider.requirements.forEach((req) => {
            if (typeof req.foundryvtt_version !== 'undefined') {
                allowed.push(this.evalVersion(foundryvtt_version, req.foundryvtt_version, req.foundryvtt_operator));
            } else if (typeof req.system !== 'undefined' && req.system === system) {
                allowed.push(this.evalVersion(system_version, req.system_version, req.system_operator));
            } else if (typeof req.module !== 'undefined' && modules.map((m) => m.id).includes(req.module)) {
                const module = modules.filter((f) => f.id === req.module)[0];
                allowed.push(this.evalVersion(module.version, req.module_version, req.module_operator));
            } else {
                allowed.push(false);
            }
        });
        if (allowed.filter((f) => f).length === provider.requirements.length) {
            provider.allowed = true;
        }
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
     *
     * @param {string} provider - unique identifier for the provider
     * @returns
     */
    static providerPath(provider) {
        return `/modules/${this.ID}/providers/${provider}`;
    }

    /**
     * Return the full path to the specified path
     * @param {string} filePath - the path to the file to be parsed
     * @param {string} provider - unique identifier for the provider
     * @returns {string}
     */
    static parseFilePath(filePath, provider) {
        /* FIXME: check if the URI is complete before building it */
        return this.providerPath(provider) + `/${filePath}`;
    }

    static providerFileProgress(html) {
        const isDisabled = $(html).find('input').prop('disabled');
        if (!isDisabled) {
            html.classList.add('working');
        } else {
            html.classList.remove('working');
            document.getElementById('download_counter').value =
                parseInt(document.getElementById('download_counter').value) - 1;
        }
        $(html).find('input').prop('disabled', !isDisabled);
        if (parseInt(document.getElementById('download_counter').value) > 0) {
            document.getElementById('actor-export-download').disabled = true;
            document.getElementById('actor-export-spinner-canvas').style.display = 'flex';
        } else {
            document.getElementById('actor-export-download').disabled = false;
            document.getElementById('actor-export-spinner-canvas').style.display = 'none';
        }
    }
}

/**
 * @class
 * A form class for the Actor Export Dialog
 * @param {Object} actor the Foundry VTT actor object
 * @extends FormApplication
 * NOTE: This is deprecated and should be replaced by V2 Application Framework
 * foundry.applications.api.ApplicationV2
 */
class actorExportDialog extends FormApplication {
    constructor(actor) {
        super();
        this.actor = actor;
        this.customProviderFile = undefined;
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
            actorType: this.actor.type,
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
        const uploadCustomProviderFileButton = document.getElementById('upload-file');
        if (uploadCustomProviderFileButton !== null) {
            uploadCustomProviderFileButton.addEventListener('change', (event) => {
                this.customProviderFile = event.currentTarget.files[0];
            });
        }

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
        const selectedFiles = {};
        document
            .getElementById('actor-export-form')
            .querySelectorAll('input[type=checkbox]')
            .forEach((input) => {
                if (input.checked) {
                    document.getElementById('download_counter').value =
                        parseInt(document.getElementById('download_counter').value) + 1;
                    actorExport.providerFileProgress(document.getElementById(`field.${input.id}`));
                    if (!Object.keys(selectedFiles).includes(input.getAttribute('data-provider'))) {
                        selectedFiles[input.getAttribute('data-provider')] = [];
                    }
                    selectedFiles[input.getAttribute('data-provider')].push(input.getAttribute('data-file'));
                }
            });
        if (Object.keys(selectedFiles).length === 0) {
            ui.notifications.warn('You must select at least one provider to export your character!');
            return false;
        }
        ui.notifications.info('Please wait, this may take a while...');
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
                            try {
                                const mapper = module.mapper.clone();
                                mapper.customProviderFile = this.customProviderFile;
                                mapper.download(
                                    actorExport.providerPath(providerId),
                                    undefined,
                                    undefined,
                                    function () {
                                        actorExport.providerFileProgress(
                                            document.getElementById('field._custom_._custom_')
                                        );
                                    }
                                );
                            } catch (error) {
                                actorExport.log('error', error);
                                ui.notifications.error(
                                    `${actorExport.ID} | An error ocurred downloading the custom provider file.`,
                                    {
                                        permanent: true,
                                    }
                                );
                                actorExport.providerFileProgress(document.getElementById('field._custom_._custom_'));
                            }
                        }
                    })
                    .catch((error) => {
                        actorExport.log('error', error);
                        ui.notifications.error(`${actorExport.ID} | An error ocurred executing the custom provider.`, {
                            permanent: true,
                        });
                        actorExport.providerFileProgress(document.getElementById('field._custom_._custom_'));
                    });
            } else {
                dataUri = `/modules/${actorExport.ID}/providers/${providerId}/provider.js?t=${Date.now()}`;
                import(dataUri)
                    .then((module) => {
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
                                const mapper = module.mapper.clone();
                                if (this.providers.filter((i) => i.id === providerId).length !== 1) {
                                    ui.notifications.error(
                                        `${actorExport.ID} | Could not find provider info for ${providerId}.`
                                    );
                                    return;
                                }
                                const providerInfo = this.providers.filter((i) => i.id === providerId)[0];
                                const fileInfo = providerInfo.files.filter(
                                    (i) => i.uri === selectedFiles[providerId][f]
                                );
                                if (fileInfo.length != 1) {
                                    ui.notifications.error(
                                        `${actorExport.ID} | Something bad happened trying to locate file information for ${selectedFiles[providerId][f]} in provider ${providerId}.`
                                    );
                                    return;
                                }
                                const destinationFileName = `${mapper.actorName} - ${fileInfo[0].uri.split('/').pop()}`;
                                try {
                                    mapper.download(
                                        actorExport.providerPath(providerId),
                                        fileInfo[0].uri,
                                        destinationFileName,
                                        function () {
                                            actorExport.providerFileProgress(
                                                document.getElementById(
                                                    `field.${providerId}.${selectedFiles[providerId][f]}`
                                                )
                                            );
                                        }
                                    );
                                } catch (error) {
                                    actorExport.log('error', error);
                                    ui.notifications.error(
                                        `${actorExport.ID} | An error ocurred downloading '${selectedFiles[providerId][f]}' from the '${providerId}' provider file.`,
                                        {
                                            permanent: true,
                                        }
                                    );
                                    actorExport.providerFileProgress(
                                        document.getElementById(`field.${providerId}.${selectedFiles[providerId][f]}`)
                                    );
                                }
                            }
                        }
                    })
                    .catch((error) => {
                        ui.notifications.error(
                            `${actorExport.ID} | An error ocurred executing the '${providerId}' provider: ${error.message}`,
                            {
                                permanent: true,
                            }
                        );
                        throw new Error(error);
                    });
            }
        }
    }
}

/**
 * @class
 * A form class for the Actor Export Custom Dialog
 * @extends FormApplication
 * NOTE: This is deprecated and should be replaced by V2 Application Framework
 */
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
        import { scribeProvider } from '${window.location.protocol}//${window.location.hostname}/modules/actor-export/scripts/lib/providers/ScribeProvider.js';

        // The full URI above must be specified.

        // actor is a global variable containing the actor's information
        // baseProvider is a skeleton with base functionality for the export not to fail. It needs to be enhanced in some way.
        // pdfProvider is a fully functional class which can be used to export to premade PDFs
        // scribeProvider is a fully functional class which can be used to export to a markdown format supported by https://scribe.pf2.tools/

        // More info can be found here: https://github.com/bushvin/actor-export/wiki
        // The sections about Custom Providers and API Documentation should help you

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
 * @class
 * A form class for the providers settings dialog
 * @extends FormApplication
 * NOTE: This is deprecated and should be replaced by V2 Application Framework
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
 * Add the 'Export' button in the character's actor dialog for ApplicationV1
 */
Hooks.on('getActorSheetHeaderButtons', (sheet, buttons) => {
    Handlebars.registerHelper(`${actorExport.ID}-ifIsNullish`, function (value, options) {
        if (value == null) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper(`${actorExport.ID}-ifIn`, function (haystack, needle, options) {
        if (typeof haystack === 'undefined' || haystack.length == 0) {
            return options.fn(this);
        }
        if (haystack.indexOf(needle) > -1) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    if (['character', 'familiar', 'npc', 'pc'].includes(sheet.actor.type)) {
        buttons.unshift({
            label: 'ACTOR-EXPORT.actor-dialog.header-button.label',
            class: 'actor-export',
            icon: 'fa fa-address-card',
            onclick: () => {
                new actorExportDialog(sheet.actor).render(true);
            },
        });
    } else {
        console.debug('Found an unsupported actor type:', sheet.actor.type);
    }
});

/**
 * Add the 'Export' button in the character's actor dialog for ApplicationV2
 */
Hooks.on('getHeaderControlsApplicationV2', (sheet, buttons) => {
    Handlebars.registerHelper(`${actorExport.ID}-ifIsNullish`, function (value, options) {
        if (value == null) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper(`${actorExport.ID}-ifIn`, function (haystack, needle, options) {
        if (typeof haystack === 'undefined' || haystack.length == 0) {
            return options.fn(this);
        }
        if (haystack.indexOf(needle) > -1) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
    if (['character', 'familiar', 'npc', 'pc'].includes(sheet.actor.type)) {
        buttons.unshift({
            label: 'ACTOR-EXPORT.actor-dialog.header-button.label',
            class: 'actor-export',
            icon: 'fa fa-address-card',
            onClick: () => {
                console.log('Clicked');
                new actorExportDialog(sheet.actor).render(true);
            },
        });
    } else {
        console.debug('Found an unsupported actor type:', sheet.actor.type);
    }
});
