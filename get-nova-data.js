'use strict';

// imports
const nova_scraper = require('./scrapers/nova-scraper');
const fs = require('fs');

// constants
const JP_SETS = require('./set_lists/jp-sets');

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets
    for (let set of JP_SETS) {
        // read jk-parsed set from file
        let nvString = fs.readFileSync('./output/skeleton_jp/' + set.code + '.json', 'utf8');
        let cards = JSON.parse(nvString);
        // new up a card list
        let nvCards = [];
        let cardPromiseArr = [];
        for (let card of cards) {
            cardPromiseArr.push(new Promise(async function (resolve, reject) {
                // get the card data
                let novaCard = await nova_scraper.get(card, 0);
                novaCard.expansion = set.xpac;
                // novaCard.side = card.side;
                // novaCard.attributes = card.attributes;
                console.log("DONE: " + novaCard.side + novaCard.release + '/' + novaCard.sid);
                nvCards.push(novaCard);
                resolve();
            }));
        }
        await Promise.all(cardPromiseArr);

        // get all the cards that failed to match and put them in
        let finalOutput = [];
        let errorOutput = [];
        for (let outputCard of nvCards) {
            if (outputCard.NO_BUSHI_DATA === true) {
                errorOutput.push(outputCard);
            } else {
                finalOutput.push(outputCard);
            }
        }

        finalOutput.sort((a, b) => (a.sid > b.sid) ? 1 : -1);
        // finalOutput.sort((a, b) => a.code.split("-")[1] - b.code.split("-")[1]);
        
        // write data to file
        fs.writeFileSync('./output/nova_output/' + set.code + ".json", JSON.stringify(finalOutput, null, 4));
        fs.writeFileSync('./failed_output/failed_nova_output/' + set.code + ".json", JSON.stringify(errorOutput, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + set.code);
        console.log("-----------------------");
    }
})();