'use strict';

// imports
const bushi_scraper = require('./scrapers/bushi-scraper');
const fs = require('fs');

// constants
const EN_SETS = require('./set_lists/en-sets');

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets
    for (let set of EN_SETS) {
        // read jk-parsed set from file
        let skeletonString = fs.readFileSync('./output/skeleton_en/' + set + '.json', 'utf8');
        let cards = JSON.parse(skeletonString);
        // new up a card list
        let bushiCards = [];
        let cardPromiseArr = [];
        for (let card of cards) {
            cardPromiseArr.push(new Promise(async function (resolve, reject) {
                // get the card data
                let bushiCard = await bushi_scraper.get(card, 0);
                console.log("DONE: " + bushiCard.side + bushiCard.release + '/' + bushiCard.sid);
                bushiCards.push(bushiCard);
                resolve();
            }));
        }
        await Promise.all(cardPromiseArr);

        // get all the cards that failed to match and put them in
        let finalOutput = [];
        let errorOutput = [];
        for (let outputCard of bushiCards) {
            if (outputCard.NO_BUSHI_DATA === true) {
                errorOutput.push(outputCard);
            } else {
                finalOutput.push(outputCard);
            }
        }

        finalOutput.sort((a, b) => (a.code > b.code) ? 1 : -1);
        
        // write data to file
        fs.writeFileSync('./output/bushi_output/' + set + ".json", JSON.stringify(finalOutput, null, 4));
        fs.writeFileSync('./failed_output/failed_bushi_output/' + set + ".json", JSON.stringify(errorOutput, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + set);
        console.log("-----------------------");
    }
})();