import Vue from 'vue'

import 'animate.css/animate.min.css'
import 'material-design-icons/iconfont/material-icons.css'

import Box from './Box.vue'
import { emit } from './emitter'

const boxId = 'oos-watch'

const boxWrapperDiv = document.createElement('div')
boxWrapperDiv.id = boxId
document.body.appendChild(boxWrapperDiv)

const app = new Vue({
    el: `#${boxId}`,
    render: h => h(Box)
})

const href = window.location.href
if (!/^file:.*/.test(href) && !/^http:\/\/localhost/.test(href)) {
    chrome.runtime.sendMessage({ method: 'getSiteId' }, (resp) => {
        if (resp) {
            emit('inject-adapterName', resp)
        }
    })
}

console.info('OOS Watch is ready')
