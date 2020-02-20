export as namespace salsacsv;
/**
 * An object describing the format of a column.
 */
export type Column = {
    /**
     * - The header to be used for this column.
     */
    header?: string;
    /**
     * - The object key for this column.
     */
    key?: string;
    /**
     * - Indicates whether the value should be defined when getting value from CSV. Throws an error if the resulting value is null, undefined, or an empty string.
     */
    required?: boolean;
    /**
     * - The function called to convert value to CSV.
     */
    converter?: Converter;
    /**
     * - The function called to parse value from CSV. Will not be called unless parseEmpty is set to true.
     */
    parser?: Parser;
    /**
     * - Whether to parse empty values or not.
     */
    parseEmpty?: boolean;
};
/**
 * Function to convert value to raw CSV.
 */
export type Converter = (value?: string, details?: ConverterDetails) => string | number;
/**
 * Converter details
 */
export type ConverterDetails = {
    /**
     * - Source object.
     */
    obj?: any;
    /**
     * - The key of the value we want to take from the object for this column.
     */
    key?: string;
    /**
     * - Row number.
     */
    row?: number;
    /**
     * - Column number.
     */
    column?: number;
};
/**
 * Function to parse value from raw CSV.
 */
export type Parser = (value?: string, details?: ParserDetails) => any;
/**
 * Parser details
 */
export type ParserDetails = {
    /**
     * - Name of key to assign to object.
     */
    key?: string;
    /**
     * - Row number.
     */
    row?: number;
    /**
     * - Column number.
     */
    column?: number;
};
/**
 * Converts an array of objects to a CSV string.
 * @param {Object[]} rows - Array of objects to form rows from.
 * @param {Column[]} columns - An array containing columns.
 * @param {Object} [options={}] - Parsing options.
 * @param {Boolean} [options.includeHeader] - Whether the CSV has a header or not, the first line will be skipped if this is set to true.
 * @param {String} [options.delimiter=','] - The delimiter for the CSV string.
 * @returns {String} CSV string.
 * @public
 * @memberof salsacsv
 *
 * @example
 * toCSV([
 *     {
 *         name: 'Cat Chow',
 *         price: 529
 *     }
 * ], [
 *     {
 *         header: 'Name',
 *         key: 'name'
 *     },
 *     {
 *         header: 'Price',
 *         key: 'price',
 *         converter: (value) => value / 100
 *     }
 * ], {
 *     includeHeader: true
 * });
 * // "Name","Price"\n"Cat Chow",5.29
 */
export function toCSV(rows: any[], columns: Column[], options?: {
    includeHeader?: boolean;
    delimiter?: string;
}): string;
/**
 * Converts a CSV string into objects.
 * @param {String} csvStr - CSV string.
 * @param {Column[]} [columns=[]] - An array containing columns.
 * @param {Object} [options={}] - Parsing options.
 * @param {Boolean} [options.includeHeader] - Whether the CSV has a header or not.
 * @param {Boolean} [options.includeEmptyValues] - Whether to assign empty values to object or not.
 * @param {String} [options.delimiter=','] - The delimiter of the CSV string.
 * @returns {Object[]} Array of objects.
 * @public
 * @memberof salsacsv
 *
 * @example
 * fromCSV('"Name","Price"\n"Cat Chow",5.29', [
 *     {
 *         header: 'Name',
 *         key: 'name'
 *     },
 *     {
 *         header: 'Price',
 *         key: 'price',
 *         parser: (value) => Math.round(parseFloat(value) * 100)
 *     }
 * ], {
 *     includeHeader: true
 * });
 * // { name: 'Cat Chow', price: 529 }
 * @example
 * // using no column definitions
 * // there will be no type conversions if no parser is given, any returned values will be strings
 * fromCSV('"Cat Chow",5.29');
 * // { col1: 'Cat Chow', col2: '5.29' }
 * @example
 * // using no column definitions (use header as keys)
 * fromCSV('"Name","Price"\n"Cat Chow",5.29', null, {
 *     includeHeader: true
 * });
 * // { Name: 'Cat Chow', Price: '5.29' }
 */
export function fromCSV(csvStr: string, columns?: Column[], options?: {
    includeHeader?: boolean;
    includeEmptyValues?: boolean;
    delimiter?: string;
}): any[];
/**
 * Gets the cell label.
 * @param {Number} rowNumber - Zero-based row number.
 * @param {Number} columnNumber - Zero-based column number.
 * @returns {String} Cell label.
 * @public
 * @memberof salsacsv
 *
 * @example
 * cellLabel(0, 3); // A3
 */
export function cellLabel(rowNumber: number, columnNumber: number): string;
