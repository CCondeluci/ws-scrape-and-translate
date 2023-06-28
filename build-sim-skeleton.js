'use strict';

// imports
const _ = require('lodash');
const prompt = require('prompt');
const fs = require('fs');

// async flag for await
(async () => {
    // properties
    let schema = {
        properties: {
            setCode: {
                message: 'Full setcode, equal to the filename of the json from the DB (ex: PAD_S105)',
                required: true
            },
            lang: {
                pattern: /EN|JP/,
                message: 'Language for effect text output ("EN" for TLs, "JP" for raw Japanese text)',
                required: true
            },
            autoDelimiter: {
                message: 'Beginning substring that delineates an AUTO effect.',
                required: true
            },
            contDelimiter: {
                message: 'Beginning substring that delineates a CONT effect.',
                required: true
            },
            actDelimiter: {
                message: 'Beginning substring that delineates an ACT effect.',
                required: true
            }
        }
    }

    // prompt user
    prompt.start();
    prompt.get(schema, function(err, results){
        if (err) {  console.log(err); return 1; }

        // get args
        let setCode = results.setCode;
        let lang = results.lang;
        let autoDelimiter = results.autoDelimiter;
        let contDelimiter = results.contDelimiter;
        let actDelimiter = results.actDelimiter;

        let effectProp = 'ability';
        if (lang == 'JP') {
            effectProp = 'jpAbility';
        }

        // read input file
        let inputString = fs.readFileSync('./input/sim_input/' + setCode + '.json', 'utf8');
        let cards = JSON.parse(inputString);

        // loop through all cards and process text
        let CARD_DATA = '';
        for (let card of cards) {
            let cardEntry = '';
            switch (card.type) {
                case 'Character':
                    // code
                    cardEntry += 'Character: ' + card.code + '\n';
                    // name
                    cardEntry += 'Name ' + card.name + '\n';
                    // color
                    cardEntry += 'Color ' + card.color.charAt(0).toUpperCase() + '\n';
                    // level
                    cardEntry += 'Level ' + card.level + '\n';
                    // cost
                    cardEntry += 'Cost ' + card.cost + '\n';
                    // trigger
                    if (card.trigger.length > 0) {
                        cardEntry += 'Trigger Soul \n';
                    }
                    // power
                    cardEntry += 'Power ' + card.power + '\n';
                    // soul
                    cardEntry += 'Soul ' + card.soul + '\n';
                    // traits
                    for (let x = 0; x < card.attributes.length; x++) {
                        cardEntry += 'Trait' + (x + 1) + ' ' + card.attributes[x] + '\n'; 
                    }
                    // effects
                    for (let effect of card[effectProp]) {
                        if (effect.includes(autoDelimiter)) {
                            cardEntry += 'Auto: (EffectLabel)\n';
                            cardEntry += '{\n'
                            cardEntry += '}\n'
                            cardEntry += 'Text Auto: ' + effect.substr(6) + '\n';
                        }
                        else if (effect.includes(contDelimiter)) {
                            cardEntry += 'Cont: (EffectLabel)\n';
                            cardEntry += '{\n'
                            cardEntry += '}\n'
                            cardEntry += 'Text Cont: ' + effect.substr(6) + '\n';
                        }
                        else if (effect.includes(actDelimiter)) {
                            cardEntry += 'Act: (EffectLabel)\n';
                            cardEntry += '{\n'
                            cardEntry += '}\n'
                            cardEntry += 'Text Act: ' + effect.substr(6) + '\n';
                        }
                    }
                    cardEntry += 'EndCard\n\n';
                    break;
                case 'Event': 
                    // code
                    cardEntry += 'Event: ' + card.code + '\n';
                    // name
                    cardEntry += 'Name ' + card.name + '\n';
                    // color
                    cardEntry += 'Color ' + card.color.charAt(0).toUpperCase() + '\n';
                    // level
                    cardEntry += 'Level ' + card.level + '\n';
                    // cost
                    cardEntry += 'Cost ' + card.cost + '\n';
                    // effect
                    cardEntry += 'Effect:\n';
                    cardEntry += '{\n'
                    cardEntry += '}\n'
                    for (let effect of card[effectProp]) {
                        cardEntry += 'Text ' + effect + '\n';
                    }
                    cardEntry += 'EndCard\n\n';
                    break;
                case 'Climax':
                    // code
                    cardEntry += 'Climax: ' + card.code + '\n';
                    // name
                    cardEntry += 'Name ' + card.name + '\n';
                    // color
                    cardEntry += 'Color ' + card.color.charAt(0).toUpperCase() + '\n';
                    cardEntry += 'EndCard\n\n';
                    break;
                default:
                    console.log("ERROR: Invalid card type - " + card.code);
            }

            CARD_DATA += cardEntry;

        }
       
        // write out to file
        fs.writeFileSync('./output/sim_output/' + setCode + ".txt", CARD_DATA);

    });

})();