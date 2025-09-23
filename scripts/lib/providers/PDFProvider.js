import { baseProvider } from './BaseProvider.js';
import { genericHelper } from '../helpers/GenericHelper.js';
import { layoutMultilineText, PDFDocument, StandardFonts, rgb } from './pdf-lib.esm.js';
import fontkit from './fontkit.es.js';

/**
 * PDFProvider module
 * @module PDFProvider
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * @class
 * A class to manipulate PDF files.
 *
 * You should use:
 *   - pdfProvider.field to add form field text
 *   - pdfProvider.image to add images
 *   - pdfProvider.textBox to add text boxes
 * @param {Object} actor The Foundry VTT actor object.
 * @extends baseProvider
 * @requires pdf-lib
 * @requires fontkit
 * @requires pako
 * requires pdf-lib.esm
 * url: https://cdnjs.com/libraries/pdf-lib
 * requires fontkit.es
 * url: https://unpkg.com/@pdf-lib/fontkit/dist/fontkit.es.js
 * requires pako.esm
 * url: https://cdnjs.com/libraries/pako
 */
export class pdfProvider extends baseProvider {
    constructor(actor) {
        super(actor);
        this.pdfTitle = undefined;
        this.pdfFields = [];
        this.pdfImages = [];
        this.pdfTextBoxes = [];
        this.failedFields = [];
        this.pdfEmbeddedFonts = {};

        this.pdfFontName = '';
        this.pdfFontSize = 0;
        this.pdfFontLineHeight = 0;
        this.pdfFontColor = '#000000';

        this.pdfOverrideFont = game.settings.get(this._moduleID, this._moduleSettings['PROVIDER_OVERRIDE_PDF_FONTS']);
        this.pdfOverrideFontName = game.settings.get(
            this._moduleID,
            this._moduleSettings['PROVIDER_OVERRIDE_PDF_FONTS_SELECTION']
        );

        this.pdf = undefined;
    }

    /**
     * Convert Hexadecimal color (HTML) to RGB
     * @param {string} hex The hexadecimal value (html color) representing a color
     * @param {number[]} [defaultRGB=[0, 0, 0]] The default color to return if @param hex is invalid
     * @returns {number[]} the RGB color code in % for each of the main colors, or the color code for black
     */
    convertHexColorToRgb(hex, defaultRGB = [0, 0, 0]) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? [
                  Math.round((parseInt(result[1], 16) / 255) * 100) / 100,
                  Math.round((parseInt(result[2], 16) / 255) * 100) / 100,
                  Math.round((parseInt(result[3], 16) / 255) * 100) / 100,
              ]
            : defaultRGB;
    }

    /**
     * Create a file when no file is associated with the provider sheet
     */
    async createFile() {
        if (typeof this.customProviderFile !== 'undefined') {
            this.customProviderFileArrayBuffer = await this.uploadCustomProviderFile();
            this.providerFilePath = await this.customProviderFile.name;
            this.providerDestinationFileName = await this.customProviderFile.name;
            return new Promise((resolve) => {
                resolve({ ok: true });
            });
        }
    }

    /**
     * Set the default font, size and lineheight for text boxes
     * @param {string} font The name of the font file
     * @param {number} size The size of the font
     * @param {number} [lineHeight=size] The lineheight of the font
     */
    defaultFont(font, size, lineHeight = undefined) {
        // TODO: should we check the font is available?
        this.pdfFontName = font;
        if (lineHeight === undefined) {
            lineHeight = size;
        }

        if (!isNaN(Number(size))) {
            this.pdfFontSize = Number(size);
        } else {
            this.notify('error', `The default font size specified (${size}) is invalid`, {
                permanent: true,
            });
            return;
        }

        if (!isNaN(Number(lineHeight))) {
            this.pdfFontLineHeight = Number(lineHeight);
        } else {
            this.notify('error', `The default font lineHeight specified (${lineHeight}) is invalid`, {
                permanent: true,
            });
            return;
        }
    }

    /**
     * Set the default font color for text boxes
     * @param {string|rgb} color an HTML or fontkit rgb color.<br />
     * `import rgb from './pdf-lib.esm.js'; const black = rgb(0,0,0);`
     */
    defaultFontColor(color) {
        this.pdfFontColor = color;
    }

    /**
     * Embed an image to the given PDF Object
     * @async
     * @param {Object} imageData an Object containing path, (x,y) coordinates, scaling information, etc...
     * @param {number} imageData.page the page to embed the image in. Pages start at 0
     * @param {number} imageData.x the x coordinate to embed the image at
     * @param {number} imageData.y the y coordinate to embed the image at
     * @param {string} imageData.path the url to the image to embed
     * @param {number} imageData.maxWidth the maximum width of the image
     * @param {number} imageData.maxHeight the maximum height of the image
     */
    async embedImage(imageData) {
        const { page, x, y, path, maxWidth, maxHeight } = imageData;

        // Load the image
        let htmlImage;
        try {
            htmlImage = await this.loadImage(path);
        } catch (error) {
            this.notify('warning', `Could not load image \`${path}\`. Please make sure it exists!`, {
                permanent: true,
            });
            return;
        }

        const pdfPages = this.pdf.getPages();
        if (pdfPages.length < page + 1) {
            this.notify(
                'warning',
                `An image was requested for this file, but there aren't enough pages in the PDF file: ${path}`
            );
            return;
        }
        const pdfPage = pdfPages[page];
        const pageHeight = pdfPage.getHeight();

        // Calculate scaling
        const scaleHeight = maxHeight > 0 ? maxHeight / htmlImage.height : 1;
        const scaleWidth = maxWidth > 0 ? maxWidth / htmlImage.width : 1;
        const scale = Math.min(scaleHeight, scaleWidth);

        let embeddedImage;
        try {
            const canvas = new OffscreenCanvas(htmlImage.width, htmlImage.height);
            const context = canvas.getContext('2d');
            context.drawImage(htmlImage, 0, 0);
            const blob = await context.canvas.convertToBlob({ type: 'image/png' });
            const imageBuffer = await blob.arrayBuffer();
            embeddedImage = await this.pdf.embedPng(imageBuffer);
        } catch (error) {
            this.notify('warning', `Failed to embed the image: ${error}`);
            return;
        }

        // Draw the image on the PDF page
        const realX = x;
        const realY = pageHeight - y - embeddedImage.height * scale;

        const imageOptions = {
            x: realX,
            y: realY,
            width: embeddedImage.width * scale,
            height: embeddedImage.height * scale,
        };
        pdfPage.drawImage(embeddedImage, imageOptions);
    }

    /**
     * Embed a font into the given PDF
     * @async
     * @param {string} fontName the case insensitive name of the standard font (pdf-lib.StandardFonts) or font filename.
     * Current StandardFonts are: Courier, CourierBold, CourierOblique, CourierBoldOblique, Helvetica, HelveticaBold, HelveticaOblique, HelveticaBoldOblique, TimesRoman, TimesRomanBold, TimesRomanItalic, TimesRomanBoldItalic, Symbol, ZapfDingbats
     * @returns {CustomFontEmbedder} The resulted embedded font
     */
    async embedFont(fontName) {
        const embeddedFontIndex = Object.keys(this.pdfEmbeddedFonts)
            .map((m) => m.toLocaleLowerCase())
            .indexOf(fontName.toLowerCase());

        if (embeddedFontIndex > -1) {
            return Object.values(this.pdfEmbeddedFonts)[embeddedFontIndex];
        }

        const standardFontIndex = Object.keys(StandardFonts)
            .map((m) => m.toLowerCase())
            .indexOf(fontName.toLowerCase());

        if (standardFontIndex === -1) {
            // A font file is specified
            const moduleRootPath = this.providerRootPath.split('/').slice(0, this.providerRootPath.split('/').length - 2).join('/');
            const fontURIs = [
                `${this.providerRootPath}/fonts/${fontName}?t=${Date.now()}`,
                `${moduleRootPath}/fonts/${fontName}?t=${Date.now()}`,
            ];
            let errorCount = 0;
            for (let i = 0; i < fontURIs.length; i++) {
                const res = await fetch(fontURIs[i], { cache: 'no-store' });
                if (res.ok) {
                    const fontBytes = await res.arrayBuffer();
                    try {
                        this.pdfEmbeddedFonts[fontName] = await this.pdf.embedFont(fontBytes);
                    } catch (error) {
                        errorCount++;
                    }
                }
            }

            // If none of the font URIs could be embedded, raise an error
            if (errorCount === fontURIs.length) {
                this.notify('error', `Could not load font ${fontName}. Please make sure it exists.`);
                throw new Error(`Failed to embed font ${fontName}.`);
            }
        } else {
            // A standard font is specified
            this.pdfEmbeddedFonts[fontName] = await this.pdf.embedFont(Object.values(StandardFonts)[standardFontIndex]);
        }
        return this.pdfEmbeddedFonts[fontName];
    }

    /**
     * Embed a Text Box to the given PDF Object
     * @async
     * @param {Object} textBoxData an Object containing path, (x,y) coordinates, scaling information, etc...
     * @param {string} textBoxData.reference a reference to the field (for debugging purposes)
     * @param {string} textBoxData.file the name pf the pdf file to embed the text in to
     * @param {number} textBoxData.page the page to embed the text on. Pages start at 0
     * @param {number} textBoxData.x the x coordinate to start the textbox at.
     * @param {number} textBoxData.y the y coordinate to start the textbox at.
     * @param {number} textBoxData.width the width of the textbox
     * @param {number} textBoxData.height the height of the textbox
     * @param {string} textBoxData.text the text to be printer
     * @param {Object} textBoxData.options the options for the text to be printed
     * @param {Number} textBoxData.options.lineHeight textbox line height
     * @param {Boolean} textBoxData.options.overflow allow textbox to overflow the boundaries
     * @param {Boolean} textBoxData.options.overrideFont allow the font to be overridden by the override font
     * @param {String} textBoxData.options.prefix A prefix to be added before the text
     * @param {Number} textBoxData.options.size size of the font
     * @param {Function} textBoxData.options.sizeParser provide a function to calculate fontsize based on the result of the Promised text value
     * @param {Function} textBoxData.options.suffix A suffix to be added to the text
     * @param {Function} textBoxData.options.color hexadecimal color for the text
     * @param {Function} textBoxData.options.width maximum width of the textbox
     * @param {Function} textBoxData.options.height maximum height of the textbox
     */
    async embedTextBox(textBoxData) {
        const { reference, file, page, x, y, width, height, text, options } = textBoxData;
        const pdfPages = this.pdf.getPages();
        if (pdfPages.length < page + 1) {
            const debug = {
                reference: reference,
                file: file,
                page: page,
                x: x,
                y: y,
                width: width,
                height: height,
                text: text,
                options: options,
            };
            this.notify(
                'warning',
                `A text box was requested for this file, but there aren't enough pages in the PDF file. The textbox is not rendered on the PDF.`,
                { permanent: true }
            );
            console.debug('debug information:', debug);
            return;
        }

        const pageHeight = pdfPages[page].getHeight();
        const textOptions = {
            lineHeight: options.lineHeight,
            overflow: this.pdfTextBoxOverflow || false,
            overrideFont: true,
            prefix: '',
            size: this.pdfFontSize,
            sizeParser: undefined,
            suffix: '',
            ...options,
            color: rgb(...this.convertHexColorToRgb(options.color || this.pdfFontColor)),
            width: width,
            height: height,
        };

        textOptions.overrideFont = Boolean(textOptions.overrideFont);

        if (this.pdfOverrideFont && textOptions.overrideFont) {
            textOptions.font = this.pdfOverrideFontName;
        }
        const fontName = textOptions.font || this.pdfFontName;
        await this.embedFont(fontName);

        const embeddedFontIndex = Object.keys(this.pdfEmbeddedFonts)
            .map((m) => m.toLocaleLowerCase())
            .indexOf(fontName.toLowerCase());

        if (embeddedFontIndex > -1) {
            textOptions.font = Object.values(this.pdfEmbeddedFonts)[embeddedFontIndex];
        }

        let textWidth = 0;
        let textHeight = 0;
        let textLineHeight = 0;
        let modifiedText = this.cleanFoundryMarkup(
            String(await this.parseValue(text, textOptions.valueParser)),
            genericHelper
        );
        if (typeof textOptions.sizeParser == 'function' && !isNaN(textOptions.sizeParser(modifiedText))) {
            textOptions.size = textOptions.sizeParser(modifiedText);
        }
        if (textOptions.multiline !== undefined && textOptions.multiline === true) {
            // add multiline text to the pdf
            const multiLineOptions = {
                alignment: textOptions.halign,
                fontSize: textOptions.size,
                lineHeight: textOptions.lineHeight,
                bounds: { height: textOptions.height, width: textOptions.width },
            };
            if (typeof textOptions.font !== 'undefined') {
                multiLineOptions.font = textOptions.font;
            }
            const multiLine = layoutMultilineText(
                (textOptions.prefix + modifiedText + textOptions.suffix).trim(),
                multiLineOptions
            );
            textWidth = Math.max(...multiLine.lines.map((i) => i.width));
            textHeight = 0;
            for (let i = 0; i < multiLine.lines.length; i++) {
                if (multiLine.lines[i].text.trim() !== '' && textHeight < textOptions.height) {
                    textHeight = textHeight + multiLine.lineHeight;
                }
            }
            textLineHeight = multiLine.lineHeight;
            textOptions.maxWidth = textOptions.width;
            if (textOptions.debug || this.debugProvider || false) {
                console.debug(
                    this._moduleID,
                    '| PDF | rawText:',
                    (textOptions.prefix + modifiedText + textOptions.suffix).trim()
                );
                console.debug(this._moduleID, '| PDF | multiLine:', multiLine);
                console.debug(this._moduleID, '| PDF | modifiedText:', modifiedText);
                console.debug(this._moduleID, '| PDF | textHeight:', textHeight);
                console.debug(this._moduleID, '| PDF | options:', options);
            }
            if (!textOptions.overflow) {
                const lineCount = Math.floor(textHeight / textLineHeight);
                if (multiLine.lines.length > lineCount) {
                    modifiedText = multiLine.lines
                        .map((m) => m.text)
                        .slice(0, lineCount - 1)
                        .concat(['. . .'])
                        .join('\n');
                }
            }
            modifiedText = textOptions.prefix + modifiedText + textOptions.suffix;
        } else {
            // add a single line to the pdf
            // TODO: what if font is undefined?
            textWidth = textOptions.font.widthOfTextAtSize(
                textOptions.prefix + modifiedText + textOptions.suffix,
                textOptions.size
            );
            if (!textOptions.overflow) {
                let threeDots = false;
                while (modifiedText.length > 0 && textWidth > textOptions.width) {
                    modifiedText = modifiedText.substring(0, modifiedText.length - 1);
                    textWidth = textOptions.font.widthOfTextAtSize(
                        textOptions.prefix + modifiedText + ' ...' + textOptions.suffix,
                        textOptions.size
                    );
                    threeDots = true;
                }
                if (modifiedText.length === 0) {
                    modifiedText = this.cleanFoundryMarkup(
                        String(await this.parseValue(text, textOptions.valueParser)),
                        genericHelper
                    );
                    threeDots = false;
                }
                if (threeDots) {
                    modifiedText = textOptions.prefix + modifiedText + ' ...' + textOptions.suffix;
                } else {
                    modifiedText = textOptions.prefix + modifiedText + textOptions.suffix;
                }
            } else {
                modifiedText = textOptions.prefix + modifiedText + textOptions.suffix;
            }
            textHeight = textOptions.lineHeight;
            textLineHeight = textOptions.lineHeight;
        }

        // Horizontal alignment
        textOptions.x = x;
        if ((textOptions.halign || 'left') === 'center') {
            textOptions.x = textOptions.x + (textOptions.width - textWidth) / 2;
        } else if ((textOptions.halign || 'left') === 'right') {
            textOptions.x = textOptions.x + textOptions.width - textWidth;
        }

        // Vertical alignment
        textOptions.y = pageHeight - y - textOptions.height;
        if ((textOptions.valign || 'bottom') === 'top') {
            textOptions.y = textOptions.y + textOptions.height - textLineHeight;
        } else if ((textOptions.valign || 'bottom') === 'middle') {
            textOptions.y = textOptions.y + (textOptions.height - textLineHeight) / 2;
        }

        if (textOptions.debug || this.debugProvider || false) {
            console.debug(this._moduleID, '| PDF |', reference);
            console.debug(this._moduleID, '| PDF | real x, y:', x, pageHeight - y - textOptions.height);
            console.debug(this._moduleID, '| PDF | textOptions:', textOptions);
            pdfPages[page].drawRectangle({
                x: x,
                y: pageHeight - y - textOptions.height,
                width: textOptions.width,
                height: textOptions.height,
                borderColor: rgb(1, 0, 0),
            });
        }
        if (modifiedText != '') {
            if (textOptions.debug || this.debugProvider || false) {
                pdfPages[page].drawRectangle({
                    x: textOptions.x,
                    y: textOptions.y - textHeight + textLineHeight,
                    width: textWidth,
                    height: textHeight,
                    borderColor: rgb(0, 1, 1),
                });
            }
            pdfPages[page].drawText(modifiedText.trim(), textOptions);
        }
    }

    /**
     * Store form field information,
     * text for text fields, booleans for checkboxes
     * @param {string} file the pdf filename to apply the image to ('all' means all PDFs)
     * @param {string} name The name of the field to reference
     * @param {string|boolean|Promise} value The value to be applied to the field
     * @param {Object} options Optional data, functions for the field
     * @param {Function} options.parseValue function to parse the value after resolving the value Promise
     */
    field(file, name, value, options) {
        if (this.pdfFields.filter((i) => i.file === file && i.name === name).length) {
            this.notify('warning', `${name} has already been defined. Discarding the new value.`);
            return;
        }
        let field = {
            file: String(file).trim(),
            name: String(name).trim(),
            value: value,
            options: options || {},
        };
        this.pdfFields.push(field);
    }

    /**
     * Check if a value for a form field is defined
     * @param {string} file  The name of the PDF file a field belongs to
     * @param {string} name The name of the field to return the value from
     * @returns {boolean} whether the field is defined
     */
    fieldExists(file, name) {
        const field = this.getField(file, name);
        return typeof field !== undefined;
    }

    /**
     * Return a PDF field object definition
     * @async
     * @param {string} file The name of the PDF file a field belongs to
     * @param {string} name The name of the field to return the value from
     * @returns {Object|undefined} the requested field data
     */
    async getField(file, name) {
        try {
            if (
                this.pdfFields.filter((i) => i.file.toLowerCase() === file.toLowerCase() && i.name === name).length > 0
            ) {
                return this.pdfFields.filter((i) => i.file === file && i.name === name)[0];
            } else if (this.pdfFields.filter((i) => i.file.toLowerCase() === 'all' && i.name === name).length > 0) {
                return this.pdfFields.filter((i) => i.file.toLowerCase() === 'all' && i.name === name)[0];
            } else if (
                this.pdfFields.filter(
                    (i) =>
                        (i.file.toLowerCase() === file.toLowerCase() || i.file.toLowerCase() === 'all') &&
                        i.name === name
                ).length === 0
            ) {
                return undefined;
            }
        } catch (error) {
            this.notify('error', 'An error ocurred fetching a field');
            console.error('file', file);
            console.error('name', name);
            throw error;
        }
    }

    /**
     * Return a PDF form field value
     * @async
     * @param {string} file The name of the PDF file a field belongs to
     * @param {string} name The name of the field to return the value from
     * @param {string|boolean} defaultValue The value to return if the field cannot be found
     * @returns {string|boolean} - the requested field
     */
    async getFieldValue(file, name, defaultValue) {
        const field = await this.getField(file, name);
        if (typeof field !== 'undefined') {
            return this.parseValue(field.value, field.options.parseValue);
        } else {
            return defaultValue;
        }
    }

    /**
     * Get the options associated to a form field
     * @param {string} file The name of the PDF file a field belongs to
     * @param {string} name The name of the field to return the value from
     * @param {string} optionName Optional name of a field to return
     * @returns {Object|string|boolean|number} the requested field option(s)
     */
    getFieldOptions(file, name, optionName) {
        const field = this.getField(file, name);
        if (typeof field === 'undefined') {
            return {};
        } else if (typeof optionName === 'undefined') {
            return field.options;
        } else {
            return field.options[optionName];
        }
    }

    /**
     * Store image information
     * @param {string|string[]} file the pdf filename(s) to apply the image to ('all' means all PDFs)
     * @param {number|number[]} page The page(s) to add the image to
     * @param {number} x The x coordinate for the image
     * @param {number} y The y coordinate for the image
     * @param {string} path The url to the image to add
     * @param {number} [maxWidth] The maximum width of the Image
     * @param {number} [maxHeight] The maximum height of the Image
     * @param {object} [options] Additional options
     */
    image(file, page, x, y, path, maxWidth = -1, maxHeight = -1, options) {
        let fail = false;
        if (typeof file === 'undefined') {
            this.notify('error', `No pdf filename defined for new image;`);
            fail = true;
        }
        if (!Array.isArray(file)) {
            file = [file];
        }
        for (let i = 0; i < file.length; i++) {
            if (typeof file[i] !== 'string') {
                this.notify('error', 'An invalid pdf filename is defined: %s, type: %s;' % (file[i], typeof file[i]));
                fail = true;
            } else {
                file[i] = String(file[i]).trim();
            }
        }

        if (typeof page === 'undefined') {
            this.notify('error', `No page defined for new image;`);
            fail = true;
        }
        if (!Array.isArray(page)) {
            page = [page];
        }
        page.forEach((n) => {
            if (typeof n !== 'number') {
                this.notify('error', 'An invalid pdf page number is defined: %s, type: %s;' % (n, typeof n));
                fail = true;
            }
        });

        if (typeof x === 'undefined') {
            this.notify('error', `No x coordinate defined for new image;`);
            fail = true;
        } else if (isNaN(Number(x))) {
            this.notify('error', `the x coordinate (${x}) is an invalid type for new image;`);
            fail = true;
        }

        if (typeof y === 'undefined') {
            this.notify('error', `No y coordinate defined for new image;`);
            fail = true;
        } else if (isNaN(Number(y))) {
            this.notify('error', `the y coordinate (${y}) is an invalid type for new image;`);
            fail = true;
        }

        if (typeof path !== 'string') {
            this.notify('error', `Invalid value type for the image;`);
            fail = true;
        }
        if (typeof maxWidth === 'undefined') {
            this.notify('error', `No maximum width defined for new image;`);
            fail = true;
        } else if (isNaN(Number(x))) {
            this.notify('error', `the maximum width is an invalid type for new image;`);
            fail = true;
        }

        if (typeof maxHeight === 'undefined') {
            this.notify('error', `No maximum height defined for new image;`);
            fail = true;
        } else if (isNaN(Number(x))) {
            this.notify('error', `the maximum height is an invalid type for new image;`);
            fail = true;
        }

        if (typeof path === 'undefined') {
            this.notify('error', `No image path defined for new image;`);
            fail = true;
        }

        if (typeof options === 'undefined') {
            options = {};
        } else if (!(typeof options === 'object' && options.constructor === Object)) {
            this.notify('error', `An invalid options value is specified: %s, type: %s;` % (options, typeof options));
            fail = true;
        }

        if (fail) {
            const ret = {
                file: file,
                page: page,
                x: x,
                y: y,
                path: path,
                maxHeight: maxHeight,
                maxWidth: maxWidth,
                options: options,
            };
            console.debug('data', ret);
            return;
        }

        if (this.pdfImages.filter((i) => i.page === page && i.x === x && i.y === y).length) {
            this.notify(
                'warning',
                `An image on page ${page} with coordinates (${x},${y}) already exists. Discarding new value.`
            );
            return;
        }

        file.forEach((f) => {
            page.forEach((p) => {
                const imageInfo = {
                    file: f,
                    page: p,
                    x: Number(x),
                    y: Number(y),
                    path: String(path).trim(),
                    maxHeight: Number(maxHeight),
                    maxWidth: Number(maxWidth),
                    options: options,
                };
                this.pdfImages.push(imageInfo);
            });
        });
    }

    /**
     * Parses the provided filedata, fills out pdf form fields, adds images and saves the blob
     * @async
     */
    async updateFile() {
        try {
            let buffer;
            if (typeof this.customProviderFile === 'undefined') {
                buffer = await this.fileResponse.arrayBuffer();
            } else {
                buffer = this.customProviderFileArrayBuffer;
            }
            const pdf = await PDFDocument.load(buffer);
            this.pdf = pdf;
            pdf.registerFontkit(fontkit);

            // Fill out form fields
            let pdfForm = null;
            let pdfFormFields = [];
            try {
                pdfForm = pdf.getForm();
                pdfFormFields = pdfForm.getFields();
            } catch (error) {
                this.notify(
                    'error',
                    `An error ocurred loading the pdf form for ${this.providerFullFilePath}: ${error.message}`,
                    {
                        permanent: true,
                    }
                );
                throw Error(error);
            }

            for (let i = 0; i < pdfFormFields.length; i++) {
                const pdfField = pdfFormFields[i];
                const fieldName = pdfField.getName().trim();
                const fieldType = pdfField.constructor.name.trim();

                if (this.fieldExists(this.providerFilePath, fieldName)) {
                    switch (fieldType) {
                        case 'PDFTextField':
                            let stringValue = String(await this.getFieldValue(this.providerFilePath, fieldName, ''));
                            pdfField.setText(stringValue);
                            pdfField.markAsClean();
                            break;
                        case 'PDFCheckBox':
                            let booleanValue = Boolean(
                                await this.getFieldValue(this.providerFilePath, fieldName, false)
                            );
                            booleanValue ? pdfField.check() : pdfField.uncheck();
                            break;
                        case 'PDFButton':
                            // This is not a form field type we want to handle
                            break;
                        default:
                            this.notify(
                                'warning',
                                `An unknown field type found while parsing the PDF form fields: fieldName: :${fieldName}:, fieldType: :${fieldType}:`
                            );
                    }
                }
            }

            // embed images
            for (let i = 0; i < this.pdfImages.length; i++) {
                const image = this.pdfImages[i];
                if (image.file.toLowerCase() === 'all' || image.file === this.providerFilePath) {
                    await this.embedImage(image);
                }
            }

            // embed text boxes
            for (let i = 0; i < this.pdfTextBoxes.length; i++) {
                const textBox = this.pdfTextBoxes[i];
                if (textBox.file.toLowerCase() === 'all' || textBox.file === this.providerFilePath) {
                    await this.embedTextBox(textBox);
                }
            }
        } catch (error) {
            // Notify users of any errors that occurred during the parsing process
            this.notify('error', `Failed to parse PDF: ${error.message}`, {
                permanent: true,
            });
            console.error('error', error);
            throw error; // Rethrow the error for further handling if needed
        }
    }

    /**
     * Save the generated PDF to disk
     */
    async saveFile() {
        const destinationFileName = this.overrideDestinationFileName || this.providerDestinationFileName;
        if (this.debugProvider || false) {
            const pdfForm = this.pdf.getForm();
            const pdfFormFields = pdfForm.getFields();
            const pdfFormSchema = [];
            for (let i = 0; i < pdfFormFields.length; i++) {
                const pdfField = pdfFormFields[i];
                pdfFormSchema.push({
                    name: pdfField.getName().trim(),
                    type: pdfField.constructor.name.trim(),
                });
            }
            console.debug(
                this._moduleID,
                `| PDF | ${this.providerFilePath} contains ${pdfFormSchema.length} form fields`
            );
            console.debug(this._moduleID, '| PDF | fields:', pdfFormSchema);

            const pdfPages = this.pdf.getPages();
            for (let c = 0; c < pdfPages.length; c++) {
                const pageHeight = pdfPages[c].getHeight();
                const pageWidth = pdfPages[c].getWidth();
                console.debug(
                    this._moduleID,
                    `| PDF | ${this.providerFilePath} page ${c} WxH dimensions: ${pageWidth} x ${pageHeight} pixels`
                );
            }
        }
        /**
         * Set the metadata of the PDF document
         */
        const pdfKeywords = ['foundryvtt', 'actor-export', 'actor', 'charactersheet', 'character', 'sheet'];
        if (typeof this.pdfTitle !== 'undefined') {
            pdfKeywords.push(this.pdfTitle);
        }
        this.pdf.setTitle(this.pdfTitle || destinationFileName);
        this.pdf.setSubject(`${this.pdfTitle || 'Actor'} Charactersheet`);
        this.pdf.setProducer("Bushvin's actor-export");
        this.pdf.setCreator('actor-export (https://github.com/bushvin/actor-export)');
        this.pdf.setKeywords(pdfKeywords);
        this.pdf.setCreationDate(new Date());
        this.pdf.setModificationDate(new Date());

        const blob = new Blob([await this.pdf.save()], { type: 'application/pdf' });
        await saveAs(blob, destinationFileName);
    }

    /**
     * Store pdf text box information
     * @param {string} reference a reference for the textBox added (for debugging purposes)
     * @param {string|string[]} file the pdf filename(s) to apply the text box to ('all' means all PDFs)
     * @param {number|number[]} page The page(s) to add the text box to
     * @param {number} x The x coordinate for the text box
     * @param {number} y The y coordinate for the text box
     * @param {number} width The width of the text box to add
     * @param {number} height The height of the text box to add
     * @param {string|Promise} text The text to display in the text box
     * @param {object} [options={}] Additional options
     * @param {string|number[]} [options.color] either a hexadecimal (html) color, or array of rgb values (in %)
     * @param {string} [options.font] The name or filename of the font to be used
     * @param {'left'|'center'|'right'} [options.halign='left'] how to align the text horizontally
     * @param {number} [options.lineHeight] The lineheight of the text
     * @param {boolean} [options.multiline=true] treat this text as multiline
     * @param {boolean} [options.overflow=false] allow the text to overflow the boundaries. The text will be suffixed with three dots if it is too long
     * @param {string} [options.prefix] a text to add at the beginning of @param text
     * @param {number} [options.size] The font size
     * @param {string} [options.suffix] a text to add at the end of @param text, after any overflow characters.
     * @param {'top'|'center'|'bottom'} [options.valign='bottom'] how to align the text vertically
     * @param {Function} [options.valueParser] function to parse the value after resolving the value Promise
     */
    textBox(reference, file, page, x, y, width, height, text, options = {}) {
        let fail = false;
        if (typeof reference === 'undefined') {
            this.notify('error', `No pdf reference defined for new text box;`);
            fail = true;
        }

        if (typeof file === 'undefined') {
            this.notify('error', `No pdf filename defined for new text box;`);
            fail = true;
        }
        if (!Array.isArray(file)) {
            file = [file];
        }
        for (let i = 0; i < file.length; i++) {
            if (typeof file[i] !== 'string') {
                this.notify('error', 'An invalid pdf filename is defined: %s, type: %s;' % (file[i], typeof file[i]));
                fail = true;
            } else {
                file[i] = String(file[i]).trim();
            }
        }

        if (typeof page === 'undefined') {
            this.notify('error', `No page defined for new text box;`);
            fail = true;
        }
        if (!Array.isArray(page)) {
            page = [page];
        }
        page.forEach((n) => {
            if (typeof n !== 'number') {
                this.notify('error', 'An invalid pdf page number is defined: %s, type: %s;' % (n, typeof n));
                fail = true;
            }
        });

        if (typeof x === 'undefined') {
            this.notify('error', `No x coordinate defined for new text box;`);
            fail = true;
        } else if (isNaN(Number(x))) {
            this.notify('error', `the x coordinate (${x}) is an invalid type for new text box;`);
            fail = true;
        }

        if (typeof y === 'undefined') {
            this.notify('error', `No y coordinate defined for new text box;`);
            fail = true;
        } else if (isNaN(Number(y))) {
            this.notify('error', `the y coordinate (${y}) is an invalid type for new text box;`);
            fail = true;
        }

        if (typeof width === 'undefined') {
            this.notify('error', `No width defined for new text box;`);
            fail = true;
        } else if (isNaN(Number(width))) {
            this.notify('error', `the width is an invalid type for new text box;`);
            fail = true;
        }

        if (typeof height === 'undefined') {
            this.notify('error', `No height defined for new text box;`);
            fail = true;
        } else if (isNaN(Number(height))) {
            this.notify('error', `the height is an invalid type for new text box;`);
            fail = true;
        }

        if (typeof options === 'undefined') {
            options = {};
        } else if (!(typeof options === 'object' && options.constructor === Object)) {
            this.notify('error', `An invalid options value is specified: %s, type: %s;` % (options, typeof options));
            fail = true;
        }

        if (fail) {
            const ret = {
                reference: reference,
                file: file,
                page: page,
                x: x,
                y: y,
                width: width,
                height: height,
                text: text,
                options: options,
            };
            console.debug('data', ret);
            return;
        }

        file.forEach((f) => {
            page.forEach((p) => {
                const textBoxInfo = {
                    reference: reference,
                    file: String(f).trim(),
                    page: p,
                    x: Number(x),
                    y: Number(y),
                    width: Number(width),
                    height: Number(height),
                    text: text,
                    options: options,
                };

                if (String(text).trim() == '' && (options.debug || this.debugProvider || false)) {
                    text = '.';
                }
                if (String(text).trim() !== '') {
                    this.pdfTextBoxes.push(textBoxInfo);
                }
            });
        });
    }
}
