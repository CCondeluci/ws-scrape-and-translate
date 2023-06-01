'use strict';

// imports
const fs = require('fs');

const setcode = "LRC_W105";

(async () => {
    let msString = fs.readFileSync('../output/missing_output/' + setcode + '.json', 'utf8');
    let commString = fs.readFileSync('../output/community_output/' + setcode + '.json', 'utf8');
    let cards = JSON.parse(msString);
    let commCards = JSON.parse(commString);
    
    let output = [];
    for (let card of cards) {
        let foundTLCard = commCards.find(x => card.code.includes(x.code));
        let jpAbility = JSON.parse(JSON.stringify(card.ability));
        delete card.ability;
        card.ability = JSON.parse(JSON.stringify(foundTLCard.ability));
        card.jpAbility = jpAbility;

        output.push(card);
        console.log(card.code + ': DONE');
    }
    
    fs.writeFileSync('../output/merged_ake_comm_tls/' + setcode + ".json", JSON.stringify(output, null, 4));
    console.log("-----------------------");
    console.log("SET DONE: " + setcode);
    console.log("-----------------------");
})();