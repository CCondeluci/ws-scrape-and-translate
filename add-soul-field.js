'use strict';

// imports
const fs = require('fs');

const setcodes = [ '5HY_W101.json', 'BD_WE31.json', 'BD_WE32.json', 'CGS_WS01.json', 'DAL_W99.json', 'GU_W94.json', 'HBR_W103.json', 'HOL_WE36.json', 'IMS_S93.json', 'KGL_S95.json', 'KS_W75.json', 'LL_WE38.json', 'LNJ_W97.json', 'LRC_W105.json', 'MK_SE34.json', 'MK_SJ01.json', 'OVL_S99.json', 'PAD_S105.json', 'PRD_W100.json', 'PXR_S94.json', 'SAO_S100.json', 'SG_W72.json', 'SHS_W98.json', 'SY_WP02.json', 'TRV_S92.json',];

(async () => {

    for (let set of setcodes) {
        let inputString = fs.readFileSync('./input/soul_missing/' + set, 'utf8');
        let cards = JSON.parse(inputString);

        let encoreInputString = fs.readFileSync('./input/encore_input/' + set, 'utf8');
        let encoreCards = JSON.parse(encoreInputString); 

        for (let card of cards) {
            let match = encoreCards.find(x => x.cardcode == card.code);
            if (match) {
                card.soul = JSON.parse(JSON.stringify(match.soul))
            }
        }

        fs.writeFileSync('./output/souls_added/' + set, JSON.stringify(cards, null, 4)); 
        console.log("-----------------------");
        console.log("SET DONE: " + set);
        console.log("-----------------------");
    }
    
  

    
})();