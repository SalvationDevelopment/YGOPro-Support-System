
require('dotenv').config();
const axios = require('axios'),
    CMS_URL = process.env.CMS_URL,
    controller = require('./src'),
    fs = require('fs'),
    SERVER_USERNAME = process.env.SERVER_USERNAME,
    SERVER_PASSWORD = process.env.SERVER_PASSWORD;



/**
 * Program Entry Point
 * @returns {undefined}
 */
async function main() {
    console.log('[SERVER] YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.magenta);
    const banlist = './http/manifest/banlist.json';

    if (!CMS_URL || !SERVER_USERNAME || !SERVER_PASSWORD) {
        console.error('Administrative Server and User are not configured, no database access, see README.MD for details.');
        process.exit();
    }
    try {
        const status = await axios.get(`${CMS_URL}`);
    } catch {
        console.error(`Administrative Server is not online at ${CMS_URL}, no database access.`);
        process.exit();
    }

    if (!fs.existsSync(banlist)) {
        console.error('Error: Banlist not generated, run "npm run banlist"');
        process.exit();
    }

    process.title = 'YGOSalvation Server ' + new Date();

}

main();