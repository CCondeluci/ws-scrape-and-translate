'use strict';

// imports
const fs = require('fs');
const _ = require('lodash');

// constants
const JP_SETS = require('../set_lists/jp-sets');

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets
    for (let set of JP_SETS) {
        // read jk-parsed set from file
        let jp_set_db = fs.readFileSync('../output/la_output_fixed/' + set + '.json', 'utf8');
        let cards = JSON.parse(jp_set_db);
        let removeEBDupes = _.uniqBy(cards, 'code');

        // write data to file
        fs.writeFileSync('../output/la_output_nodupes/' + set + ".json", JSON.stringify(removeEBDupes, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + set);
        console.log("-----------------------");
    }
})();