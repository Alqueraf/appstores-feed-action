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
                    "primaryGenre": app["primaryGenre"],
                    "type": "appstore"
                });
            }
        });
        return appsData;

        // const playstoreIds = appIds.filter(e => e.includes("."));
        // const appstoreIds = appIds.filter(e => !e.includes("."));
        // const playstoreRequests = playstoreIds.map(e => playstoreScrapper.app({
        //     appId: e
        // }));
        // const appstoreRequests = appstoreIds.map(e => appstoreScrapper.app({
        //     id: e,
        //     ratings: true
        // }));

        // const playstoreApps = await Promise.all(playstoreRequests);
        // const appstoreApps = await Promise.all(appstoreRequests);

        // let appsData = [];
        // playstoreApps.forEach((playstoreApp) => {
        //     console.log("Adding playstore app: " + JSON.stringify(playstoreApp));
        //     appsData.push({
        //         "id": playstoreApp["appId"],
        //         "name": playstoreApp["title"],
        //         "icon": playstoreApp["icon"],
        //         "rating": playstoreApp["scoreText"] != null ? parseFloat(playstoreApp["scoreText"]) : null,
        //         "installs": playstoreApp["installs"],
        //         "url": playstoreApp["url"],
        //         "type": "playstore"
        //     });
        // });
        // appstoreApps.forEach((appstoreApp) => {
        //     console.log("Adding appstore app: " + JSON.stringify(appstoreApp));
        //     appsData.push({
        //         "id": appstoreApp["id"],
        //         "name": appstoreApp["title"],
        //         "icon": appstoreApp["icon"],
        //         "rating": appstoreApp["score"],
        //         "rating_count": appstoreApp["ratings"],
        //         "url": appstoreApp["url"],
        //         "primaryGenre": appstoreApp["primaryGenre"],
        //         "type": "appstore"
        //     });
        // });
        // return appsData;
    }
}

const appstoresService = new AppstoresService();

module.exports = appstoresService;