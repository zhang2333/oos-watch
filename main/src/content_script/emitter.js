const listenersMap = {}

export function on(eventName, onListen) {
    if (!listenersMap[eventName]) {
        listenersMap[eventName] = []
    }
    listenersMap[eventName].push(onListen)
}

export function emit(eventName, ...args) {
    if (listenersMap[eventName]) {
        for (let l of listenersMap[eventName]) {
            l(...args)
        }
    }
}
