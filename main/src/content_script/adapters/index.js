import TMAdapter from './tmall'

export function loadAdapter(adapterName) {
    let adapter = null
    switch(adapterName) {
    case 'tm':
        adapter = TMAdapter
        break
    }
    return adapter
}
