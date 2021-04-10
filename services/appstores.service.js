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
        const appstoreRequests = appstoreIds.map(e => appstoreScrapper.app({id: e}));

        const playstoreApps = await Promise.all(playstoreRequests);
        const appstoreApps = await Promise.all(appstoreRequests);
        
        let appsData = [];
        playstoreApps.forEach((playstoreApp) => {
            appsData.push({
                "name": playstoreApp["title"],
                "icon": playstoreApp["icon"],
                "rating": playstoreApp["scoreText"] != null ? parseInt(playstoreApp["scoreText"]) : null,
                "installs": playstoreApp["installs"],
                "url": playstoreApp["url"],
                "type": "playstore"
            });
        });
        appstoreApps.forEach((appstoreApp) => {
            appsData.push({
                "name": appstoreApp["title"],
                "icon": appstoreApp["icon"],
                "rating": appstoreApp["score"],
                "rating_count": appstoreApp["reviews"],
                "url": appstoreApp["url"],
                "type": "appstore"
            });
        });
        return appsData;
    }
}

const appstoresService = new AppstoresService();

module.exports = appstoresService;