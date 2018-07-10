export function queryElements(query) {
    return Array.from(document.querySelectorAll(query))
}

export function getFullHTML() {
    return document.documentElement.outerHTML
}

export function wait(time) {
    return new Promise(res => setTimeout(res, time))
}

export async function waitFor(sel, timeout) {
    timeout = timeout || 1e4
    const now = () => (new Date()).valueOf()
    const startTime = now()
    const getEle = () => document.querySelector(sel)
    while (!getEle()) {
        if (now() - startTime >= timeout) {
            throw `waitFor ${sel} timeout for ${timeout}ms`
        }
        await wait(50)
    }
}

export function get(url) {
    return fetch(url, { credentials: 'include' })
        .then(res => res.text())
}

export function reqPermission() {
    Notification.requestPermission().then((result) => {
        if (result === 'granted') {
            console.log('请求消息推送权限成功！')
        } else if (result === 'denied') {
            console.log('请求消息推送权限失败！')
        }
    }).catch(console.error)
}

export async function fetchPage() {
    const resp = await fetch(window.location.href, { credentials:'include' })
    const buffers = await resp.arrayBuffer()
    const text = new TextDecoder('GBK').decode(buffers)
    return text
}

export function sendNotice(icon, title, body) {
    const opts = { body, icon }
    new Notification(title, opts)
}
