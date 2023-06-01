'use strict';

// imports
const bushi_scraper = require('./scrapers/bushi-scraper');
const fs = require('fs');

// constants
const MISSING_SETS = require('./set_lists/jp-sets-missing');

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets
    for (let set of MISSING_SETS) {
        // read jk-parsed set from file
        let cardSkeletonString = fs.readFileSync('./output/jk_output_jp/' + set.code + '.json', 'utf8');
        let cardSkeletons = JSON.parse(cardSkeletonString);

        // new up a card list
        let formattedCards = [];
        for (let cardSkeleton of cardSkeletons) {
            let missingString = fs.readFileSync('./input/ake_datasets/' + set.code + '/' + cardSkeleton.code.replace('/', '-') + '.json', 'utf8');

            let missing = JSON.parse(missingString);
           
            // build the card data
            let card = {};
            card.name = missing.jpName;
            card.code = missing.set + '/' + missing.side + missing.release + '-' + missing.id;
            card.rarity = missing.rarity;
            card.expansion = set.xpac;
            card.side = missing.side;
            switch(missing.cardType) {
                case "CH":
                    card.type = "Character";
                    break;
                case "EV":
                    card.type = "Event";
                    break;
                case "CX":
                    card.type = "Climax";
                    break;
                default:
                    card.type = "Character";
                    break;
            }
            card.color = missing.colour;
            card.level = missing.level;
            card.cost = missing.cost;
            card.trigger = missing.trigger;
            card.flavor_text = missing.flavourText;
            card.ability = missing.ability;
            card.attributes = missing.specialAttrib;
            card.set = missing.set;
            card.release = missing.side + missing.release;
            card.sid = missing.id;
            let setcode = card.set + '_' + card.release;
            card.image = "https://ws-tcg.com/wordpress/wp-content/images/cardlist/" + missing.set.toLowerCase().charAt(0) + '/' + setcode.toLowerCase() + '/' + setcode.toLowerCase() + '_' + card.sid.toLowerCase() + '.png';  // a/all_s76/all_s76_t23.png"

            formattedCards.push(card);
        }

        

        // get all the cards that failed to match and put them in
        let finalOutput = [];
        let errorOutput = [];
        for (let outputCard of formattedCards) {
            if (outputCard.NO_BUSHI_DATA === true) {
                errorOutput.push(outputCard);
            } else {
                finalOutput.push(outputCard);
            }
        }

        finalOutput.sort((a, b) => (a.code > b.code) ? 1 : -1);
        
        // write data to file
        fs.writeFileSync('./output/missing_output/' + set.code + ".json", JSON.stringify(finalOutput, null, 4));
        fs.writeFileSync('./failed_output/failed_missing_output/' + set.code + ".json", JSON.stringify(errorOutput, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + set.code);
        console.log("-----------------------");
    }
})();