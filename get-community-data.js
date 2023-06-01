'use strict';

// imports
const community_scraper = require('./scrapers/community-scraper');
const _ = require('lodash');
const fs = require('fs');

// constants
const JP_SETS = require('./set_lists/jp-sets');

// async flag for await
(async () => {
    for (let jp_set of JP_SETS) {
        // read jk-parsed set from file
        let xlsx = './input/wtt_translations/' + jp_set.code + '.xlsx';
        let cards = await community_scraper.get(xlsx, jp_set.xpac, jp_set.side);
        
        // write data to file
        fs.writeFileSync('./output/community_output/' + jp_set.code + ".json", JSON.stringify(cards, null, 4));
        fs.writeFileSync('./failed_output/failed_community_output/' + jp_set.code + ".json", JSON.stringify(cards, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + jp_set.code);
        console.log("-----------------------");
    }

})();