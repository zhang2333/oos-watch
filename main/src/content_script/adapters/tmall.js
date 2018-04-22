import { queryElements, getFullHTML, wait, waitFor } from '../utils'

function scrapeText() {
    const eleArr = queryElements('.tm-sale-prop .tb-metatit')
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

function scrapeTypes(text) {
    const liArr = queryElements(`ul[data-property="${text}"] li`)
    const types = liArr.map((l) => {
        const id = l.attributes['data-value'].value
        const title = l.title
        const style = l.querySelector('a').attributes.style.value
        const img = `https:${style.match(/url\(([^\)]+)\)/)[1]}`
        return { id, title, img }
    })
    return types
}

function scrapeSizes(text) {
    const liArr = queryElements(`ul[data-property="${text}"] li`)
    const sizes = liArr.map((l) => {
        const id = l.attributes['data-value'].value
        const name = l.textContent.trim()
        return { id, name }
    })
    return sizes
}

function scrapeSkus() {
    const html = getFullHTML()
    const initData = JSON.parse(html.match(/TShop\.Setup\(([^<]+)</)[1].split('\n')[1].trim())
    const skuList = initData.valItemInfo.skuList
    return skuList
}

function scrapeItemId() {
    return getFullHTML().match(/itemId:"([^"]+)"/)[1]
}

// Monitor
function reqPermission() {
    Notification.requestPermission().then((result) => {
        if (result === 'granted') {
            console.log('请求消息推送权限成功！')
        } else if (result === 'denied') {
            console.log('请求消息推送权限失败！')
        }
    }).catch(console.error)
}

function sendNotice(title, body) {
    const opts = {
        body,
        icon: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1523687199326&di=6d7fb82c64a3fb7ecd19293ffcad5dab&imgtype=0&src=http%3A%2F%2Fimg.mp.itc.cn%2Fupload%2F20170724%2Fe68a3a58eedd4e1d82cc11e2218a8203_th.jpg'
    }
    new Notification(title, opts)
}

function pollQuantity(cachedTimestamp, itemId, isg, isg2, onResponse) {
    const query = {
        isUseInventoryCenter: 'true',
        cartEnable: 'true',
        service3C: 'false',
        isApparel: 'true',
        isSecKill: 'false',
        tmallBuySupport: 'true',
        isAreaSell: 'true',
        tryBeforeBuy: 'false',
        offlineShop: 'false',
        itemId: itemId,
        showShopProm: 'false',
        cachedTimestamp: cachedTimestamp,
        isPurchaseMallPage: 'false',
        isRegionLevel: 'true',
        household: 'false',
        sellerPreview: 'false',
        queryMemberRight: 'true',
        addressLevel: '3',
        isForbidBuyItem: 'false',
        callback: 'setMdskip',
        timestamp: new Date().valueOf(),
        isg,
        isg2,
    }

    const qs = Object.keys(query).map(k => `${k}=${query[k]}`).join('&')
    const url = `https://mdskip.taobao.com/core/initItemDetail.htm?${qs}`

    fetch(url, { credentials: 'include' })
        .then(res => res.text())
        .then((rawText) => {
            const line = rawText.split('\n').pop()
            const json = line.slice(1, line.length - 1)
            const r = JSON.parse(json)
            onResponse(r)
        })
}

function createPolling(onResponse) {
    const html = getFullHTML()
    const cachedTimestamp = html.match(/cachedTimestamp=([^&]+)/)[1]
    const itemId = scrapeItemId()
    let isg = document.cookie.match('(^|;) ?l=([^;]*)(;|$)')
    let isg2 = document.cookie.match('(^|;) ?isg=([^;]*)(;|$)')
    isg = (isg && isg[2]) || 'null'
    isg2 = (isg2 && isg2[2]) || 'null'

    return pollQuantity.bind(null, cachedTimestamp, itemId, isg, isg2, onResponse)
}

class Monitor {
    constructor(pollingInterval) {
        this._skuArr = []
        this._pollingInterval = pollingInterval || 5 * 6e4
        this._timer = null

        this._poll = createPolling(this._onQuantityUpdate.bind(this))

        reqPermission()
    }

    _onQuantityUpdate(r) {
        const q = r.defaultModel.inventoryDO.skuQuantity
        this._skuArr.forEach((sku) => {
            if (q[sku.id].quantity > 0) {
                sendNotice('OOS Watch - 补货通知', `${sku.name} 已补货!`)
            } else {
                console.log(new Date().toLocaleString(), '还是没货~')
            }
        })
    }

    isPolling() {
        return !!this._timer
    }

    _clearTimer() {
        if (this._timer) {
            clearInterval(this._timer)
        }
        this._timer = null
    }

    startPolling() {
        this._clearTimer()
        this._poll()
        this._timer = setInterval(this._poll, this._pollingInterval)
    }

    stop() {
        this._clearTimer()
    }

    addSku(skuId, skuName) {
        this._skuArr.push({ id: skuId, name: skuName })
        if (!this.isPolling()) {
            this.startPolling()
        }
    }

    removeSku(skuId) {
        const filterd = this._skuArr.filter(s => s.id === skuId)
        if (filterd.length) {
            const s = filterd[0]
            const i = this._skuArr.indexOf(s)
            this._skuArr.splice(i, 1)

            if (this._skuArr.length < 1) {
                this.stop()
            }
        }
    }
}

export default {
    newMonitor(pollingInterval) {
        return new Monitor(pollingInterval)
    },

    async loadApp(appEl) {
        let id = 'col-extra'
        await waitFor('#col-extra', 6e4)
        try {
            await waitFor('#J_DescCate', 3000)
            id = 'J_DescCate'
        } catch(e) {}
        document.getElementById(id).appendChild(appEl)
    },

    scrapeRawData() {
        const data = {}

        const text = scrapeText()
        data.text = text
        data.types = scrapeTypes(text.typeText)

        if (text.sizeText) {
            data.sizes = scrapeSizes(text.sizeText)
        }
    
        data.skus = scrapeSkus()

        return data
    },

    parseRawData(rawData) {
        const data = {}
    
        const sizes = rawData.skus.map((sku) => {
            const pvsArr = sku.pvs.split(';')
            const typeId = pvsArr[1]
            const sizeId = pvsArr[0]
            const sizeName = rawData.sizes.filter(s => s.id === sizeId)[0].name
            return { id: sku.pvs, name: sku.names, typeId, sizeId, sizeName, skuId: sku.skuId }
        })
    
        const types = rawData.types.map((type) => {
            type.sizes = sizes.filter(s => s.typeId === type.id)
            return type
        })
    
        return { text: rawData.text, types }
    },
}
