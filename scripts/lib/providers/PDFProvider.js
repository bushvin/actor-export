import { baseProvider } from './BaseProvider.js';
import { genericHelper } from '../helpers/GenericHelper.js';
import { layoutMultilineText, PDFDocument, rgb } from './pdf-lib.esm.js';
import fontkit from './fontkit.es.js';

/**
 * PDFProvider module
 * @module PDFProvider
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * @class
 * A class to manipulate PDF files. Fills out forms and adds images.
 * @param {Object} actor The Foundry VTT actor object.
 * @extends baseProvider
 * @requires pdf-lib
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
        this.pdfFields = [];
        this.pdfImages = [];
        this.pdfTextBoxes = [];
        this.failedFields = [];
        this.pdfEmbeddedFonts = {};

        this.pdfFontName = '';
        this.pdfFontSize = 0;
        this.pdfFontLineHeight = 0;
        this.pdfFontColor = '#000000';
    }

    /**
     * Convert Hexadecimal color (HTML) to RGB
     * @param {string} hex The hexadecimal value (html color) representing a color
     * @returns {array} the RGB color code in % for each of the main colors, or the color code for black
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
     * Set the default font, size and lineheight for text boxes
     * @param {string} font The name of the font file
     * @param {number} size The size of the font, expressed in % of the page height.
     * @param {number} lineHeight The lineheight of the font, expressed in % of the page height.
     * @returns
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
     * @param {string|rgb} color an HTML or fontkit rgb color.
     */
    defaultFontColor(color) {
        this.pdfFontColor = color;
    }
    /**
     * Generate the PDF and download it
     * @param providerPath the URI of the provider
     * @param sourceFileURI the URI of the file to use, relative to the providerPath
     * @param destinationFileName the name of the file to be saved
     * @param execPost the function to be executed after execution
     */
    download(providerPath, sourceFileURI, destinationFileName, execPost = function () {}) {
        super.download(providerPath, sourceFileURI, destinationFileName, execPost);
        const fullSourceFileURI =
            (this.overrideProviderPath || this.providerPath) + '/' + (this.overrideSourceFileURI || this.sourceFileURI);

        // Fetch the PDF file
        fetch(fullSourceFileURI)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${fullSourceFileURI}: ${response.statusText}`);
                }
                return response.arrayBuffer();
            })
            .then((data) => {
                // Parse and save the PDF file
                return this.parseFile(
                    data,
                    fullSourceFileURI,
                    this.overrideDestinationFileName || this.destinationFileName,
                    execPost
                );
            })
            .catch((error) => {
                // Notify users of any errors that occurred during the download process
                this.notify('error', `Failed to download PDF: ${error.message}`, {
                    permanent: true,
                });
            });
    }

    /**
     * Embed an image to the given PDF Object
     * @async
     * @param {PDFDocument} pdf The PDFDocument to add the image to
     * @param {Object} imageData an Object containing path, (x,y) coordinates, scaling information, etc...
     */
    async embedImage(pdf, imageData) {
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

        const pdfPages = pdf.getPages();
        if (pdfPages.length < page) {
            this.notify(
                'warning',
                `An image was requested for this file, but there aren't enough pages in the PDF file: ${path}`
            );
            return;
        }
        const pdfPage = pdfPages[page];
        const pageHeight = pdfPage.getHeight();
        const pageWidth = pdfPage.getWidth();

        // Calculate scaling
        const scaleHeight = maxHeight > 0 ? (maxHeight * pageHeight) / htmlImage.height : 1;
        const scaleWidth = maxWidth > 0 ? (maxWidth * pageWidth) / htmlImage.width : 1;
        const scale = Math.min(scaleHeight, scaleWidth);

        let embeddedImage;
        try {
            const canvas = new OffscreenCanvas(htmlImage.width, htmlImage.height);
            const context = canvas.getContext('2d');
            context.drawImage(htmlImage, 0, 0);
            const blob = await context.canvas.convertToBlob({ type: 'image/png' });
            const imageBuffer = await blob.arrayBuffer();
            embeddedImage = await pdf.embedPng(imageBuffer);
        } catch (error) {
            this.notify('warning', `Failed to embed the image: ${error}`);
            return;
        }

        // Draw the image on the PDF page
        const realX = x * pageWidth;
        const realY = pageHeight - y * pageHeight - embeddedImage.height * scale;

        const imageOptions = {
            x: realX,
            y: realY,
            width: embeddedImage.width * scale,
            height: embeddedImage.height * scale,
        };
        pdfPage.drawImage(embeddedImage, imageOptions);
    }

    /**
     * Embed a fontfile into the given PDF
     * @param {PDFDocument} pdf The pdf to embed the font into
     * @param {string} fileName the name of the file
     * @returns {CustomFontEmbedder} The resulted embedded font
     */
    async embedFont(pdf, fileName) {
        if (typeof this.pdfEmbeddedFonts[fileName] !== 'undefined') {
            return this.pdfEmbeddedFonts[fileName];
        }
        const moduleRootPath = this.providerPath.split('/').slice(0, 3).join('/');
        const fontURIs = [
            `${this.providerPath}/fonts/${fileName}?t=${Date.now()}`,
            `${moduleRootPath}/fonts/${fileName}?t=${Date.now()}`,
        ];
        let errorCount = 0;

        for (let i = 0; i < fontURIs.length; i++) {
            const res = await fetch(fontURIs[i]);
            if (res.ok) {
                const fontBytes = await res.arrayBuffer();
                try {
                    this.pdfEmbeddedFonts[fileName] = await pdf.embedFont(fontBytes);
                } catch (error) {
                    errorCount++;
                }
            }
        }

        // If none of the font URIs could be embedded, raise an error
        if (errorCount === fontURIs.length) {
            this.notify('error', `Could not load font ${fileName}. Please make sure it exists.`);
            throw new Error(`Failed to embed font ${fileName}.`);
        }
    }

    /**
     * Embed a Text Box to the given PDF Object
     * @async
     * @param {PDFDocument} pdf The PDFDocument to add the Text Box to
     * @param {Object} textBoxData an Object containing path, (x,y) coordinates, scaling information, etc...
     */
    async embedTextBox(pdf, textBoxData) {
        const { page, x, y, width, height, text, options } = textBoxData;
        const pdfPages = pdf.getPages();
        if (pdfPages.length < page) {
            this.notify(
                'warning',
                `A text box was requested for this file, but there aren't enough pages in the PDF file`
            );
            return;
        }

        const pageHeight = pdfPages[page].getHeight();
        const pageWidth = pdfPages[page].getWidth();
        console.debug(`actor-export | PDF | page dimensions: ${pageHeight} x ${pageWidth} pixels`);
        const textOptions = {
            ...options,
            size: (options.size || this.pdfFontSize) * pageHeight,
            color: rgb(...this.convertHexColorToRgb(options.color || this.pdfFontColor)),
            lineHeight: (options.lineHeight || this.pdfFontLineHeight) * pageHeight,
            width: pageWidth * width,
            height: pageHeight * height,
            overflow: options.overflow || this.pdfTextBoxOverflow || false,
            suffix: String(options.suffix || ''),
            prefix: String(options.prefix || ''),
        };

        // TODO: check if this is a standard font.
        const fontName = options.font || this.pdfFontName;
        await this.embedFont(pdf, fontName);

        if (this.pdfEmbeddedFonts[fontName] !== undefined) {
            textOptions.font = this.pdfEmbeddedFonts[fontName];
        }

        let textWidth = 0;
        let textHeight = 0;
        let textLineHeight = 0;
        let modifiedText = this.cleanFoundryMarkup(
            String(await this.parseValue(text, textOptions.valueParser)),
            genericHelper
        );
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
                textOptions.prefix + modifiedText + textOptions.suffix,
                multiLineOptions
            );
            textWidth = Math.max(...multiLine.lines.map((i) => i.width));
            textHeight = multiLine.lines.length * multiLine.lineHeight;
            if (multiLine.lines.length > 1 && multiLine.lines.length * multiLine.lineHeight > textOptions.height) {
                modifiedText = multiLine.lines
                    .slice(0, Math.floor(textOptions.height / multiLine.lineHeight))
                    .map((i) => i.text)
                    .join(' ');
                textHeight = Math.floor(textOptions.height / multiLine.lineHeight) * multiLine.lineHeight;
            }
            textLineHeight = multiLine.lineHeight;
            textOptions.maxWidth = textOptions.width;
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
        textOptions.x = pageWidth * x;
        if ((textOptions.halign || 'left') === 'center') {
            textOptions.x = textOptions.x + (textOptions.width - textWidth) / 2;
        } else if ((textOptions.halign || 'left') === 'right') {
            textOptions.x = textOptions.x + textOptions.width - textWidth;
        }

        // Vertical alignment
        textOptions.y = pageHeight - pageHeight * y - textOptions.height;
        if ((textOptions.valign || 'bottom') === 'top') {
            textOptions.y = textOptions.y + textOptions.height - textLineHeight;
        }
        // TODO: vertical alignment: middle

        if (textOptions.debug || this.debug || false) {
            pdfPages[page].drawRectangle({
                x: pageWidth * x,
                y: pageHeight - pageHeight * y - textOptions.height,
                width: textOptions.width,
                height: textOptions.height,
                borderColor: rgb(1, 0, 0),
            });
        }
        if (modifiedText != '') {
            if (textOptions.debug || this.debug || false) {
                pdfPages[page].drawRectangle({
                    x: textOptions.x,
                    y: textOptions.y - textHeight + textLineHeight,
                    width: textWidth,
                    height: textHeight,
                    borderColor: rgb(0, 1, 1),
                });
            }
            pdfPages[page].drawText(modifiedText, textOptions);
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
     * Check if a field is defined
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
     * @param {string} file The name of the PDF file a field belongs to
     * @param {string} name The name of the field to return the value from
     * @returns {string|boolean|undefined} the requested field data
     */
    async getField(file, name) {
        if (this.pdfFields.filter((i) => i.file.toLowerCase() === file.toLowerCase() && i.name === name).length > 0) {
            return this.pdfFields.filter((i) => i.file === file && i.name === name)[0];
        } else if (this.pdfFields.filter((i) => i.file.toLowerCase() === 'all' && i.name === name).length > 0) {
            return this.pdfFields.filter((i) => i.file.toLowerCase() === 'all' && i.name === name)[0];
        } else if (
            this.pdfFields.filter(
                (i) =>
                    (i.file.toLowerCase() === file.toLowerCase() || i.file.toLowerCase() === 'all') && i.name === name
            ).length === 0
        ) {
            return undefined;
        }
    }

    /**
     * Return a PDF field value
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
     * @param {string} file the pdf filename to apply the image to ('all' means all PDFs)
     * @param {number} page The page to add the image to
     * @param {number} x The x coordinate for the image
     * @param {number} y The y coordinate for the image
     * @param {string} path The url to the image to add
     * @param {number} maxWidth The maximum width of the Image
     * @param {number} maxHeight The maximum height of the Image
     * @param {object} options Additional options
     */
    image(file, page, x, y, path, maxWidth = -1, maxHeight = -1, options) {
        let fail = false;
        if (typeof file === 'undefined') {
            this.notify('error', `No pdf filename defined for new image;`);
            fail = true;
        } else {
            file = String(file);
        }

        if (typeof page === 'undefined') {
            this.notify('error', `No page defined for new image;`);
            fail = true;
        } else if (isNaN(parseInt(page))) {
            this.notify('error', `page is an invalid type for new image;`);
            fail = true;
        }

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

        if (fail) {
            const ret = {
                file: file,
                page: page,
                x: x,
                y: y,
                path: path,
                maxHeight: maxHeight,
                maxWidth: maxWidth,
                options: options || {},
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

        let imageInfo = {
            file: String(file).trim(),
            page: parseInt(page),
            x: Number(x),
            y: Number(y),
            path: String(path).trim(),
            maxHeight: Number(maxHeight),
            maxWidth: Number(maxWidth),
        };
        if (typeof options !== 'undefined') {
            imageInfo.options = options;
        } else {
            imageInfo.options = {};
        }

        this.pdfImages.push(imageInfo);
    }

    /**
     * Parses the provided filedata, fills out pdf form fields, adds images and saves the blob
     * @async
     * @param {fetch} data the fetched data
     * @param sourceFileURI the URI of the file to use
     * @param destinationFileName the name of the file to be saved
     */
    async parseFile(buffer, sourceFileURI, destinationFileName, execPost) {
        try {
            const pdf = await PDFDocument.load(buffer);
            pdf.registerFontkit(fontkit);

            // Fill out form
            let pdfForm = null;
            let pdfFormFields = [];
            try {
                pdfForm = pdf.getForm();
                pdfFormFields = pdfForm.getFields();
            } catch (error) {
                this.notify('error', `An error ocurred loading the pdf form for ${sourceFileURI}: ${error.message}`, {
                    permanent: true,
                });
                throw Error(error);
            }
            console.debug(`actor-export | PDF | ${pdfFormFields.length} fields found.`);
            for (let i = 0; i < pdfFormFields.length; i++) {
                const pdfField = pdfFormFields[i];
                const fieldName = pdfField.getName().trim();
                const fieldType = pdfField.constructor.name.trim();

                if (this.fieldExists(fieldName)) {
                    switch (fieldType) {
                        case 'PDFTextField':
                            let stringValue = String(
                                await this.getFieldValue(sourceFileURI.split('/').pop(), fieldName, '')
                            );
                            pdfField.setText(stringValue);
                            pdfField.markAsClean();
                            break;
                        case 'PDFCheckBox':
                            let booleanValue = Boolean(
                                await this.getFieldValue(sourceFileURI.split('/').pop(), fieldName, false)
                            );
                            booleanValue ? pdfField.check() : pdfField.uncheck();
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
                if (
                    image.file.toLowerCase() === 'all' ||
                    image.file.toLowerCase() === sourceFileURI.toLowerCase().split('/').pop()
                ) {
                    await this.embedImage(pdf, image);
                }
            }

            // embed text boxes
            for (let i = 0; i < this.pdfTextBoxes.length; i++) {
                const textBox = this.pdfTextBoxes[i];
                if (
                    textBox.file.toLowerCase() === 'all' ||
                    textBox.file.toLowerCase() === sourceFileURI.toLowerCase().split('/').pop()
                ) {
                    await this.embedTextBox(pdf, textBox);
                }
            }

            const blob = new Blob([await pdf.save()], { type: 'application/pdf' });
            await saveAs(blob, destinationFileName);
            if (typeof execPost === 'function') {
                execPost();
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
     * asynchronously parse a value through a function
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
     * Store pdf text box information
     * @param {string} file the pdf filename to apply the text box to ('all' means all PDFs)
     * @param {number} page The page to add the text box to
     * @param {number} x The x coordinate for the text box (in % of the page width)
     * @param {number} y The y coordinate for the text box (in % of the page height)
     * @param {number} width The width of the text box to add (in % of the page width)
     * @param {number} height The height of the text box to add (in % of the page height)
     * @param {string|Promise} text The text to display in the text box
     * @param {object} options Additional options
     * @param {string|array} options.color either a hexadecimal (html) color, or array of rgb values (in %)
     * @param {string} options.font The filename of the font used, will be looked for in the provider's font directory or the module's font directory
     * @param {string} options.halign how to align the text horizontally (left[default], center, right)
     * @param {number} options.lineHeight The lineheight of the text (in % of the page height)
     * @param {boolean} options.multiline treat this text as multiline (default: true)
     * @param {boolean} options.overflow allow the text to overflow the boundaries (default: false) The text will be suffixed with three dots if it is too long
     * @param {string} options.prefix a text to add at the beginning of @param text
     * @param {number} options.size The font size
     * @param {string} options.suffix a text to add at the end of @param text, after any overflow characters.
     * @param {string} options.valign how to align the text vertically (top, center, bottom[default])
     * @param {Function} options.valueParser function to parse the value after resolving the value Promise
     */
    textBox(reference, file, page, x, y, width, height, text, options = {}) {
        let fail = false;
        if (typeof file === 'undefined') {
            this.notify('error', `No pdf filename defined for new text box;`);
            fail = true;
        }

        if (typeof page === 'undefined') {
            this.notify('error', `No page defined for new text box;`);
            fail = true;
        } else if (isNaN(parseInt(page))) {
            this.notify('error', `page is an invalid type for new text box;`);
            fail = true;
        }

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

        let textBoxInfo = {
            reference: reference,
            file: String(file).trim(),
            page: parseInt(page),
            x: Number(x),
            y: Number(y),
            width: Number(width),
            height: Number(height),
            text: text,
        };
        if (typeof options !== 'undefined') {
            textBoxInfo.options = options;
        } else {
            textBoxInfo.options = {};
        }

        if (String(text).trim() !== '') {
            this.pdfTextBoxes.push(textBoxInfo);
        }
    }
}
