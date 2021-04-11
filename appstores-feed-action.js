// Compile this file using: `ncc build appstores-feed-action.js --license licenses.txt`
const fs = require('fs');
const appstoresService = require('./services/appstores.service');
const axios = require('axios');

const core = require('@actions/core');
const process = require('process');
const exec = require('./exec');

let jobFailFlag = false; // Job status flag

// Svg file path, default: ./images/appstores.svg
const SVG_FILE_PATH = core.getInput('svg_path');
const GITHUB_TOKEN = core.getInput('gh_token');

// Reading account from the workflow input
const appstoreIds = core.getInput('appstore_ids').split(",").map(e => e.trim());
const playstoreIds = core.getInput('playstore_ids').split(",").map(e => e.trim());
if (appstoreIds.length === 0 && playstoreIds.length === 0) {
    core.error('Please add some app ids to retrieve');
    process.exit(1);
}

// Retrieve Apps Data
appstoresService.getLatestAppsData(playstoreIds, appstoreIds).then(async appsData => {
    if (appsData.length === 0) {
        core.error('Couldn\'t retrieve any apps for the specified ids');
        core.info("Appstore ids: " + appstoreIds);
        core.info("Playstore ids: " + playstoreIds);
        process.exit(1);
    } else {
        try {
            core.info("Got apps data:" + appsData.map(e => JSON.stringify(e)).join());
            // core.info("Reading SVG file");
            // let svgData = "";
            // try {
            //     svgData = fs.readFileSync(SVG_FILE_PATH, 'utf8');
            // } catch (err) {
            //     core.info("Could not read current svg file");
            //     core.info(err);
            // }
            // Get icon images as base64
            core.info("Getting base64 icons");
            appsData = await replaceIconsWithBase64Images(appsData);
            // Build SVG
            core.info("Building Apps SVGs");
            const svgsData = appsData.map(e => buildAppSvg(e));
            // Create directory if not exists
            // Creates /tmp/a/apple, regardless of whether `/tmp` and /tmp/a exist.
            fs.mkdirSync(SVG_FILE_PATH, {
                recursive: true
            }, (e) => {
                core.info('Could not create SVG file directory');
                core.error(e);
                process.exit(1);
            });
            // Write svg files
            appsData.forEach((app, index) => {
                const fileName = SVG_FILE_PATH + "/" + app["id"] + ".svg";
                core.info('Writing to ' + fileName);
                fs.writeFileSync(fileName, svgsData[index]);
            });
            // TODO: Update README
            // TODO: Check if changes
            core.info("Comitting and pushing changes");
            await commitAndPush();
            // // If there's change in svg file update it
            // if (newSvgData !== svgData) {
            //     core.info('Writing to ' + SVG_FILE_PATH);
            //     fs.writeFileSync(SVG_FILE_PATH, newSvgData);
            //     await commitSvg();
            // } else {
            //     core.info('No change detected, skipping');
            //     process.exit(0);
            // }
        } catch (e) {
            core.error(e);
            process.exit(1);
        }
    }
}).catch(error => {
    // Rejected
    core.error('Failed to retrieve latest apps data. Error:');
    core.error(error);
    process.exit(1);
});

const replaceIconsWithBase64Images = async (appsData) => {
    const iconsRequest = appsData.map(element => getBase64FromUrl(element["icon"]));
    const icons = await Promise.all(iconsRequest);
    for (let index = 0; index < appsData.length; index++) {
        let app = appsData[index];
        app["icon"] = icons[index];
        appsData[index] = app;
    }
    return appsData;
}

/**
 * Converts an app data to svg file string
 * @param app {Object}: app data to display
 * @return {string}: content after converting object data to svg
 */
const buildAppSvg = (app) => {
    // Placeholders
    const appImagePlaceholder = "{{image}}";
    const appNamePlaceholder = "{{name}}";
    const appRatingPlaceholder = "{{rating}}";
    const appMetricsElementPlaceholder = "{{appMetrics}}";
    const appMetricsPlaceholder = "{{metrics}}";
    const appLinkPlaceholder = "{{appLink}}";
    const appLinkImagePlaceholder = "{{appLinkImage}}";

    // Prepare HTML block
    const htmlStartElement = `
<svg width="${itemWidth}" height="${itemHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <foreignObject width="100%" height="100%">
        ${css}`;
    const htmlEndElement = `
    </foreignObject>
</svg>`;
    const appMetricsElement = `<p class="grid-item-caption">${appMetricsPlaceholder}</p>`;
    const htmlRowElement = `
<div xmlns="http://www.w3.org/1999/xhtml"  class="grid-item">
    <img class="grid-item-image" src="${appImagePlaceholder}"/>
    <div class="grid-item-info">
        <p class="grid-item-title">${appNamePlaceholder}</p>
        <p class="grid-item-rating">⭐️ ${appRatingPlaceholder}</p>
        ${appMetricsElementPlaceholder}
    </div>
    <a class="grid-item-link" target="_blank" xlink:href="${appLinkPlaceholder}">
        <img height="30px" src="${appLinkImagePlaceholder}"/>
    </a>
</div>`;

    // Set Content
    let svgElement = htmlRowElement
        .replace(appNamePlaceholder, app["name"].trim().replace(/(\r\n|\n|\r)/gm, " "))
        .replace(appImagePlaceholder, app["icon"])
        .replace(appRatingPlaceholder, app["rating"])
        .replace(appMetricsElementPlaceholder, app["type"] === "appstore" ? "" : appMetricsElement.replace(appMetricsPlaceholder, app["installs"] + " installs"))
        .replace(appLinkPlaceholder, app["url"].replace(/&/g, "&amp;"))
        .replace(appLinkImagePlaceholder, app["type"] === "appstore" ? appstoreCtaBase64Image : playstoreCtaBase64Image);

    return (htmlStartElement + svgElement + htmlEndElement).trim();
};


// /**
//  * Builds the new readme by replacing the readme's <!-- APPSTORES-FEED:START --><!-- APPSTORES-FEED:END --> tags
//  * @param previousContent {string}: actual readme content
//  * @param newContent {string}: content to add
//  * @return {string}: content after combining previousContent and newContent
//  */
// const buildReadme = (previousContent, newContent) => {
//     const tagToLookFor = `<!-- APPSTORES-FEED:`;
//     const closingTag = '-->';
//     const tagNewlineFlag = true;
//     const startOfOpeningTagIndex = previousContent.indexOf(
//         `${tagToLookFor}START`,
//     );
//     const endOfOpeningTagIndex = previousContent.indexOf(
//         closingTag,
//         startOfOpeningTagIndex,
//     );
//     const startOfClosingTagIndex = previousContent.indexOf(
//         `${tagToLookFor}END`,
//         endOfOpeningTagIndex,
//     );
//     if (
//         startOfOpeningTagIndex === -1 ||
//         endOfOpeningTagIndex === -1 ||
//         startOfClosingTagIndex === -1
//     ) {
//         // Exit with error if comment is not found on the readme
//         core.error(
//             `Cannot find the comment tag on the readme:\n${tagToLookFor}:START -->\n${tagToLookFor}:END -->`
//         );
//         process.exit(1);
//     }
//     return [
//         previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
//         tagNewlineFlag ? '\n' : '',
//         newContent,
//         tagNewlineFlag ? '\n' : '',
//         previousContent.slice(startOfClosingTagIndex),
//     ].join('');
// };

/**
 * Code to do git commit
 * @return {Promise<void>}
 */
const commitAndPush = async () => {
    // Getting config
    const committerUsername = core.getInput('committer_username');
    const committerEmail = core.getInput('committer_email');
    const commitMessage = core.getInput('commit_message');
    // Doing commit and push
    await exec('git', [
        'config',
        '--global',
        'user.email',
        committerEmail,
    ]);
    if (GITHUB_TOKEN) {
        // git remote set-url origin
        await exec('git', ['remote', 'set-url', 'origin',
            `https://${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
        ]);
    }
    await exec('git', ['config', '--global', 'user.name', committerUsername]);
    await exec('git', ['add', '-A']);
    await exec('git', ['commit', '-m', commitMessage]);
    await exec('git', ['pull', '--ff-only']);
    await exec('git', ['push']);
    core.info('Appstores SVG updated successfully in the upstream repository');
    // Making job fail if one of the source fails
    process.exit(jobFailFlag ? 1 : 0);
};

// MARK: Styling
const itemWidth = 300;
const itemHeight = 135;
const css = `
<style>
.grid-item {
    width: 300px;
    border-bottom: 1px solid rgba(236, 236, 236, 1);
    display: grid;
    grid-template-columns: auto auto auto;
    align-items: center;
    padding-bottom: 10px;
}

.grid-item-image {
    width: 50px;
    height: 50px;
}

.grid-item-info {
    width: 125px;
    display: inline;
    margin-left: 10px;
}

.grid-item-title {
    font-weight: bold;
}

.grid-item-rating {
}

.grid-item-caption {
    font-size: 12px
}

.grid-item-link {
    margin-left: 10px;
}
p {
    margin: 0;
}
</style>`;

// MARK: Base64 Images
const appstoreCtaBase64Image = "data:image/png;base64,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";
const playstoreCtaBase64Image = "data:image/png;base64,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";

const getBase64FromUrl = async (url) => {
    core.info("Getting base64 image from url " + url);
    const image = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    const raw = Buffer.from(image.data).toString('base64');
    return "data:" + image.headers["content-type"] + ";base64," + raw;
}