export default class Adapter {
    newMonitor(pollingInterval) {
        throw new Error('Not be implemented')
    }

    async loadApp(appEl) {
        throw new Error('Not be implemented')
    }

    async adapt(rawData) {
        throw new Error('Not be implemented')
    }

    async scrapeRawData() {
        throw new Error('Not be implemented')
    }

    parseRawData(rawData) {
        throw new Error('Not be implemented')
    }
}
