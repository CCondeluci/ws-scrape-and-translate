'use strict';

// imports
const fs = require('fs');

// constants
const EN_SETS = require('../set_lists/en-sets');

// async flag for await
(async () => {
    let fullDB = [];
    // go through all the sets
    for (let set of EN_SETS) {
        // read sets from files
        let string = fs.readFileSync('./output/final_output/' + set.substring(3) + '.json', 'utf8');
        let setCards = JSON.parse(string);
        fullDB.push(...setCards);
    }

    // write data to file
    fs.writeFileSync('./combined_db.json', JSON.stringify(fullDB, null, 4));
})();
