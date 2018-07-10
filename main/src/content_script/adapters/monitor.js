import { sendNotice } from '../utils'
import Emitter from '../emitter'

export default class Monitor extends Emitter {
    constructor(icon, pollingInterval, createPolling) {
        super()
        this.icon = icon
        this._skuArr = []
        this._pollingInterval = pollingInterval || 5 * 6e4
        this._timer = null
        this._poll = createPolling(this._onQuantityUpdate.bind(this))
    }

    _onQuantityUpdate(getStock) {
        this._skuArr.forEach((sku) => {
            const stock = getStock(sku)
            this.emit('update', sku, stock)
            if (stock > 0) {
                sendNotice(this.icon, 'OOS Watch - 补货通知', `${sku.name} 已补货! (剩余库存: ${stock})`)
            } else {
                console.log(new Date().toLocaleString(), sku.name, '还是没货~')
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

    addSku(id, skuId, skuName) {
        this._skuArr.push({ id, skuId, name: skuName })
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
