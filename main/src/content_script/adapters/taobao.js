import { getFullHTML, get, waitFor, fetchPage } from '../utils'
import config from '../config'
import Adapter from './abstract'
import Monitor from './monitor'

const scrapeVal = (s, key) => s.match(new RegExp(`${key}[ ]*:[ ]*([^,]+),`))[1].replace(/'/g, '')

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
        const eleArr = this.queryElements('.tb-skin .tb-property-type')
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
            const title = l.textContent.trim().split('\n')[0]
            const style = l.querySelector('a').attributes.style.value
            const img = `https:${style.match(/url\(([^\)]+)\)/)[1]}`
            return { id, title, img }
        })
        return types
    }

    scrapeSizes(text) {
        const liArr = this.queryElements(`ul[data-property="${text}"] li`)
        const sizes = liArr.map((l) => {
            const id = l.attributes['data-value'].value
            const name = l.textContent.trim().split('\n')[0]
            return { id, name }
        })
        return sizes
    }

    scrapeSkus() {
        const html = this.getFullHTML()
        const skuMap = JSON.parse(html.match(/Hub\.config\.set\('sku[^\)]+\)/)[0].match(/skuMap.+}}/)[0].replace(/skuMap[ ]+: /, ''))
        /**
         * {
            ";20509:28316;1627207:30156;": {
                "price": "69.00",
                "stock": "2",
                "skuId": "3306061280477",
                "oversold": false
            },
        }
         */
        return skuMap
    }

    scrapeItemId() {
        return scrapeVal(this.getFullHTML(), 'itemId')
    }

    scrapeSellerId() {
        return scrapeVal(this.getFullHTML(), 'sellerId')
    }    
}

let itemId = ''
let sellerId = ''

function pollQuantity(itemId, sellerId, onResponse) {
    const query = {
        itemId,
        sellerId,
        modules: 'dynStock,qrcode,viewer,price,duty,xmpPromotion,delivery,upp,activity,fqg,zjys,amountRestriction,couponActivity,soldQuantity,originalPrice,tradeContract',
        callback: 'onSibRequestSuccess',
    }

    const qs = Object.keys(query).map(k => `${k}=${query[k]}`).join('&')
    const url = `//detailskip.taobao.com/service/getData/1/p1/item/detail/sib.htm?${qs}`

    get(url).then((rawText) => {
        const line = rawText.split('\n').pop().replace('onSibRequestSuccess(', '')
        const json = line.slice(0, line.length - 2)
        const r = JSON.parse(json)
        const q = r.data.dynStock.sku
        const getStock = s => q[s.id].stock
        onResponse(getStock)
    })
}

function createPolling(onResponse) {
    return pollQuantity.bind(null, itemId, sellerId, onResponse)
}

export default class TMAdapter extends Adapter {
    newMonitor(pollingInterval) {
        return new Monitor(config.icons.tb, pollingInterval, createPolling)
    }

    async loadApp(appEl) {
        let clazz = '.tb-vertical-desc-segments-list'
        await waitFor(clazz, 6e4)
        document.querySelector(clazz).appendChild(appEl)
    }

    async adapt(rawData) {

    }

    async scrapeRawData() {
        const data = {}

        const html = await fetchPage()
        const doc = document.implementation.createHTMLDocument('cache')
        doc.write(html)

        const scraper = new Scraper(doc)

        const text = scraper.scrapeText()
        data.text = text
        data.types = scraper.scrapeTypes(text.typeText)

        if (text.sizeText) {
            data.sizes = scraper.scrapeSizes(text.sizeText)
        }

        data.skus = scraper.scrapeSkus()

        itemId = scraper.scrapeItemId()
        sellerId = scraper.scrapeSellerId()

        return data
    }

    parseRawData(rawData) {
        const sizes = Object.keys(rawData.skus).map((k) => {
            const sku = rawData.skus[k]
            const arr = k.split(';').filter(Boolean)
            const sizeId = arr[0]
            const typeId = arr[1]
            const sizeName = rawData.sizes.filter(s => s.id === sizeId)[0].name
            const typeName = rawData.types.filter(t => t.id === typeId)[0].title
            const id = k
            const name = `${typeName} ${sizeName}`

            return { id, name, typeId, sizeId, sizeName, skuId: sku.skuId }
        })

        const types = rawData.types.map((type) => {
            const sz = sizes.filter(s => s.typeId === type.id)
            return Object.assign({ sizes: sz }, type)
        })

        return { text: rawData.text, types }
    }
}
