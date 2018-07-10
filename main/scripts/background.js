;(function () {
    const sites = {
        tm: 'https://detail.tmall.com/*',
        // TODO: adapt
        tb: 'https://item.taobao.com/*',
        // tmgj: 'https://detail.tmall.hk/*',
    }
    const siteRegs = Object.keys(sites).map((s) => {
        let o = {}
        o[s] = new RegExp(sites[s].replace('*', '.*'))
        return o
    }).reduce((a, b) => Object.assign(a, b))

    function matchURL(url) {
        const siteIds = Object.keys(sites)
        for (let i of siteIds) {
            if (siteRegs[i].test(url)) return i
        }
        return null
    }

    chrome.tabs.onUpdated.addListener((id, info, tab) => {
        if (matchURL(tab.url)) {
            chrome.pageAction.show(id)
        }
    })

    chrome.runtime.onMessage.addListener((msg, sender, send) => {
        switch (msg.method) {
            case 'getSiteId':
                send(matchURL(sender.url))
                break
        }
    })
})()
