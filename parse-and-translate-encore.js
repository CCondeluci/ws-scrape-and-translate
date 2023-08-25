'use strict';

// imports
const fs = require('fs');
const nova_scraper = require('./scrapers/nova-scraper');

// constants
const JP_SETS = require('./set_lists/jp-sets');
const { format } = require('path');

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets
    for (let set of JP_SETS) {
        // read jk-parsed set from file
        let encoreString = fs.readFileSync('./input/encore_input/' + set.code + '.json', 'utf8');
        let encoreData = JSON.parse(encoreString);
        // new up a card list
        let formattedCards = [];
        for (let encore of encoreData) {
            // build the card data
            let card = {};
            if (encore.locale.NP) {
                card.name = encore.locale.NP.name;
            } else {
                card.name = encore.locale.EN.name;
            }
            card.code = encore.cardcode;
            card.rarity = encore.rarity;
            card.expansion = set.xpac;
            card.side = encore.side;
            switch(encore.cardtype) {
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
            card.color = encore.colour;
            card.level = encore.level;
            card.cost = encore.cost;
            card.power = encore.power;
            card.soul = encore.soul;
            card.trigger = encore.trigger;
            card.flavor_text = '';
            if (encore.locale.NP) {
                card.ability = encore.locale.NP.ability;
                card.attributes = encore.locale.NP.attributes;
            } else {
                card.ability = encore.locale.EN.ability;
                card.attributes = encore.locale.EN.attributes;
            }
            card.set = encore.set;
            card.release = encore.side + encore.release;
            card.sid = encore.sid;
            let setcode = card.set + '_' + card.release;
            card.image = "https://ws-tcg.com/wordpress/wp-content/images/cardlist/" + encore.set.toLowerCase().charAt(0) + '/' + setcode.toLowerCase() + '/' + setcode.toLowerCase() + '_' + card.sid.toLowerCase() + '.png';  // a/all_s76/all_s76_t23.png"

            formattedCards.push(card);
        }

        // try to get nova TLs
        // let cardPromiseArr = [];
        // for (let parsedCard of formattedCards) {
        //     cardPromiseArr.push(new Promise(async function (resolve, reject) {
        //         // get the card data
        //         let novaCard = await nova_scraper.get(JSON.parse(JSON.stringify(parsedCard)), 5);
        //         // if it has a translation, replace the ability text with TL and preserve jp text
        //         if (novaCard.ability.length > 0) {
        //             parsedCard.ability = novaCard.ability;
        //             parsedCard.jpAbility = novaCard.jpAbility;
        //             parsedCard.attributes = novaCard.attributes;
        //         }
                
        //         resolve();
        //     }));
        // }
        // await Promise.all(cardPromiseArr);

        // merge community TLs
        let communityString = fs.readFileSync('./output/community_output/' + set.code + '.json', 'utf8');
        let communityData = JSON.parse(communityString);
        for (let parsedCard of formattedCards) {
            let communityResult = communityData.filter(x => parsedCard.code.indexOf(x.code) > -1);
            if (communityResult) {
                for (let result of communityResult) {
                    if (result.ability.length > 0) {
                        parsedCard.ability = result.ability;
                    }
                    if (result.attributes.length > 0) {
                        parsedCard.attributes = result.attributes;
                    }
                }
               
            }
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
        fs.writeFileSync('./output/00_translated_encore_output/' + set.code + ".json", JSON.stringify(finalOutput, null, 4));
        fs.writeFileSync('./failed_output/00_translated_failed_encore_output/' + set.code + ".json", JSON.stringify(errorOutput, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + set.code);
        console.log("-----------------------");
    }
})();