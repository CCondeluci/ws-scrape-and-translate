// WARNING:
// HotC does not like anyone doing this, use it at your own risk. 
// Mostly a PoC to prove it's possible. I haven't used this script in years.

// imports
const request = require('request-promise-native');
const html_parser = require('node-html-parser');
const fs = require('fs');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// good ol fashioned consts
const TD_COUNT = 20;
const SET_COUNT = 104;
const SET_CODE = 'KMD/W96';
const SET_NAME = 'Dragonmaid';
const HOTC = 'https://heartofthecards.com/code/cardlist.html?card=WS_';

function padCodeSet(num) {
    var str = "" + num;
    var pad = "000";
    return pad.substring(0, pad.length - str.length) + str;
}

function padCodeTD(num) {
    var str = "" + num;
    var pad = "00";
    return pad.substring(0, pad.length - str.length) + str;
}

// async flag for await
(async () => {
    var tdTranslations = [];
    var setTranslations = [];
    // get td translations
    for (var i = 1; i <= TD_COUNT; i++) {
        try {
            // go get the card data from bushi's site
            let body = await request(HOTC + SET_CODE + '-T' + padCodeTD(i));
            // parse and index full html response
            let full_html = html_parser.parse(body);
            // rip the card detail (praise bushi for ID-ing it) and get all table rows
            let translationTr = full_html.querySelectorAll(".cards3");
            if (translationTr[2]) {
                tdTranslations.push({
                    code: SET_CODE + '-T' + padCodeTD(i),
                    text: translationTr[2].structuredText
                });
            } else {
                // go get the card data from bushi's site
                body = await request(HOTC + SET_CODE + '-T' + padCodeTD(i) + 'a');
                // parse and index full html response
                full_html = html_parser.parse(body);
                // rip the card detail (praise bushi for ID-ing it) and get all table rows
                translationTr = full_html.querySelectorAll(".cards3");
                if (translationTr[2]) {
                    tdTranslations.push({
                        code: SET_CODE + '-T' + padCodeTD(i) + 'a',
                        text: translationTr[2].structuredText
                    });
                } else {
                    tdTranslations.push({
                        code: SET_CODE + '-T' + padCodeTD(i),
                        text: '(ERROR)'
                    });
                }
            }
            console.log("DONE: " + SET_CODE + '-T' + padCodeTD(i));
        } catch (error) {
            console.log(error);
        }
    }

    for (var i = 0; i <= SET_COUNT; i++) {
        try {
            // go get the card data from bushi's site
            let body = await request(HOTC + SET_CODE + '-' + padCodeSet(i));
            // parse and index full html response
            let full_html = html_parser.parse(body);
            // rip the card detail (praise bushi for ID-ing it) and get all table rows
            let translationTr = full_html.querySelectorAll(".cards3");
            if (translationTr[2]) {
                tdTranslations.push({
                    code: SET_CODE + '-' + padCodeSet(i),
                    text: translationTr[2].structuredText
                });
            } else {
                // go get the card data from bushi's site
                body = await request(HOTC + SET_CODE + '-' + padCodeSet(i) + 'a');
                // parse and index full html response
                full_html = html_parser.parse(body);
                // rip the card detail (praise bushi for ID-ing it) and get all table rows
                translationTr = full_html.querySelectorAll(".cards3");
                if (translationTr[2]) {
                    tdTranslations.push({
                        code: SET_CODE + '-' + padCodeSet(i) + 'a',
                        text: translationTr[2].structuredText
                    });
                } else {
                    throw new Error();
                }
            }
            console.log("DONE: " + SET_CODE + '-' + padCodeSet(i));
        } catch (error) {
            console.log(error);
        }
    }

    var finalOutput = tdTranslations.concat(setTranslations);

    // write data to file
    fs.writeFileSync('./output/set_review_formatted_output/' + SET_NAME + ".json", JSON.stringify(finalOutput));
    console.log("-----------------------");
    console.log("SET DONE: " + SET_NAME);
    console.log("-----------------------");
})();