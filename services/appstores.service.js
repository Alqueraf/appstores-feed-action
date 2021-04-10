const playstoreScrapper = require('google-play-scraper');
const appstoreScrapper = require('app-store-scraper');

class AppstoresService {
    /**
     *
     * @param {[string]} playstoreIds Apps to crawl
     * @param {[string]} appstoreIds Apps to crawl
     */
    async getLatestAppsData(playstoreIds, appstoreIds) {
        const playstoreRequests = playstoreIds.map(e => playstoreScrapper.app({appId: e}));
        const appstoreRequests = appstoreIds.map(e => appstoreScrapper.app({id: e, ratings: true}));

        const playstoreApps = await Promise.all(playstoreRequests);
        const appstoreApps = await Promise.all(appstoreRequests);
        
        let appsData = [];
        playstoreApps.forEach((playstoreApp) => {
            console.log("Adding playstore app: "+JSON.stringify(playstoreApp));
            appsData.push({
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
                "name": appstoreApp["title"],
                "icon": appstoreApp["icon"],
                "rating": appstoreApp["score"],
                "rating_count": appstoreApp["ratings"],
                "url": appstoreApp["url"],
                "type": "appstore"
            });
        });
        return appsData;
    }
}

const appstoresService = new AppstoresService();

module.exports = appstoresService;