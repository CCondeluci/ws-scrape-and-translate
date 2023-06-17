'use strict';

// imports
const fs = require('fs');
const request = require('request-promise-native');
const sharp = require('sharp');

// constants
const JP_SETS = require('./set_lists/jp-sets');
const width = 400;
const height = 559;
const flip = false; // flag to flip CX or not

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// recursive function for 3 tries per image
async function recursiveLookup (options, count) {
    if (count > 5) {
        return false;
    }
    try {
        let body = await request(options);
        return body;
    } catch (error) {
        count++;
        console.log('Failed request...retrying... attempt #' + count);
        await recursiveLookup(options, count);
    }
}

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets
    for (let set of JP_SETS) {
        // read bushi-parsed set from file
        let bushiString = fs.readFileSync('./output/nova_output/' + set.code + '.json', 'utf8');
        let cards = JSON.parse(bushiString);
        // go get the image for every card, compress it, then save it off
        let cardImagePromiseArr = [];
        for (let card of cards) {
            cardImagePromiseArr.push(new Promise(async function (resolve, reject) {
                // throttleboys
                // await new Promise(resolve => setTimeout(resolve, 5000));
                    
                // get the card image
                var options = {
                    url: card.image,
                    encoding: null
                };
                // recursively go get the body up to 5 times to combat random 443s
                let body = await recursiveLookup(options, 0);
                // if we got a response
                if (body) {
                    // pull image into a buffer
                    let imgBuffer = Buffer.from(body);

                    // make set img directory if it doesn't already exist
                    if (!fs.existsSync('./images/' + card.side + card.release)){
                        fs.mkdirSync('./images/' + card.side + card.release);
                    }

                    // check if the image was from bushi or not
                    if (card.image.indexOf('https://ws-tcg.com/cardlist/cardimages') > -1) {
                        // bushi climaxes are already flipped, so just invert the card dimensions
                        if (card.type === 'Climax') {
                            sharp(imgBuffer).resize(height, width).png().toFile('./images/' + card.side + card.release + '/' + card.code + '.jpg');
                        } else {
                            sharp(imgBuffer).resize(width, height).png().toFile('./images/' + card.side + card.release + '/' + card.code + '.jpg');
                        }
                    }
                    // else, we have to flip climaxes
                    else {
                        // bushi climaxes are already flipped, so just invert the card dimensions
                        if (card.type === 'Climax') {
                            sharp(imgBuffer).resize(height, width).png().toFile('./images/' + card.side + card.release + '/' + card.code + '.jpg');
                        } else {
                            sharp(imgBuffer).resize(width, height).png().toFile('./images/' + card.side + card.release + '/' + card.code + '.jpg');
                        }
                    }
                    console.log("DONE: " + card.side + card.release + '/' + card.sid);
                } else {
                    console.log("COULD NOT GET: " + card.side + card.release + '/' + card.sid);
                }
                resolve();
            }));
        }
        await Promise.all(cardImagePromiseArr);


        console.log("-----------------------");
        console.log("SET DONE: " + set.code);
        console.log("-----------------------");
    }
})();
