'use strict';

// tests for converting from/to CSV

const {toCSV, fromCSV} = require('..');
const ordersData = require('./data/orders');

it('Converts to CSV correctly', () => {
    const columns = [
        'name',
        {
            key: 'amount',
            parser: Number
        }
    ];
    const data = [
        {
            name: 'Kitty cat',
            amount: 2
        }
    ];
    const csv = toCSV(data, columns);
    const expected = '"Kitty cat",2';
    
    expect(csv)
        .toBe(expected);
});

it('Converts from CSV correctly', () => {
    const columns = [
        'name',
        {
            key: 'amount',
            parser: Number
        }
    ];
    const csv =  '"Kitty cat",2';
    const parsed = fromCSV(csv, columns);
    
    expect(parsed)
        .toEqual([
            {
                name: 'Kitty cat',
                amount: 2
            }
        ]);
});

it('Converts to CSV correctly (comprehensive)', () => {
    const {columns, data} = ordersData;
    // we will test the first order in the array
    const testOrders = [data[0]];
    // expected result of the first order
    const expected = '2019/8/25,"Cat Chow",3.49,0.21,=C1+D1';
    const converted = toCSV(testOrders, columns);
    
    expect(converted)
        .toBe(expected);
});

it('Parses from CSV correctly (comprehensive)', () => {
    const {columns, data} = ordersData;
    // we will test the first order in the array
    const testOrders = [data[0]];
    const testCSV = '2019/8/25,"Cat Chow",3.49,0.21,=C1+D1';
    const parsed = fromCSV(testCSV, columns);
    
    expect(parsed)
        .toEqual(testOrders);
});

// convert an array of objects to CSV
// then convert the CSV back to objects
// and check if they are equal
it('Converts to and from CSV correctly (comprehensive)', () => {
    const {columns, data} = ordersData;
    const testOrders = data;
    const csv = toCSV(testOrders, columns);
    const rows = fromCSV(csv, columns);
    
    expect(rows)
        .toEqual(testOrders);
});

it('Ignores empty lines', () => {
    const csv = '"Cat Chow",5.29\n\n\n\n\n"Pizza",6.99\n\n\n"Bowl",2.69';
    const parsed = fromCSV(csv);
    
    expect(parsed.length)
        .toBe(3);
});

it('Assigns header columns as key names', () => {
    const csv = '"Name","Price"\n"Cat Chow",5.29\n"Pizza",6.99';
    const parsed = fromCSV(csv, null, {
        includeHeader: true
    });
    // this will maintain the same order as their appearance
    const keys = Object.keys(parsed[0]);
    
    expect(keys)
        .toEqual([
            'Name',
            'Price'
        ]);
});

it('Properly converts objects to CSV without columns input', () => {
    const data = [
        {
            name: 'Cat Chow',
            price: 529
        },
        {
            name: 'Pizza',
            price: 699
        }
    ];
    const csv = toCSV(data, null, {
        includeHeader: true
    });
    
    expect(csv)
        .toBe('"name","price"\n"Cat Chow",529\n"Pizza",699');
});

it('Ignores object values', () => {
    const data = [
        {
            name: 'Cat Chow',
            price: 529,
            data: {
                sku: '53;3'
            }
        },
        {
            name: 'Pizza',
            price: 699,
            data: {
                sku: '109;2'
            }
        }
    ];
    const csv = toCSV(data, null, {
        includeHeader: true
    });
    
    expect(csv)
        .toEqual('"name","price","data"\n"Cat Chow",529,\n"Pizza",699,');
});