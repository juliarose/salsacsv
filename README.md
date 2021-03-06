A basic, explicit CSV parsing and formatting library for use in node.js. CSV strings are parsed and formatted using a set of column definitions for converting to and from CSV.

## Installation

    npm install salsacsv

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [salsacsv](#salsacsv)
    -   [toCSV](#tocsv)
        -   [Parameters](#parameters)
        -   [Examples](#examples)
    -   [fromCSV](#fromcsv)
        -   [Parameters](#parameters-1)
        -   [Examples](#examples-1)
    -   [cellLabel](#celllabel)
        -   [Parameters](#parameters-2)
        -   [Examples](#examples-2)
-   [Column](#column)
    -   [Properties](#properties)
-   [Converter](#converter)
    -   [Parameters](#parameters-3)
-   [ConverterDetails](#converterdetails)
    -   [Properties](#properties-1)
-   [Parser](#parser)
    -   [Parameters](#parameters-4)
-   [ParserDetails](#parserdetails)
    -   [Properties](#properties-2)

### salsacsv

Used for converting data to and from CSV.

#### toCSV

Converts an array of objects to a CSV string.

##### Parameters

-   `rows` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** Array of objects to form rows from.
-   `columns` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Column](#column)>** An array containing columns.
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Parsing options. (optional, default `{}`)
    -   `options.includeHeader` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** Whether the CSV has a header or not, the first line will be skipped if this is set to true.
    -   `options.delimiter` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The delimiter for the CSV string. (optional, default `','`)

##### Examples

```javascript
toCSV([
    {
        name: 'Cat Chow',
        price: 529
    }
], [
    {
        header: 'Name',
        key: 'name'
    },
    {
        header: 'Price',
        key: 'price',
        converter: (value) => value / 100
    }
], {
    includeHeader: true
});
// "Name","Price"\n"Cat Chow",5.29
```

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** CSV string.

#### fromCSV

Converts a CSV string into objects.

##### Parameters

-   `csvStr` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** CSV string.
-   `columns` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Column](#column)>** An array containing columns. (optional, default `[]`)
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Parsing options. (optional, default `{}`)
    -   `options.includeHeader` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** Whether the CSV has a header or not.
    -   `options.includeEmptyValues` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** Whether to assign empty values to object or not.
    -   `options.delimiter` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The delimiter of the CSV string. (optional, default `','`)

##### Examples

```javascript
fromCSV('"Name","Price"\n"Cat Chow",5.29', [
    {
        header: 'Name',
        key: 'name'
    },
    {
        header: 'Price',
        key: 'price',
        parser: (value) => Math.round(parseFloat(value) * 100)
    }
], {
    includeHeader: true
});
// { name: 'Cat Chow', price: 529 }
```

```javascript
// using no column definitions
// there will be no type conversions if no parser is given, any returned values will be strings
fromCSV('"Cat Chow",5.29');
// { col1: 'Cat Chow', col2: '5.29' }
```

```javascript
// using no column definitions (use header as keys)
fromCSV('"Name","Price"\n"Cat Chow",5.29', null, {
    includeHeader: true
});
// { Name: 'Cat Chow', Price: '5.29' }
```

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** Array of objects.

#### cellLabel

Gets the cell label.

##### Parameters

-   `rowNumber` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Zero-based row number.
-   `columnNumber` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Zero-based column number.

##### Examples

```javascript
cellLabel(0, 3); // A3
```

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Cell label.

### Column

An object describing the format of a column.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `header` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The header to be used for this column.
-   `key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The object key for this column.
-   `required` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** Indicates whether the value should be defined when getting value from CSV. Throws an error if the resulting value is null, undefined, or an empty string.
-   `converter` **[Converter](#converter)?** The function called to convert value to CSV.
-   `parser` **[Parser](#parser)?** The function called to parse value from CSV. Will not be called unless parseEmpty is set to true.
-   `parseEmpty` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** Whether to parse empty values or not.

### Converter

Function to convert value to raw CSV.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

#### Parameters

-   `value` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Value from object.
-   `details` **[ConverterDetails](#converterdetails)?** Details of cell.

Returns **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) | null | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))** Value of cell.

### ConverterDetails

Converter details

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `obj` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Source object.
-   `key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The key of the value we want to take from the object for this column.
-   `row` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Row number.
-   `column` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Column number.

### Parser

Function to parse value from raw CSV.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

#### Parameters

-   `value` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Value of cell.
-   `details` **[ParserDetails](#parserdetails)?** Details of cell.

Returns **any** Parsed value from CSV string.

### ParserDetails

Parser details

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Name of key to assign to object.
-   `row` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Row number.
-   `column` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Column number.

## License

MIT
