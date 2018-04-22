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
