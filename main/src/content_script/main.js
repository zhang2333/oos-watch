import Vue from 'vue'
import Box from './Box.vue'

const boxId = 'oos-watch'

const boxWrapperDiv = document.createElement('div')
boxWrapperDiv.id = boxId
document.body.appendChild(boxWrapperDiv)

new Vue({
    el: `#${boxId}`,
    render: h => h(Box)
})
