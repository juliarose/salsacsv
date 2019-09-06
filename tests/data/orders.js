'use strict';

// this is used for comprehensive testing

const {cellLabel} = require('../..');

// helper functions for our data

// converts a string to a date
const toDate = (str) => new Date(str);
// converts a date to a string to be inserted into CSV
const toDateString = (date) => {
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ].join('/');
};
// this will convert our currency value into an integer
// e.g. 1.23 -> 123
const toIntegerCurrency = (str) => {
    return Math.round(parseFloat(str) * 100);
};
// reverse of toIntegerCurrency
// this will convert our integer price value into a decimal number
// e.g. 123 -> 1.23
const toDecimalCurrency = (num) => {
    const toDecimal = (value, precision) => {
        let power = Math.pow(10, precision);
        
        return value / power;
    };
    
    return toDecimal(num, 2);
};
// don't forget the sales tax!
const calculateTax = (tax, price) => {
    return toDecimalCurrency(Math.round(price * tax));
};

const tax = 0.06;
// our columns for our order data
const columns = [
    {
        header: 'Date',
        key: 'date',
        required: true,
        // when parsing from CSV the result should be the same as the original object
        parser: toDate,
        converter: toDateString
    },
    // no parsing needed
    {
        header: 'Name',
        key: 'name',
        required: true
    },
    {
        header: 'Price',
        key: 'price',
        required: true,
        // when parsing from CSV the result should be the same as the original object
        parser: toIntegerCurrency,
        converter: toDecimalCurrency
    },
    // this is a special column for CSV only to show the tax added to an item
    {
        header: 'Tax',
        converter: (value, {obj}) => {
            return calculateTax(tax, obj.price);
        }
    },
    // this is a special column for CSV-only to show the total of an item with tax
    {
        header: 'Total',
        // this generates a spreadsheet formula to take the price cell and the tax cell
        // and add them together
        converter: (value, {row, column}) => {
            let priceCell = cellLabel(row, column - 2);
            let taxCell = cellLabel(row, column - 1);
            
            return `=${priceCell}+${taxCell}`;
        }
    }
];
// our columns for our orders
const data = [
    {
        date: new Date(2019, 7, 25),
        name: 'Cat Chow',
        price: 349
    },
    {
        date: new Date(2019, 7, 26),
        name: 'Water',
        price: 129
    },
    {
        date: new Date(2019, 7, 26),
        name: 'Light Bulbs',
        price: 529
    }
];

module.exports = {
    data,
    columns
};