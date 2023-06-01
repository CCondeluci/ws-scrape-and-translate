'use strict';

// imports
const la_scraper = require('./scrapers/la-scraper');
const la_set_scraper = require('./la-scraper-set');
const _ = require('lodash');
const fs = require('fs');

// constants
const JP_SETS_LA_CODES = require('./set_lists/jp-sets-codes');

// async flag for await
(async () => {
    for (let jp_set of JP_SETS_LA_CODES) {
        // get set list
        let setCodeObj = await la_set_scraper.get(jp_set, 0);
        // go through all the sets
        let laCards = [];

        // parallel version
        // 
        let cardPromiseArr = [];
        for (let code of setCodeObj.codes) {
            cardPromiseArr.push(new Promise(async function (resolve, reject) {
                // get the card data
                let laCard = await la_scraper.get(code, 0);
                if (laCard) {
                    console.log("DONE: " + laCard.code);
                    laCards.push(laCard);
                } 
                resolve();
            }));
        }
        // execute promises
        await Promise.all(cardPromiseArr);
        
        // get all the cards that failed to match and put them in
        let finalOutput = [];
        let errorOutput = [];
        for (let outputCard of laCards) {
            if (outputCard.NO_BUSHI_DATA === true) {
                errorOutput.push(outputCard);
            } else {
                finalOutput.push(outputCard);
            }
        }

        finalOutput.sort((a, b) => (a.code > b.code) ? 1 : -1);
        let removeEBDupes = _.uniqBy(finalOutput, 'code');
        
        // write data to file
        fs.writeFileSync('./output/la_output_fixed/' + setCodeObj.setcode + ".json", JSON.stringify(removeEBDupes, null, 4));
        fs.writeFileSync('./failed_output/failed_la_output_fixed/' + setCodeObj.setcode + ".json", JSON.stringify(errorOutput, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + setCodeObj.setcode);
        console.log("-----------------------");
    }

})();