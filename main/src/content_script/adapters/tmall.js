import { waitFor, fetchPage } from '../utils'
import config from '../config'
import Adapter from './abstract'
import Monitor from './monitor'

class Scraper {
    constructor(doc = document) {
        this._doc = doc
    }

    queryElements(query) {
        return Array.from(this._doc.querySelectorAll(query))
    }
    
    getFullHTML() {
        return this._doc.documentElement.outerHTML
    }

    scrapeText() {
        const eleArr = this.queryElements('.tm-sale-prop .tb-metatit')
        const txtArr = eleArr.map(el => el.textContent)

        const text = {
            sizeText: null,
            typeText: null,
        }
    
        if (txtArr.length > 1) {
            text.sizeText = txtArr[0]
            text.typeText = txtArr[1]
        } else {
            text.typeText = txtArr[0]
        }

        return text
    }

    scrapeTypes(text) {
        const liArr = this.queryElements(`ul[data-property="${text}"] li`)
        const types = liArr.map((l) => {
            const id = l.attributes['data-value'].value
            const title = l.title
            const style = l.querySelector('a').attributes.style
            const img = style ? `https:${style.value.match(/url\(([^\)]+)\)/)[1]}` : ''
            return { id, title, img }
        })
        return types
    }

    scrapeSizes(text) {
        const liArr = this.queryElements(`ul[data-property="${text}"] li`)
        const sizes = liArr.map((l) => {
            const id = l.attributes['data-value'].value
            const name = l.textContent.trim()
            return { id, name }
        })
        return sizes
    }

    scrapeSkus() {
        const html = this.getFullHTML()
        const initData = JSON.parse(html.match(/TShop\.Setup\(([^<]+)</)[1].split('\n')[1].trim())
        const skuList = initData.valItemInfo.skuList
            .map((skuInfo) => {
                skuInfo.stock = initData.valItemInfo.skuMap[`;${skuInfo.pvs};`].stock
                return skuInfo
            })
        return skuList
    }
}

async function createPageScraper() {
    const html = await fetchPage()
    const doc = document.implementation.createHTMLDocument('cache')
    doc.write(html)

    return new Scraper(doc)
}

async function pollQuantity(onResponse) {
    const sp = await createPageScraper()
    const skuList = sp.scrapeSkus()

    onResponse(sku => skuList.find(s => s.skuId === sku.skuId).stock)
}

function createPolling(onResponse) {
    return pollQuantity.bind(null, onResponse)
}

export default class TMAdapter extends Adapter {
    newMonitor(pollingInterval) {
        return new Monitor(config.icons.tm, pollingInterval, createPolling)
    }

    async loadApp(appEl) {
        let id = 'col-extra'
        await waitFor('#col-extra', 6e4)
        try {
            await waitFor('#J_DescCate', 3000)
            id = 'J_DescCate'
        } catch(e) {}
        document.getElementById(id).appendChild(appEl)
    }

    async adapt(rawData) {
        const rrSel = '.tm-Right-Recommend'
        waitFor(rrSel, 1e4)
            .then(() => {
                const tmRR = document.querySelector(rrSel)
                const sizeLen = (rawData.sizes || []).length
                tmRR.style.top = sizeLen * 40 + 210 + 'px'
            })
            .catch(() => {})
    }

    async scrapeRawData() {
        const data = {}
        const scraper = await createPageScraper()

        const text = scraper.scrapeText()
        data.text = text
        data.types = scraper.scrapeTypes(text.typeText)

        if (text.sizeText) {
            data.sizes = scraper.scrapeSizes(text.sizeText)
        }

        data.skus = scraper.scrapeSkus()

        return data
    }

    parseRawData(rawData) {
        const sizes = rawData.skus.map((sku) => {
            const pvsArr = sku.pvs.split(';')
            const typeId = pvsArr[1]
            const sizeId = pvsArr[0]
            const sizeName = rawData.sizes.filter(s => s.id === sizeId)[0].name
            return { id: sku.pvs, name: sku.names, typeId, sizeId, sizeName, skuId: sku.skuId }
        })

        const types = rawData.types.map((type) => {
            const sz = sizes.filter(s => s.typeId === type.id)
            return Object.assign({ sizes: sz }, type)
        })

        return { text: rawData.text, types }
    }
}
