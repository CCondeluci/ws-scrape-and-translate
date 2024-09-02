// imports
const request = require('request-promise-native');
const html_parser = require('node-html-parser');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

module.exports.get = async (skeleton_card, count) => {
    try {
        // go get the card data from bushi's site
        let body = await request(skeleton_card.bushi);
        // parse and index full html response
        let full_html = html_parser.parse(body);
        // rip the card detail 
        let cardDetail = full_html.querySelector(".p-cards__detail-wrapper-inner");

        // build card from table row data
        let card = {};

        // name & code have unique class selectors
        card['name'] = cardDetail.querySelector('.ttl.u-mt-14.u-mt-16-sp').structuredText.trim();
        card['code'] = cardDetail.querySelector('.number').structuredText.trim();

        // first div block
        let metadataDetail = cardDetail.querySelector('.p-cards__detail-type.u-mt-22.u-mt-40-sp');
        let metadataBlocks = metadataDetail.querySelectorAll('dl');
        // get data from metadata block
        for (let metadataBlock of metadataBlocks) {
            switch (metadataBlock.querySelector('dt').structuredText.trim()) {
                case 'Rarity':
                    card['rarity'] = metadataBlock.querySelector('dd').structuredText.trim();
                    break;
                case 'Expansion':
                    card['expansion'] = metadataBlock.querySelector('dd').structuredText.trim();
                    break;
                case 'Side':
                    card['side'] = metadataBlock.querySelector('dd').innerHTML.match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi)[0].toUpperCase();
                    break;
                case 'Card Type':
                    card['type'] = metadataBlock.querySelector('dd').structuredText.trim();
                    break;
                case 'Color':
                    card['color'] = metadataBlock.querySelector('dd').innerHTML.match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi)[0].toUpperCase();
                    break;
                case 'Traits':
                    card['attributes'] = metadataBlock.querySelector('dd').structuredText.trim().split('・');
                    break;
                default:
                    break;
            }
        }

        // second div block
        let cardDataDetail = cardDetail.querySelector('.p-cards__detail-status.u-mt-22.u-mt-40-sp');
        let cardDataBlocks = cardDataDetail.querySelectorAll('dl');
        // get data from card data block
        for (let cardDataBlock of cardDataBlocks) {
            switch (cardDataBlock.querySelector('dt').structuredText.trim()) {
                case 'Level':
                    card['level'] = cardDataBlock.querySelector('dd').structuredText.trim();
                    break;
                case 'Cost':
                    card['cost'] = cardDataBlock.querySelector('dd').structuredText.trim();
                    break;
                case 'Power':
                    card['power'] = cardDataBlock.querySelector('dd').structuredText.trim();
                    break;
                case 'Soul':
                    card['soul'] = cardDataBlock.querySelector('dd').querySelectorAll('img').length;
                    break;
                case 'Trigger':
                    let triggerCheck = cardDataBlock.querySelector('dd').querySelectorAll('img');
                    let triggers = [];
                    for (let triggerImg of triggerCheck) {
                        triggers.push(triggerImg.toString().match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi)[0].toUpperCase());
                    }
                    card['trigger'] = triggers;
                    break;
                default:
                    break;
            }
        }

        let cardText = cardDetail.querySelector('.p-cards__detail.u-mt-22.u-mt-40-sp').querySelector('p');
        card['ability'] = cardText.structuredText.split('\n');

        let flavorText = cardDetail.querySelector('.p-cards__detail-serif.u-mt-22.u-mt-40-sp').querySelector('p');
        card['flavor_text'] = flavorText.structuredText;

        card.set = card.code.split('/')[0];
        // disgaea-style catch (DG/EN-S03-E046)
        if (card.code.split('-')[2]) {
            card.release = card.code.split('/')[1].split('-')[1].substring(1);
            card.sid = card.code.split('-')[2];
        } else {
            card.release = card.code.split('/')[1].split('-')[0].substring(1);
            card.sid = card.code.split('-')[1];
        }

        // get bushi's image
        let imageDrill = cardDetail.querySelector('.image');
        let imageElem = imageDrill.querySelector('img');
        card['image'] = 'https://en.ws-tcg.com' + imageElem.attributes.src;
        
        // re-order object props for comparison's sake to old site output
        let returnCard = {
            name: card.name,
            code: card.code,
            rarity: card.rarity,
            expansion: card.expansion,
            side: card.side,
            type: card.type,
            color: card.color,
            level: card.level,
            cost: card.cost,
            power: card.power,
            soul: card.soul,
            trigger: card.trigger,
            attributes: card.attributes,
            ability: card.ability,
            flavor_text: card.flavor_text,
            set: card.set,
            release: card.release,
            sid: card.sid,
            image: card.image
        }

        // return the card
        return returnCard;
    } catch (error) {
        // this should only happen for promos really (barring SPs/SSPs)
        // ...we will just have to fill them out manually
        if (error.message == "No Card Data") {
            skeleton_card.NO_BUSHI_DATA = true;
            return skeleton_card;
        } 
        // else, likely a 443, so let's try again (up to 5x)
        else {
            if (count < 5) {
                count++;
                console.log("RETRYING: " + skeleton_card.code + "..." + count);
                return await module.exports.get(skeleton_card, count);
            } 
            // MASSIVE ERROR
            else {
                console.log("BIG ERROR: " + skeleton_card.name);
                console.log(error);
                console.log("------------------------------");
                skeleton_card.NO_BUSHI_DATA = true;
                skeleton_card.MASSIVE_ERROR = true;
                return skeleton_card;
            }
            
        }
    }
}