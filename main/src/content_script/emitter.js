export default class Emitter {
    constructor() {
        this.listenersMap = {}
    }

    on(eventName, onListen) {
        if (!this.listenersMap[eventName]) {
            this.listenersMap[eventName] = []
        }
        this.listenersMap[eventName].push(onListen)
    }
    
    emit(eventName, ...args) {
        if (this.listenersMap[eventName]) {
            for (let l of this.listenersMap[eventName]) {
                l(...args)
            }
        }
    }
}
