import Vue from 'vue'

import 'animate.css/animate.min.css'
import 'material-design-icons/iconfont/material-icons.css'

import Box from './Box.vue'
import * as Adapters from './adapters'
import eventBus from './event-bus'

async function start(adapterName) {
    const boxId = 'oos-watch'
    
    const boxWrapperDiv = document.createElement('div')
    boxWrapperDiv.id = boxId

    const adapter = Adapters.loadAdapter(adapterName)
    await adapter.loadApp(boxWrapperDiv)

    const app = new Vue({
        el: `#${boxId}`,
        render: h => h(Box)
    })

    eventBus.emit('inject-adapterName', adapterName)

    console.info('OOS Watch is ready')
}

const href = window.location.href
if (!/^file:.*/.test(href) && !/^http:\/\/localhost/.test(href)) {
    chrome.runtime.sendMessage({ method: 'getSiteId' }, (resp) => {
        if (resp) {
            start(resp)
        }
    })
}
