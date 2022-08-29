const playstoreScrapper = require('google-play-scraper');
const appstoreScrapper = require('app-store-scraper');

class AppstoresService {
    /**
     *
     * @param {[string]} appIds Apps to crawl
     */
    async getLatestAppsData(appIds) {
        const storeRequests = appIds.map(id => id.includes(".") ?
            playstoreScrapper.app({
                appId: id
            }) :
            appstoreScrapper.app({
                id: id,
                ratings: true
            }));

        let appsData = [];
        const storeApps = await Promise.all(storeRequests);
        storeApps.forEach((app, index) => {
            if (appIds[index].includes(".")) {
                // Plasytore App
                console.log("Adding playstore app: " + JSON.stringify(app));
                appsData.push({
                    "id": app["appId"],
                    "name": app["title"],
                    "icon": app["icon"],
                    "rating": app["scoreText"] != null ? parseFloat(app["scoreText"]) : null,
                    "installs": app["installs"],
                    "url": app["url"],
                    "type": "playstore"
                });
            } else {
                // Appstore App
                console.log("Adding appstore app: " + JSON.stringify(app));
                appsData.push({
                    "id": app["id"],
                    "name": app["title"],
                    "icon": app["icon"],
                    "rating": app["score"],
                    "rating_count": app["ratings"],
                    "url": app["url"],
                    "primaryGenre": app["primaryGenre"] != null ? app["primaryGenre"] : "Business",
                    "type": "appstore"
                });
            }
        });
        return appsData;
    }
}

const appstoresService = new AppstoresService();
// appstoresService.getLatestAppsData("TODO: Add your comma-separated list of appIds to test here".split(",").map(e => e.trim()));

module.exports = appstoresService;