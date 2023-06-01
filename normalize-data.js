'use strict';

// imports
const fs = require('fs');

// constants
const EN_SETS = require('./set_lists/en-sets');

// helper functions
// bushi's triggers are inconsistent so let's match em to encore's
function normalizeTriggers(triggers) {
    for (let i = 0; i < triggers.length; i++) {
        if (triggers[i] === "STOCK") {
            triggers[i] = "POOL";
        }
        else if (triggers[i] === "BOUNCE") {
            triggers[i] = "RETURN";
        }
    }
}

function climaxTextFix(card) {
    let triggerName = '';
    if (card.trigger.length == 2) {
        triggerName = card.trigger[1];
    } else {
        triggerName = card.trigger[0];
    }

    if (triggerName != 'SOUL') {
        switch (triggerName) {
            case 'CHOICE':
                card.ability[1] = "(【CHOICE】: When this card triggers, you may choose a character with 【SOUL】 in its trigger icon in your waiting room, and return it to your hand or put it into your stock)";
                break;
            case 'RETURN':
                card.ability[1] = "(【RETURN】: When this card triggers, you may choose 1 of your opponent's characters, and return it to his or her hand)";
                break;
            case 'SHOT':
                card.ability[1] = "(【SHOT】: During this turn, when the next damage dealt by the attacking character that triggered this card is canceled, deal 1 damage to your opponent)";
                break;
            case 'TREASURE':
                card.ability[1] = "(【TREASURE】: When this card triggers, return this card to your hand. You may put the top card of your deck into your stock)";
                break;
            case 'POOL':
                card.ability[1] = "(【POOL】: When this card triggers, you may put the top card of your deck into your stock)";
                break;
            case 'COMEBACK':
                card.ability[1] = "(【COMEBACK】: When this card triggers, you may choose 1 character in your waiting room, and return it to your hand)";
                break;
            case 'STANDBY':
                card.ability[0] = "【AUTO】When this card is placed on your climax area from your hand, perform the【STANDBY】effect.";
                card.ability[1] = "(【STANDBY】: When this card triggers, you may choose 1 character with a level equal to or less than your level +1 in your waiting room, and put it on any position of your stage as【REST】)";
                break;
            case 'DRAW':
                card.ability[1] = "(【DRAW】: When this card triggers, you may draw 1 card)";
                break;
            case 'GATE':
                card.ability[1] = "(【GATE】: When this card triggers, you may choose 1 climax in your waiting room, and return it to your hand)";
                break;
            default:
                'ERROR: NO CX TYPE MATCHED'
        }
    }
}
// ...any additional normalization functions would go here

// async flag for await
(async () => {
    // go through all the sets
    for (let set of EN_SETS) {
        // read sets from files
        let bushiString = fs.readFileSync('./output/bushi_output/' + set + '.json', 'utf8');
        let promoString = "[]";
        if (fs.existsSync('./output/promo_output/' + set + '.json', 'utf8')) {
            promoString = fs.readFileSync('./output/promo_output/' + set + '.json', 'utf8');
        }
        let bushiCards = JSON.parse(bushiString);
        let promoCards = JSON.parse(promoString);
        // new up a card list
        let finalCards = [];
        // loop through all the official cards
        for (let card of bushiCards) {
            // normalize any inconsistent data
            normalizeTriggers(card.trigger);
            if (card.type == "Climax") {
                climaxTextFix(card);
            }
            // push onto final array
            finalCards.push(card);
        }
        // loop through all promo cards
        for (let promo of promoCards) {
            // normalize any inconsistent data
            normalizeTriggers(promo.trigger);
            if (card.type == "Climax") {
                climaxTextFix(card);
            }
            // push onto final array
            finalCards.push(promo);
        }
        
        // write data to file
        fs.writeFileSync('./output/final_output/' + set.substring(3) + ".json", JSON.stringify(finalCards, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + set);
        console.log("-----------------------");
    }
})();
