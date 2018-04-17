;(function () {
    const matches = [
        'https://detail.tmall.com/*',
        'https://item.taobao.com/*',
        'https://detail.tmall.hk/*',
    ]
    const matchRegs = matches.map(m => new RegExp(m.replace('*', '.*')))

    function matchURL(url) {
        for (let r of matchRegs) {
            if (r.test(url)) return true
        }
        return false
    }

    chrome.tabs.onUpdated.addListener((id, info, tab) => {
        if (matchURL(tab.url)) {
            chrome.pageAction.show(id)
        }
    })
})()
