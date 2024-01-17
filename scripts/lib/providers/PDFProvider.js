import { baseProvider } from './BaseProvider.js';
import { PDFDocument } from './pdf-lib.esm.js';

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
 */
export class pdfProvider extends baseProvider {
    constructor(actor) {
        super(actor);
        this.pdfFields = [];
        this.pdfImages = [];
        this.failedFields = [];
    }

    /**
     * Generate the PDF and download it
     * @param sourceFileURI the URI of the file to use
     * @param destinationFileName the name of the file to be saved
     */
    download(sourceFileURI, destinationFileName) {
        super.download(this.sourceFileURI || sourceFileURI, this.destinationFileName || destinationFileName);
        let ret = undefined;
        fetch(this.sourceFileURI || sourceFileURI).then((data) => {
            this.parseFile(
                data,
                this.sourceFileURI || sourceFileURI,
                this.destinationFileName || destinationFileName
            ).then((res) => {
                ret = res;
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
        const htmlImage = await this.loadImage(imageData.path);
        const imageBitmap = await createImageBitmap(htmlImage);
        const imageHeaders = await fetch(imageData.path).then((res) => res.headers);
        let contentType = undefined;
        imageHeaders.forEach((value, key) => {
            if (key === 'content-type') {
                contentType = value;
            }
        });
        let scale_height = 1;
        let scale_width = 1;
        if (imageData.max_height > 0) {
            scale_height = imageData.max_height / htmlImage.height;
        }
        if (imageData.max_width > 0) {
            scale_width = imageData.max_width / htmlImage.width;
        }
        const scale = scale_height < scale_width ? scale_height : scale_width;

        const pdfPages = pdf.getPages();
        if (pdfPages.length < imageData.page) {
            this.notify(
                'warn',
                `An image was requested for this file, but there aren't enough pages in the PDF file: ${imageData.path}`
            );
            return;
        }
        let embeddedImage = null;
        let imageBuffer = null;
        const fileExtension = imageData.path.split('.').pop().toLowerCase();
        switch (contentType || fileExtension) {
            case 'image/jpeg':
            case 'jpg':
            case 'jpeg':
                imageBuffer = await fetch(imageData.path).then((res) => res.arrayBuffer());
                embeddedImage = await pdf.embedJpg(imageBuffer);
                break;
            case 'image/png':
            case 'png':
                imageBuffer = await fetch(imageData.path).then((res) => res.arrayBuffer());
                embeddedImage = await pdf.embedPng(imageBuffer);
                break;
            case 'image/webp':
            case 'webp':
                const canvas = new OffscreenCanvas(htmlImage.width, htmlImage.height);
                const context = await canvas.getContext('2d');
                context.drawImage(imageBitmap, 0, 0, htmlImage.width, htmlImage.height);
                const blob = await context.canvas.convertToBlob({ type: 'image/png' });
                imageBuffer = await blob.arrayBuffer();
                embeddedImage = await pdf.embedPng(imageBuffer);
                break;
            default:
                this.notify('warn', `${contentType || fileExtension} files are not (yet) supported.`);
                return;
        }
        if (!(typeof embeddedImage === 'object' && !embeddedImage)) {
            const imageDimensions = embeddedImage.scale(scale);
            const page_height = pdfPages[imageData.page].getHeight();
            const real_x = imageData.x;
            const real_y = page_height - imageData.y - imageDimensions.height;
            const options = {
                x: real_x,
                y: real_y,
                width: imageDimensions.width,
                height: imageDimensions.height,
            };
            pdfPages[imageData.page].drawImage(embeddedImage, options);
        }
    }

    /**
     * Store form field information,
     * text for text fields, booleans for checkboxes
     * @param {string} file the pdf filename to apply the image to ('all' means all PDFs)
     * @param {string} name The name of the field to reference
     * @param {string|boolean} value The value to be applied to the field
     * @param {Object} options Additional data about the field
     */
    field(file, name, value, options) {
        if (this.pdfFields.filter((i) => i.file === file && i.name === name).length) {
            this.notify('warn', `${name} has already been defined. Discarding the new value.`);
            return;
        }
        let field = {
            file: file,
            name: name,
            value: value,
            options: options,
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
    getField(file, name) {
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
    getFieldValue(file, name, defaultValue) {
        const field = this.getField(file, name);
        if (typeof field !== 'undefined') {
            return field.value;
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
     * @param {string} file - the pdf filename to apply the image to ('all' means all PDFs)
     * @param {number} page - The page to add the image to
     * @param {number} x - The x coordinate for the image
     * @param {number} y - The y coordinate for the image
     * @param {string} path - The url to the image to add
     * @param {number} scale - Image scaling. (1 = 100%)
     * @param {object} options - Additional options
     */
    image(file, page, x, y, path, max_width = -1, max_height = -1, options) {
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
        } else {
            page = parseInt(page);
        }

        if (typeof x === 'undefined') {
            this.notify('error', `No x coordinate defined for new image;`);
            fail = true;
        } else if (isNaN(parseInt(x))) {
            this.notify('error', `the x coordinate is an invalid type for new image;`);
            fail = true;
        } else {
            x = parseInt(x);
        }

        if (typeof y === 'undefined') {
            this.notify('error', `No y coordinate defined for new image;`);
            fail = true;
        } else if (isNaN(parseInt(y))) {
            this.notify('error', `the y coordinate is an invalid type for new image;`);
            fail = true;
        } else {
            y = parseInt(y);
        }

        if (typeof max_width === 'undefined') {
            this.notify('error', `No maximum width defined for new image;`);
            fail = true;
        } else if (isNaN(parseInt(x))) {
            this.notify('error', `the maximum width is an invalid type for new image;`);
            fail = true;
        } else {
            max_width = parseInt(max_width);
        }

        if (typeof max_height === 'undefined') {
            this.notify('error', `No maximum height defined for new image;`);
            fail = true;
        } else if (isNaN(parseInt(x))) {
            this.notify('error', `the maximum height is an invalid type for new image;`);
            fail = true;
        } else {
            max_height = parseInt(max_height);
        }

        if (typeof path === 'undefined') {
            this.notify('error', `No image path defined for new image;`);
            fail = true;
        }

        if (fail) {
            return;
        }

        if (this.pdfImages.filter((i) => i.page === page && i.x === x && i.y === y).length) {
            this.notify(
                'warn',
                `An image on page ${page} with coordinates (${x},${y}) already exists. Discarding new value.`
            );
            return;
        }

        let imageInfo = {
            file: file,
            page: page,
            x: x,
            y: y,
            path: path,
            max_height: max_height,
            max_width: max_width,
        };
        if (typeof options !== 'undefined') {
            imageInfo.options = options;
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
    async parseFile(data, sourceFileURI, destinationFileName) {
        const buffer = await data.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);

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
            // FIXME: throw an error?
            return;
        }
        console.debug(`actor-export | PDF | ${pdfFormFields.length} fields found.`);
        for (let i = 0; i < pdfFormFields.length; i++) {
            const pdfField = pdfFormFields[i];
            const fieldName = pdfField.getName().trim();
            const fieldType = pdfField.constructor.name.trim();

            if (this.fieldExists(fieldName)) {
                switch (fieldType) {
                    case 'PDFTextField':
                        let stringValue = String(this.getFieldValue(sourceFileURI.split('/').pop(), fieldName, ''));
                        pdfField.setText(stringValue);
                        pdfField.markAsClean();
                        break;
                    case 'PDFCheckBox':
                        let booleanValue = Boolean(
                            this.getFieldValue(sourceFileURI.split('/').pop(), fieldName, false)
                        );
                        booleanValue ? pdfField.check() : pdfField.uncheck();
                        break;
                    default:
                        this.notify(
                            'warn',
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
        const blob = new Blob([await pdf.save()], { type: 'application/pdf' });
        await saveAs(blob, destinationFileName);
    }
}
