'use strict';

// imports
const prompt = require('prompt');
const fs = require('fs');

// constants
const EN_SETS = require('./set_lists/en-sets');

function padCodeSet(num) {
    var str = "" + num;
    var pad = "000";
    return pad.substring(0, pad.length - str.length) + str;
}

function padCodeOther(num) {
    var str = "" + num;
    var pad = "000";
    return pad.substring(0, pad.length - str.length) + str;
}

function padCodeTwo(num) {
    var str = "" + num;
    var pad = "00";
    return pad.substring(0, pad.length - str.length) + str;
}

// async flag for await, we don't want to DoS bushi
(async () => {
    // properties
    let props = ['setCode', 'releaseCode', 'boosterCount', 'tdCount', 'promoCount', 'outputName'];
    // prompt user
    prompt.start();
    prompt.get(props, function(err, results){
        if (err) {  console.log(err); return 1; }

        // get args
        let setCode = results.setCode;
        let releaseCode = results.releaseCode;
        let boosterCount = results.boosterCount;
        let tdCount = results.tdCount;
        let promoCount = results.promoCount;
        let outputName = results.outputName;
        let setCards = [];
        // go through all the sets to parse them
        for (var i = 1; i <= tdCount; i++) {
            var cardCode = setCode + '/' + releaseCode + '-TE' + padCodeTwo(i);
            // build the card object
            let card = {
                code: cardCode,
                name: '',
                rarity: '',
                bushi: 'https://en.ws-tcg.com/cardlist/list/?cardno=' + cardCode
            }
            // push onto cards array
            setCards.push(card);
        }
        for (var i = 1; i <= boosterCount; i++) {
            var cardCode = setCode + '/' + releaseCode + '-E' + padCodeTwo(i); // padCodeSet(i);
            // build the card object
            let card = {
                code: cardCode,
                name: '',
                rarity: '',
                bushi: 'https://en.ws-tcg.com/cardlist/list/?cardno=' + cardCode
            }
            // push onto cards array
            setCards.push(card);
                
        }
        for (var i = 1; i <= promoCount; i++) {
            var cardCode = setCode + '/' + releaseCode + '-PE' + padCodeTwo(i);
            // build the card object
            let card = {
                code: cardCode,
                name: '',
                rarity: '',
                bushi: 'https://en.ws-tcg.com/cardlist/list/?cardno=' + cardCode
            }
            // push onto cards array
            setCards.push(card);
        }
        console.log("# of cards parsed: " + setCards.length);
        // write out to file
        fs.writeFileSync('./output/skeleton_en/' + outputName + ".json", JSON.stringify(setCards, null, 4));

    });
})();