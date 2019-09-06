'use strict';

// test our helper functions

const {cellLabel} = require('..');

it('Gets correct cell label (row 10, column 5)', () => {
    // rows and columns are 0-indexed
    const row = 10 - 1;
    const column = 5 - 1;
    const label = cellLabel(row, column);
    
    expect(label).toBe('E9');
});