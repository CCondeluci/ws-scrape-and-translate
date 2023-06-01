// imports
const request = require('request-promise-native');
const html_parser = require('node-html-parser');
const decode = require('html-entities').decode;

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function parse(number) {
    let parsed = parseInt(number);
    if (isNaN(parsed)) { return 0; }
    return parsed;
}

module.exports.get = async (nv_card, count) => {
    try {
        // go get the card data from novas's site
        let novaCode = nv_card.code.toLowerCase().replace('/', '-');
        let body = await request('https://www.novatcg.com/product/' + novaCode.toLowerCase() + '/');
        // parse and index full html response
        let full_html = html_parser.parse(body);
        // rip the card text p tags, and get all table rows from below
        let descriptionBlock = full_html.querySelector("#tab-description");
        let pTags = descriptionBlock.querySelectorAll('p');
        let tableRows = descriptionBlock.querySelectorAll('tr');

        // check if we got anything
        if (pTags.length < 1 || tableRows.length < 1) {
            throw new Error('No Card Data');
        }

        let names = pTags[0].structuredText.split('\n');
        let jpText = [];
        if (pTags[1]) {
            jpText = pTags[1].structuredText.split('\n');
        }
        let enText = [];
        if (pTags[2]) {
            enText = pTags[2].structuredText.split('\n');
        }
        
        // decode EN text
        for (let x = 0; x < enText.length; x++) {
            enText[x] = decode(enText[x]);
        }

        console.log(enText);

        let tableDataArr = [];
        for (let row of tableRows) {
            let cells = row.querySelectorAll('td');
            tableDataArr.push({name: cells[0].structuredText.replace(/[ :.]/g, ''), data: cells[1].structuredText});
            tableDataArr.push({name: cells[2].structuredText.replace(/[ :.]/g, ''), data: cells[3].structuredText});
        }

        let card = {};
        card.name = names[0];
        card.code = tableDataArr[0].data;
        card.rarity = tableDataArr[1].data;
        card.expansion = '';
        card.side = tableDataArr[3].data.charAt(0);
        card.type = tableDataArr[4].data;
        card.color = tableDataArr[2].data.toUpperCase();
        card.level = parse(tableDataArr[5].data);
        card.cost = parse(tableDataArr[7].data);
        card.power = parse(tableDataArr[6].data);
        card.trigger = tableDataArr[10].data.toUpperCase();
        switch(card.trigger) {
            case '1 SOUL': // normal soul trigger
                card.trigger = ['SOUL'];
                break;
            case '2 SOUL': // double soul trigger
                card.trigger = ['SOUL', 'SOUL'];
                break;
            case '': 
                card.trigger = [];
                break;
            case 'SOUL BOUNCE': // Wind
                card.trigger = ['SOUL', 'RETURN'];
                break;
            case 'TREASURE': // Bar
                card.trigger = ['TREASURE'];
                break;
            case 'STOCK': // Bag
                card.trigger = ['POOL'];
                break;
            case 'SOUL STANDBY': // Standby
                card.trigger = ['SOUL', 'STANDBY'];
                break;
            case 'SALVAGE': // Door
                card.trigger = ['COMEBACK'];
                break;
            case 'SOUL GATE': // Pants
                card.trigger = ['SOUL', 'GATE'];
                break;
            case 'DRAW': // Book
                card.trigger = ['DRAW'];
                break;
            case 'CHOICE': // Choice
                card.trigger = ['CHOICE'];
                break;
            default:
                card.trigger = ['ERROR'];
                break;
        }

        card.flavor_text = '';
        card.ability = enText;
        card.jpAbility = jpText;
        card.attributes = [tableDataArr[9].data, tableDataArr[11].data];
        if (card.attributes[0] == "None" && card.attributes[1] == "None") {
            card.attributes = [];
        } else if (card.attributes[0] != "None" && card.attributes[1] == "None") {
            card.attributes = [tableDataArr[9].data];
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
        let setcode = card.set.toLowerCase() + '_' + card.side.toLowerCase() + card.release.toLowerCase();
        card.image = "https://ws-tcg.com/wordpress/wp-content/images/cardlist/" + card.set.toLowerCase().charAt(0) + '/' + setcode + '/' + setcode + '_' + card.sid.toLowerCase() + '.png';  // a/all_s76/all_s76_t23.png"

        // return the card
        return card;
    } catch (error) {
        // this should only happen for promos really (barring SPs/SSPs)
        // ...we will just have to fill them out manually
        if (error.message == "No Card Data") {
            nv_card.NO_NOVA_DATA = true;
            return nv_card;
        } 
        // else, likely a 443, so let's try again (up to 5x)
        else {
            if (count < 5) {
                count++;
                console.log("RETRYING: " + nv_card.code + "..." + count);
                return await module.exports.get(nv_card, count);
            } 
            // MASSIVE ERROR
            else {
                console.log("TL MISSING ON NOVA: " + nv_card.name);
                console.log("------------------------------");
                nv_card.NO_NOVA_DATA = true;
                nv_card.MASSIVE_ERROR = true;
                return nv_card;
            }
            
        }
    }
}