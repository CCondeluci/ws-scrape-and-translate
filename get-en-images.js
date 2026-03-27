'use strict';

// imports
const fs = require('fs');
const request = require('request-promise-native');
const sharp = require('sharp');

// constants
const EN_SETS = require('./set_lists/en-sets');
const width = 400;//130;
const height = 557;//182;

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
    for (let set of EN_SETS) {
        // read bushi-parsed set from file
        let bushiString = fs.readFileSync('./output/final_output/' + set.substr(3) + '.json', 'utf8');
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
                    encoding: null,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                        'Cookie': '_gcl_au=1.1.978976351.1752237705; _ga=GA1.1.1041174403.1752237706; _ga=GA1.3.1041174403.1752237706; _fbp=fb.1.1752237706310.638287717135032875; _ga_1WKZMR7H8R=GS2.1.s1752237705$o1$g1$t1752237793$j60$l0$h0; CookieConsent={stamp:%27hduulqWW17govdqnnICmzYcGHI6idV0qKb/R36mXobqK88t3Br5Jog==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27explicit%27%2Cver:1%2Cutc:1754626496661%2Cregion:%27us-42%27}; cardlist_view=image; cardlist_search_sort=new'
                    }
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
                    if (card.image.indexOf('https://en.ws-tcg.com/cardlist/cardimages') > -1) {
                        // bushi climaxes are already flipped, so just invert the card dimensions
                        if (card.type === 'Climax') {
                            sharp(imgBuffer).resize(height, width).png().toFile('./images/' + card.side + card.release + '/' + card.sid + '.gif');
                        } else {
                            sharp(imgBuffer).resize(width, height).png().toFile('./images/' + card.side + card.release + '/' + card.sid + '.gif');
                        }
                    }
                    // else, we have to flip climaxes
                    else {
                        // bushi climaxes are already flipped, so just invert the card dimensions
                        if (card.type === 'Climax') {
                            sharp(imgBuffer).resize(height, width).png().toFile('./images/' + card.side + card.release + '/' + card.sid + '.gif');
                        } else {
                            sharp(imgBuffer).resize(width, height).png().toFile('./images/' + card.side + card.release + '/' + card.sid + '.gif');
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
        console.log("SET DONE: " + set);
        console.log("-----------------------");
    }
})();
