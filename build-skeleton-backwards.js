'use strict';

// imports
const prompt = require('prompt');
const fs = require('fs');

// constants
const JP_SETS = require('./set_lists/jp-sets');

function padCodeSet(num) {
    var str = "" + num;
    var pad = "000";
    return pad.substring(0, pad.length - str.length) + str;
}

function padCodeOther(num) {
    var str = "" + num;
    var pad = "00";
    return pad.substring(0, pad.length - str.length) + str;
}

// async flag for await, we don't want to DoS bushi
(async () => {
    // properties
    let props = ['outputName'];
    // prompt user
    prompt.start();
    prompt.get(props, function(err, results){
        if (err) {  console.log(err); return 1; }

        // get args
        let outputName = results.outputName;
        let setCards = [];

        // read sets from files
        let communityString = fs.readFileSync('./output/community_output/' + outputName + '.json', 'utf8');
        let communityCards = JSON.parse(communityString);

        for (let communityCard of communityCards) {
            let cardCode = communityCard.code;
            // build the card object
            let card = {
                code: cardCode,
                name: '',
                rarity: '',
                side: communityCard.side,
                attributes: communityCard.attributes,
                bushi: 'https://ws-tcg.com/cardlist/?cardno=' + cardCode
            }
            // push onto cards array
            setCards.push(card);
        }

        console.log("# of cards parsed: " + setCards.length);
        // write out to file
        fs.writeFileSync('./output/skeleton_jp/' + outputName + ".json", JSON.stringify(setCards, null, 4));
    });
})();