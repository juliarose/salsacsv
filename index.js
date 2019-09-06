'use strict';

/**
 * Used for converting data to and from CSV.
 * @module salsacsv
 */

/**
 * Escapes a string in CSV.
 * @param {String} str - String.
 * @returns {String} Escaped string.
 * @private
 */
function escapeCSV(str) {
    // quotes are replaced with double quotes to escape them
    // https://www.freeformatter.com/csv-escape.html
    return `"${str.toString().replace(/"/g, '""')}"`;
}

/**
 * Helper function to detect a column.
 * @param {*} column - Column to check.
 * @returns {(Column|null)} Column object, or null if column is not valid.
 * @private
 */
function detectColumn(column) {
    const columnIsObject = Boolean(
        typeof column === 'object' &&
        // since typeof null is an object
        column !== null
    );
    const columnIsString = Boolean(
        typeof column === 'string'
    );
    
    // the column is valid
    if (columnIsString && column.length > 0) {
        // convert column to an object so that we can use it in the same manner
        return {
            key: column
        };
    } else if (columnIsObject) {
        // it is an object and it has a key
        return column;
    } else {
        return null;
    }
}

/**
 * Detects columns from a CSV string.
 * @param {String} csvStr - CSV string.
 * @param {Boolean} [options.includeHeader] - Whether the CSV has a header or not.
 * @param {String} [options.delimeter=','] - The delimiter of the CSV string.
 * @returns {Column[]} Array of columns.
 * @private
 */
function detectColumnsFromCSV(csvStr, options = {}) {
    const {includeHeader} = options;
    const delimiter = options.delimiter || ',';
    const firstLine = csvStr.split('\n')[0];
    // get first line
    const split = csvToArray(firstLine, delimiter)[0] || [];
    let columns;
    
    // first line is header values
    if (includeHeader) {
        columns = split;
    } else {
        // setup some column names
        columns = split.map((value, i) => {
            return 'col' + (i + 1);
        });
    }
    
    return columns.map(detectColumn);
}

/**
 * Detects columns from an array of objects.
 * @param {Object[]} rows - Array of objects to take columns from.
 * @param {Boolean} [options.includeHeader] - Whether the CSV has a header or not.
 * @returns {Column[]} Array of columns.
 * @private
 */
function detectColumnsFromJSON(rows, options) {
    const {includeHeader} = options;
    const keys = Object.keys(rows[0] || {});
    const format = (column, i) => {
        const canIncludeHeader = Boolean(
            column !== null &&
            includeHeader
        );
        
        if (canIncludeHeader) {
            const key = keys[i];
            
            // include the name of the key as the header for this column
            column.header = key;
        }
        
        return column;
    };
    
    return keys .map(detectColumn).map(format);
}

/**
 * Gets the column label of a column given its number index.
 * @param {Number} columnNumber - Zero-based column number.
 * @returns {String} Column letter.
 * @private
 *
 * @example
 * cellLabel(2); // C
 */
function columnLabel(columnNumber) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters.charAt(columnNumber % 26);
    const concat = Math.floor(columnNumber / 26);
    
    if (concat > 0) {
        return columnLabel(concat - 1) + letter;
    } else {
        return letter;
    }
}

/**
 * Converts a CSV string into an array of arrays where each line is split by its delimiter.
 *
 * @param {String} str - String to parse.
 * @param {String} [delimiter=','] - Delimiter.
 * @returns {Array[]} Array of arrays for each line in string.
 * @private
 */
function csvToArray(str, delimiter = ',') {
    // Source:
    // https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
    // https://gist.github.com/bennadel/9753411#file-code-1-htm 
    // Create a regular expression to parse the CSV values
    const objPattern = new RegExp(
        (
            // delimiters
            '(\\' + delimiter + '|\\r?\\n|\\r|^)' +
            // quoted fields
            '(?:"([^"]*(?:""[^"]*)*)"|' +
            // standard fields (numbers, dates, unqouted text fields)
            '([^"\\' + delimiter + '\\r\\n]*))'
        ),
        'gi'
    );
    
    // Create an array to hold our data. Give the array
    // a default empty first row
    let results = [[]];
    // Create an array to hold our individual pattern
    // matching groups
    let matches = null;
    
    // Keep looping over the regular expression matches
    // until we can no longer find a match
    while (matches = objPattern.exec(str)) {
        // Get the delimiter that was found
        let matchedDelimiter = matches[1];
        let hasRowDelimiter = Boolean(
            matchedDelimiter.length > 0 &&
            matchedDelimiter !== delimiter
        );
        let value;
        
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter
        if (hasRowDelimiter) {
            // Since we have reached a new row of data,
            // add an empty row to our data array
            results.push([]);
        }
        
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted)
        if (matches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes
            value = matches[2].replace(/""/g, '"');
        } else {
            // we found a non-quoted value
            value = matches[3];
        }
        
        // Now that we have our value string, let's add
        // it to the data array
        results[results.length - 1].push(value);
    }
    
    // Return the parsed data
    return results;
}

/**
 * Converts an array of objects to a CSV string.
 * @param {Object[]} rows - Array of objects to form rows from.
 * @param {Column[]} columns - An array containing columns.
 * @param {Object} [options={}] - Parsing options.
 * @param {Boolean} [options.includeHeader] - Whether the CSV has a header or not, the first line will be skipped if this is set to true.
 * @param {String} [options.delimeter=','] - The delimiter for the CSV string.
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
function toCSV(rows, columns, options = {}) {
    if (!Array.isArray(rows)) {
        throw new Error('First argument is not an array');
    }
    
    if (!columns) {
        columns = detectColumnsFromJSON(rows, options);
    } else {
        // firstly, format columns into the proper format
        columns = columns.map(detectColumn);
    }
    
    const {includeHeader} = options;
    const delimiter = options.delimiter || ',';
    const startIndex = includeHeader ? 1 : 0;
    const getLine = (obj, rowIndex) => {
        const processColumn = (column, columnIndex) => {
            // the column is invalid
            if (column == null) {
                // empty cell
                return '';
            }
            
            const {key, converter} = column;
            let cellValue = obj[key];
            
            if (typeof converter === 'function') {
                // convert the cell value
                cellValue = converter(cellValue, {
                    obj,
                    key,
                    row: rowIndex + startIndex + 1,
                    column: columnIndex
                });
            }
            
            const canClear = Boolean(
                // cell value is null or undefined
                cellValue == null ||
                // cell value is an object
                typeof cellValue === 'object'
            );
            
            // we do not want to store these values to plain text
            if (canClear) {
                // make it an empty string instead
                cellValue = '';
            }
            
            // whether the cell value should be escaped or not
            const shouldEscape = Boolean(
                // strings shoyld be escaped
                typeof cellValue === 'string' &&
                // but only if the string is not empty
                cellValue.length > 0 &&
                // and is not a formula
                !/^=/.test(cellValue) &&
                // and also does not look like a date
                // TODO probably use a more comprehensive date pattern test
                !/^\d+[-\/]\d+[-\/]\d+$/.test(cellValue)
            );
            
            if (shouldEscape) {
                // escape strings
                cellValue = escapeCSV(cellValue);
            }
            
            return cellValue;
        };
        // collect line from columns
        const result = columns
            .map(processColumn)
            .join(delimiter);
        
        return result;
    };
    // build our lines
    let lines = rows.map(getLine);
    
    // we want to include the header
    if (includeHeader) {
        // build the header
        const header = columns.map((column) => {
            const header = (
                column &&
                column.header
            );
            
            if (typeof header === 'string' && header.length > 0) {
                return escapeCSV(header);
            } else {
                return '';
            }
        }).join(delimiter);
        
        // include the header before the lines
        lines = [header, ...lines];
    }
    
    // tie the lines together with line breaks
    const result = lines.join('\n');
    
    // all done, don't we feel accomplished?
    // no? well, alright then...
    return result;
}


/**
 * Converts a CSV string into objects.
 * @param {String} csvStr - CSV string.
 * @param {Column[]} [columns=[]] - An array containing columns.
 * @param {Object} [options={}] - Parsing options.
 * @param {Boolean} [options.includeHeader] - Whether the CSV has a header or not.
 * @param {Boolean} [options.includeEmptyValues] - Whether to assign empty values to object or not.
 * @param {String} [options.delimeter=','] - The delimiter of the CSV string.
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
function fromCSV(csvStr, columns, options = {}) {
    if (typeof csvStr !== 'string') {
        throw new Error('First argument is not a string');
    }
    
    csvStr = csvStr
        // clear lines that are empty
        .replace(/\n{2,}/g, '\n')
        // remove newlines at beginning and end of file
        .replace(/(\n$|^\n)/, '');
    
    const {includeEmptyValues, includeHeader} = options;
    const delimiter = options.delimiter || ',';
    const startIndex = includeHeader ? 1 : 0;
    const useDefaultColumns = Boolean(
        // no columns given
        !columns &&
        // csv string is not empty
        csvStr.length > 0
    );
    
    if (useDefaultColumns) {
        columns = detectColumnsFromCSV(csvStr, options);
    } else {
        // firstly, format columns into the proper format
        columns = columns.map(detectColumn);
    }
    
    // this will skip the first line if includeHeader is true
    // convert the CSV string into an array of arrays for each line
    const csvLines = csvToArray(csvStr, delimiter).slice(startIndex);
    const getRow = (line, rowIndex) => {
        const processColumn = (result, column, columnIndex) => {
            const validColumn = Boolean(
                column != null &&
                column.key
            );
            
            // column is not valid for taking value from
            if (!validColumn) {
                // skip this column
                return result;
            }
            
            // get the value from the line
            const {key, required, parser, parseEmpty} = column;
            let cellValue = line[columnIndex];
            // can we parse the cell?
            const canParse = Boolean(
                // a value exists on the line
                // this includes empty values
                cellValue !== undefined &&
                // parser is a function
                typeof parser === 'function' &&
                (
                    // we allow parsing of empty values
                    parseEmpty ||
                    // value is not empty
                    cellValue !== ''
                )
            );
            
            if (canParse) {
                // parse value using parsing function
                cellValue = parser(cellValue, {
                    key,
                    row: rowIndex + startIndex + 1,
                    column: columnIndex
                });
            }
            
            // the cell value is empty
            const isEmpty = Boolean (
                // the value is null or undefined
                cellValue == null ||
                // the value is a blank string
                cellValue === ''
            );
            // determine if the value can be assigned to the object
            const canAssign = Boolean(
                // we allow empty values
                includeEmptyValues ||
                !isEmpty
            );
            // there's an error in this column...
            const hasError = (
                required &&
                isEmpty
            );
            
            if (hasError) {
                // throw the error that the value for this column is missing
                throw new Error(`Required column ${key} is empty`);
            } else if (canAssign) {
                // we don't want to assign keys with empty values unless specified in options
                result[key] = cellValue;
            }
            
            return result;
        };
        // collect object from columns
        const result = columns.reduce(processColumn, {});
        
        return result;
    };
    const rows = csvLines.map(getRow);
    
    return rows;
}

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
function cellLabel(rowNumber, columnNumber) {
    return columnLabel(columnNumber) + rowNumber;
}

/**
 * An object describing the format of a column.
 * @typedef {Object} Column
 * @property {String} [header] - The header to be used for this column.
 * @property {String} [key] - The object key for this column.
 * @property {Boolean} [required] - Indicates whether the value should be defined when getting value from CSV. Throws an error if the resulting value is null, undefined, or an empty string.
 * @property {Converter} [converter] - The function called to convert value to CSV.
 * @property {Parser} [parser] - The function called to parse value from CSV. Will not be called unless parseEmpty is set to true.
 * @property {Boolean} [parseEmpty] - Whether to parse empty values or not.
 */

/**
 * Function called to convert value to raw CSV.
 * @typedef {Function} Converter
 * @param {String} value - Value from object.
 * @param {Object} details - Details of cell.
 * @param {Object} details.obj - Source object.
 * @param {String} details.key - The key of the value we want to take from the object for this column.
 * @param {Object} details.row - Row number.
 * @param {Object} details.column - Column number.
 */

/**
 * Function called to parse value from raw CSV.
 * @typedef {Function} Parser
 * @param {String} value - Value of cell.
 * @param {Object} details - Details of cell.
 * @param {String} details.key - Name of key to assign to object.
 * @param {Object} details.row - Row number.
 * @param {Object} details.column - Column number.
 */

module.exports = {
    toCSV,
    fromCSV,
    cellLabel
};