import AbstractAdapter from './abstract'

import TMAdapter from './tmall'
import TBAdapter from './taobao'

let adapter = new AbstractAdapter()
let isLoaded = false

export function loadAdapter(adapterName) {
    if (isLoaded) return adapter

    switch(adapterName) {
    case 'tm':
        adapter = new TMAdapter()
        break
    case 'tb':
        adapter = new TBAdapter()
        break
    }

    isLoaded = true

    return adapter
}
