// imports
const XLSX = require('xlsx');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

module.exports.get = async (cardsFile, XPAC, SIDE) => {
    try {
        let cards = [];
        var workbook = XLSX.readFile(cardsFile);
        for (let sheetName of workbook.SheetNames) {
            let sheet = workbook.Sheets[sheetName];
            let range = XLSX.utils.decode_range(sheet['!ref']);
            for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
                let card = {};

                // code cell
                let codeCell =  sheet[XLSX.utils.encode_cell({r: rowNum, c: 0})];
                // exit if undefined
                if (!codeCell) {
                    break;
                }
                card['code'] = codeCell.v.split('\r\n')[0];
                console.log(card.code);
                // generate set codes
                card['set'] = card.code.split('/')[0];
                card['release'] = card.code.split('/')[1].split('-')[0];
                card['sid'] = card.code.split('-')[1];

                // image cell
                let imageCell = sheet[XLSX.utils.encode_cell({r: rowNum, c: 1})];
                card['image'] = '';//imageCell.f.replace('image("', '').replace('\")', '');

                // full card text cell
                let textCell = sheet[XLSX.utils.encode_cell({r: rowNum, c: 2})];
                let textSplitArr = textCell.v.split('\n\n');
                
                card['flavor_text'] = "-";
                card['rarity'] = textSplitArr[0].split(')')[0].split('(')[1];
                if (textSplitArr[0].match(/ \(.*\)/g)) {
                    card['attributes'] = textSplitArr[0].match(/ \(.*\)/g)[0].split('(')[1].split(')')[0].split('/');
                } else {
                    card['attributes'] = [];
                }
                if (textSplitArr[0].match(/\d\/\d/g)) {
                    card['level'] = textSplitArr[0].match(/\d\/\d/g)[0].split('/')[0];
                    card['cost'] = textSplitArr[0].match(/\d\/\d/g)[0].split('/')[1];
                } else {
                    card['level'] = '0';
                    card['cost'] = '0';
                }
                if (textSplitArr[0].match(/\d\/\d.*(?= \()/g)) {
                    card['name'] = textSplitArr[0].match(/\d\/\d.*(?= \()/g)[0];
                    card['type'] = 'Character';
                } else {
                    if (textSplitArr[0].indexOf('CX') >= 1) {
                        card['name'] = textSplitArr[0].split(') ')[1];
                        card['type'] = 'Climax';
                    } else if (textSplitArr[0].indexOf('Event') >= 1) {
                        card['name'] = textSplitArr[0].split(') ')[1];
                        card['type'] = 'Event';
                    } else {
                        card['name'] = '(NAME NOT FOUND)';
                        card['type'] = '(UNKNOWN)';
                    }
                }

                card['ability'] = [];
                for (let i = 1; i < textSplitArr.length; i++) {
                    card.ability.push(textSplitArr[i]);
                }

                console.log(textSplitArr);
                
                let finalCard = {
                    name: card.name,
                    code: card.code,
                    rarity: card.rarity,
                    expansion: XPAC,
                    side: SIDE,
                    type: card.type,
                    color: '', // limitation of community translations
                    level: card.level,
                    cost: card.cost,
                    trigger: [], // limitation of community translations
                    power: '', // limitation of community translations
                    soul: 0, // limitation of community translations
                    flavor_text: card.flavor_text, // limitation of community translations
                    ability: card.ability,
                    attributes: card.attributes,
                    set: card.set,
                    release: card.release,
                    sid: card.sid,
                    image: card.image,
                    community: true
                }
                
                console.log(finalCard.code + ': DONE');
                cards.push(finalCard);
            }
        }
        return cards;
    } catch (error) {
        console.log(error);
    }
}