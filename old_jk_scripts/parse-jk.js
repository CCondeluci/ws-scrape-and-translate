'use strict';

// imports
const html_parser = require('node-html-parser');
const bushi_scraper = require('../scrapers/bushi-scraper');
const fs = require('fs');

// constants
const EN_SETS = require('../set_lists/en-sets');

// valid rarities for capture
const VALID_RARITIES = ['PR', 'TD', 'CC', 'CR', 'C', 'UC', 'R', 'RR'];

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets to parse them
    for (let set of EN_SETS) {
        // read set from file
        let jkString = fs.readFileSync('./jk_lists/' + set + '.html', 'utf8');
        // divide jktcg page into html blocks, removing the first
        let rarityBlocks = jkString.match(/((<h1>.*<\/h1>)[\s\S]*?(?=(<h1>.*<\/h1>)))/g);
        rarityBlocks.shift();
        // get the promo block (if it exists)
        let promoBlock = jkString.match(/(<h1>.*PR- Promo.*<\/h1>)[\s\S]*/g);
        if (promoBlock !== null && promoBlock[0] !== undefined && promoBlock[0] !== null) {
            rarityBlocks.push(promoBlock[0]);
        }
        // loop thru blocks, parse them with html parser\
        let setCards = [];
        for (let block of rarityBlocks) {
            // parse block, get the rarity for the current block
            let root = html_parser.parse(block);
            let rarity = root.querySelector("h1").innerHTML.trim();
            rarity = rarity.split('-')[0].trim();
            // if rarity isn't base, ignore block
            if (!VALID_RARITIES.includes(rarity)) {
                continue;
            }
            // get all card cells
            let cells = root.querySelectorAll("td");
            // loop through all card cells
            for (let cell of cells) {
                // cell structured inner HTML text follows this pattern:
                // [    'RZ/S46-E001SP',  // code
                //      'Available:\t0',  // availability
                //      'Price: $60.00',  // price
                //      'Royal Election Candidate, Felt' ] // name
                let dataArr = cell.structuredText.split('\n');
                // make sure we didn't split out a bunk cell
                if (dataArr[1] !== undefined) {
                    // build the card object
                    let card = {
                        code: dataArr[0],
                        availability: dataArr[1].split('\t')[1],
                        price: dataArr[2].split('$')[1],
                        name: dataArr[3],
                        rarity: rarity,
                        bushi: 'https://en.ws-tcg.com/cardlist/list/?cardno=' + dataArr[0],
                        img: 'http://jktcg.com/WS_EN/' + set + '/' + dataArr[0].replace(/[-\/]/g,'_') + ".jpg"
                    }
                    // push onto cards array
                    setCards.push(card);
                }
            }
        }
        console.log("# of cards parsed: " + setCards.length);
        // write out to file
        fs.writeFileSync('../output/jk_output/' + set + ".json", JSON.stringify(setCards, null, 4));
    }
})();