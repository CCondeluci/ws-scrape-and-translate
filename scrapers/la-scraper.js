// imports
const request = require('request-promise-native');
const html_parser = require('node-html-parser');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const VALID_RARITIES = ['RR+', 'AR', 'FR', 'RR', 'R', 'U', 'C', 'CR', 'CC', 'TD', 'PR', 'PS'];

module.exports.get = async (cardId, count) => {
    try {
        // go get the card data from bushi's site
        let body = await request('https://littleakiba.com/tcg/weiss-schwarz/card.php?card_id=' + cardId);

        // parse and index full html response
        let full_html = html_parser.parse(body);
        let choppedDetail = full_html.innerHTML.match(/<div class="card_details">(.|\n|\r|\t)*/gi)[0];
        let cardDetailBlock = choppedDetail.split('<div id="footer">')[0];
        // parse actual information
        let detail_html = html_parser.parse(cardDetailBlock);

        // build card json
        let card = {};
        // get JP card name
        if (detail_html.querySelector('h4')) {
            if (detail_html.querySelector('h4').structuredText) {
                card['name'] = detail_html.querySelector('h4').structuredText;
            } else {
                card['name'] = "--GET NAME MANUALLY--";
                console.log('---------FIX THIS NAME!---------');
            }
        } else {
            card['name'] = "--GET NAME MANUALLY--";
            console.log('---------FIX THIS NAME!---------');
        }
        // get code and rarity
        let codeRarity = detail_html.querySelector('small').structuredText.split(' ');
        card['code'] = codeRarity[0];
        card['rarity'] = codeRarity[1];

        // if card is foil, explode immediately
        if (VALID_RARITIES.indexOf(card.rarity) < 0) {
            return undefined;
        }

        // get expansion title
        card['expansion'] = full_html.querySelector('h2').structuredText;

        // get side
        card['side'] = card.code.split('/')[1].split('-')[0].replace(/[0-9]/g, '');

        // get detail "table"
        let detailRows = detail_html.querySelectorAll('li');
        // loop rows
        for (let detailRow of detailRows) {
            let propertyName = detailRow.querySelector('label').structuredText.toLowerCase();
            if (propertyName) {
                if (propertyName == 'trigger') {
                    let triggerText = detailRow.structuredText.split(' ')[1];
                    // convert LA triggers into real triggers
                    switch(triggerText) {
                        case '1': // normal soul trigger
                            card[propertyName] = ['SOUL'];
                            break;
                        case '2': // double soul trigger
                            card[propertyName] = ['SOUL', 'SOUL'];
                            break;
                        case '0': 
                            card[propertyName] = [];
                            break;
                        case '1W': // Wind
                            card[propertyName] = ['SOUL', 'RETURN'];
                            break;
                        case 'G': // Bar
                            card[propertyName] = ['TREASURE'];
                            break;
                        case 'S': // Bag
                            card[propertyName] = ['POOL'];
                            break;
                        case '1P': // Standby
                            card[propertyName] = ['SOUL', 'STANDBY'];
                            break;
                        case 'D': // Door
                            card[propertyName] = ['COMEBACK'];
                            break;
                        case '1A': // Pants
                            card[propertyName] = ['SOUL', 'GATE'];
                            break;
                        case 'B': // Book
                            card[propertyName] = ['DRAW'];
                            break;
                        default: // Choice
                            card[propertyName] = ['CHOICE'];
                            break;
                    }
                } else if (propertyName == 'soul') {
                    card[propertyName] = parseInt(detailRow.structuredText.split(' ')[1]);
                } else if (propertyName == 'color') {
                    card[propertyName] = detailRow.structuredText.split(' ')[1].toUpperCase();
                }
                else {
                    card[propertyName] = detailRow.structuredText.split(' ')[1];
                }
            } 
        }

        // if card has no soul, mark 0
        if (!card.soul) {
            card['soul'] = 0;
        }

        // get paragraphs
        let paragraphs = detail_html.querySelectorAll('p');
        let effects = [];
        // loop paragraphs
        for (let i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].structuredText === 'Card Text/Abilities:') {
                let effectArr = paragraphs[i+1].structuredText.split("\n");
                for (let effect of effectArr) {
                    effects.push(effect);
                }
            }
            if (paragraphs[i].structuredText === 'Flavor Text:') {
                if (paragraphs[i+2]) {
                    if (paragraphs[i+2].structuredText) {
                        card['flavor_text'] = paragraphs[i+2].structuredText;
                    } else {
                        card['flavor_text'] = '-';
                    }
                } else {
                    card['flavor_text'] = '-';
                }
            }
        }
        // set card effects
        card['ability'] = effects;

        // set traits
        let traitString = detail_html.structuredText; 
        let traitMatch = traitString.match(/(Traits::)(.|\n|\r|\t)*(?=\nCard Text\/Abilities:)/g);
        if (traitMatch) {
            if (traitMatch[0] == "Traits::") {
                card['attributes'] = [];
            } else {
                let traitArr = traitMatch[0].split('::\n')[1].split('\n');
                card['attributes'] = traitArr;
            }
        } else {
            card['attributes'] = [];
        }

        // generate set codes
        card['set'] = card.code.split('/')[0];
        card['release'] = card.code.split('/')[1].split('-')[0];
        card['sid'] = card.code.split('-')[1];

        // get image link
        let imageAnchor = detail_html.querySelector('.fullview');
        card['image'] = imageAnchor.rawAttrs.match(/(?<=href=")(.+)(?=" class)/g)[0];
        
        return card;
    } catch (error) {
        console.log(error);
    }
}