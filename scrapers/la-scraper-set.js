// imports
const request = require('request-promise-native');
const html_parser = require('node-html-parser');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

module.exports.get = async (setId, count) => {
    try {
        // go get the card data from bushi's site
        let body = await request('https://littleakiba.com/tcg/weiss-schwarz/browse.php?series_id=' + setId);

        // parse and index full html response
        let full_html = html_parser.parse(body);

        // get set code
        let setcode = full_html.querySelectorAll("h5")[7].structuredText.split(' ')[1].split('-')[0].replace('/', '_');
        
        let codes = full_html.querySelectorAll("li");
        let cardCodes = [];
        for (let listItem of codes) {
            if (listItem.childNodes[1]) {
                let url = listItem.childNodes[1].rawAttrs.split('card_id=')[1];
                let cardId = url.split('"')[0];
                cardCodes.push(setcode, cardId);
            }
        }

        return {setcode: setcode, codes: cardCodes};
    } catch (error) {
        console.log(error);
    }
}