const playstoreScrapper = require('google-play-scraper');
const appstoreScrapper = require('app-store-scraper');

class AppstoresService {
    /**
     *
     * @param {[string]} appIds Apps to crawl
     */
    async getLatestAppsData(appIds) {
        const playstoreIds = appIds.filter(e => e.includes("."));
        const appstoreIds = appIds.filter(e => !e.includes("."));
        const playstoreRequests = playstoreIds.map(e => playstoreScrapper.app({appId: e}));
        const appstoreRequests = appstoreIds.map(e => appstoreScrapper.app({id: e, ratings: true}));

        const playstoreApps = await Promise.all(playstoreRequests);
        const appstoreApps = await Promise.all(appstoreRequests);
        
        let appsData = [];
        playstoreApps.forEach((playstoreApp) => {
            console.log("Adding playstore app: "+JSON.stringify(playstoreApp));
            appsData.push({
                "id": playstoreApp["appId"],
                "name": playstoreApp["title"],
                "icon": playstoreApp["icon"],
                "rating": playstoreApp["scoreText"] != null ? parseFloat(playstoreApp["scoreText"]) : null,
                "installs": playstoreApp["installs"],
                "url": playstoreApp["url"],
                "type": "playstore"
            });
        });
        appstoreApps.forEach((appstoreApp) => {
            console.log("Adding appstore app: "+JSON.stringify(appstoreApp));
            appsData.push({
                "id": appstoreApp["id"],
                "name": appstoreApp["title"],
                "icon": appstoreApp["icon"],
                "rating": appstoreApp["score"],
                "rating_count": appstoreApp["ratings"],
                "url": appstoreApp["url"],
                "primaryGenre" : appstoreApp["primaryGenre"],
                "type": "appstore"
            });
        });
        return appsData;
    }
}

const appstoresService = new AppstoresService();

module.exports = appstoresService;