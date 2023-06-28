'use strict';

// imports
const _ = require('lodash');
const prompt = require('prompt');
const fs = require('fs');
const path = require('path');

function readFiles(dir, processFile) {
    // read directory
    let sets = [];
    fs.readdirSync(dir).forEach(filename => {
        
        // get current file name
        const name = path.parse(filename).name;
        // get current file extension
        const ext = path.parse(filename).ext;
        // get current file path
        const filepath = path.resolve(dir, filename);

        let inputString = fs.readFileSync(filepath, 'utf8');
        sets.push(JSON.parse(inputString));
    });
    
    return sets;
}

// async flag for await
(async () => {

    let allSets = readFiles('../WeissSchwarz-ENG-DB/DB');

    let db = {
        Character: {
            "0": [],
            "1": [],
            "2": [],
            "3": []
        },
        Event: {
            "0": [],
            "1": [],
            "2": [],
            "3": []
        }
    }
    for (let set of allSets) {
        for (let card of set) {
            if (card.type == "Character") {
                for (let effect of card.ability) {
                    if (db.Character[card.level]) {
                        db.Character[card.level].push(effect);
                    }
                }
            } else if (card.type == "Event") {
                for (let effect of card.ability) {
                    if (db.Event[card.level]) {
                        db.Event[card.level].push(effect);
                    }
                }
            }
        }
    }
       
    // write out to file
    fs.writeFileSync('./output/effect_db/effect-db.json', JSON.stringify(db, null, 4));


})();