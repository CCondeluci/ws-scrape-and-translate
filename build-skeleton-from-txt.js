'use strict';

// imports
const prompt = require('prompt');
const fs = require('fs');
const readline = require('readline');

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

async function readFile(file) {
    return new Promise((res, rej) => {
        try {
            var text = '';
            var readInterface = readline.createInterface({
                input: fs.createReadStream(file),
                terminal: false
            });

            let setCards = [];

            readInterface
                .on('line', function (line) {
                    let linea = line.trim();
                    let card = {
                        code: linea,
                        name: '',
                        rarity: '',
                        bushi: 'https://en.ws-tcg.com/cardlist/?cardno=' + linea
                    }
                    // push onto cards array
                    setCards.push(card);
                })
                .on('close', function () {
                    res(setCards);
                });
        } catch(err){
            rej(err)
        }
    });
}

(async () => {
    // properties
    let props = ['fileName', 'outputName'];
    // prompt user
    prompt.start();
    prompt.get(props, async function(err, results){
        if (err) {  console.log(err); return 1; }

        // get args
        let fileName = results.fileName;
        let outputName = results.outputName;
        let setCards = [];

        setCards = await readFile('./input/multi_code_lists/' + fileName + '.txt');

        console.log("# of cards parsed: " + setCards.length);
        // write out to file
        fs.writeFileSync('./output/skeleton_en/' + outputName + ".json", JSON.stringify(setCards, null, 4));
    });
})();