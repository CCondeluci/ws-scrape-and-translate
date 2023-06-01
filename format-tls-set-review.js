'use strict';

// imports
const fs = require('fs');

const setcode = "RSL_S69";

(async () => {
    let nvString = fs.readFileSync('./output/nova_output/' + setcode + '.json', 'utf8');
    let cards = JSON.parse(nvString);
    
    let translations = [];
    for (let card of cards) {
        let formattedCard = { code: card.code, text: '' };
        for (let ability of card.ability) {
            formattedCard.text += (ability + "\n");
        }
        translations.push(formattedCard);
    }

    fs.writeFileSync('./output/set_review_formatted_output/' + setcode + ".json", JSON.stringify(translations));
    console.log("-----------------------");
    console.log("SET DONE: " + setcode);
    console.log("-----------------------");
})();