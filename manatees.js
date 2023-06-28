'use strict';

// imports
const _ = require('lodash');
const prompt = require('prompt');
const fs = require('fs');

function randomNumber(max) {
    return Math.floor((Math.random()*max))
}

// async flag for await
(async () => {
    // pick a random effect from an array of effects
    Array.prototype.random = function () {
        return this[randomNumber(this.length)];
    }

    let inputString = fs.readFileSync('./output/effect_db/effect-db.json', 'utf8');
    const EFFECT_DB = JSON.parse(inputString);

    // pick character or event
    let type = "Character";
    let typeGen = randomNumber(99);
    if (typeGen < 19) { // 20% chance of event
        type = "Event";
    }

    // pick card level
    let level = randomNumber(4);
    if (type == "Event") {
        level = randomNumber(3) + 1;
    }

    // pick amount of effects
    let effectCount = randomNumber(3) + 1; // 1-3 effects normally
    if (level == 3) { // if level 3, at least 2 effects
        effectCount = randomNumber(3) + 2; // 2-4 effects
    }

    let effects = [];
    for (let i = 0; i < effectCount; i++) {
        effects.push(EFFECT_DB[type][level].random());
    }

    console.log('\n');
    console.log("Type: " + type);
    console.log("Level: " + level);
    for (let effect of effects) {
        console.log("Effect: " + effect);
    }
    console.log('\n');

})();