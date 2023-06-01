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
        // rip the card detail (praise bushi for ID-ing it) and get all table rows
        let cardDetail = full_html.querySelector("#cardDetail");
        let detailRows = cardDetail.querySelectorAll('tr');
        // sometimes, bushi doesn't index their promos... at all
        if (detailRows.length < 1) {
            throw new Error('No Card Data');
        }
        // get the card name element w/ annoying quotation marks by exploiting 'katakana' field
        let cardNameElem = cardDetail.querySelector('.kana');
        // build card from table row data
        let card = {};
        for (let detailRow of detailRows) {
            // table breaks down to associated arrays
            let dataRows = detailRow.querySelectorAll('td');
            let headerRows = detailRow.querySelectorAll('th');
            for (let i = 0; i < dataRows.length; i++) {
                // table sometimes has bunk rows, so skip those
                if (headerRows[i] !== undefined) {
                    // praise bushi yet again for consistent naming conventions
                    let currHeader = headerRows[i].structuredText;
                    let currHeaderLower = currHeader.toLowerCase().replace(' ', '_');
                    let currData = dataRows[i].structuredText;
                    let currDataRaw = dataRows[i];
                    // use the file time to rip color and 'side' (LOL)
                    if (currHeader == "Color" || currHeader == "Side") {
                        card[currHeaderLower] = currDataRaw.innerHTML.match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi)[0].toUpperCase();
                    } 
                    // triggers get set as an array for climaxes
                    else if (currHeader == "Trigger") {
                        let triggerCheck = currDataRaw.querySelectorAll('img');
                        let triggers = [];
                        for (let triggerImg of triggerCheck) {
                            triggers.push(triggerImg.toString().match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi)[0].toUpperCase());
                        }
                        card[currHeaderLower] = triggers;
                    }
                    // processing soul as int
                    else if (currHeader == "Soul") {
                        let soulArr = currDataRaw.querySelectorAll('img');
                        card[currHeaderLower] = soulArr.length;
                    }
                    // SHOULD split everything off
                    else if (currHeader == "Special Attribute") {
                        card['attributes'] = currData.split('・');
                    }
                    // processed as an array, split on effects
                    else if (currHeader == "Text") {
                        card['ability'] = currData.split('\n');
                    }
                    // we already have this from JK, but better to take it from bushi
                    else if (currHeader == "Rarity") {
                        card['rarity'] = currData;
                    }
                    // we already have this from JK, but better to take it from bushi
                    else if (currHeader == "Card No.") {
                        card['code'] = currData;
                    }
                    // character, event, or climax
                    else if (currHeader == "Card Type") {
                        card['type'] = currData;
                    }
                    // get bushi's real card name (w/ annoying quotes)
                    else if (currHeader == "Card Name") {
                        card['name'] = cardNameElem.structuredText.trim();
                    }
                    else if (currHeader == "Illustrator") {
                        // do not add, is not used
                    }
                    else {
                        card[currHeaderLower] = currData;
                    }
                }
            }
        }
        // process card code for set, sid, release
        // ex: KS/W49-E034	
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
        let imageDrill = cardDetail.querySelector('.graphic');
        let imageElem = imageDrill.querySelector('img');
        card['image'] = 'https://en.ws-tcg.com' + imageElem.attributes.src;
        
        // return the card
        return card;
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