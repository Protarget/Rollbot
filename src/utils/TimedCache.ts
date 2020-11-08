interface TimedCacheEntry<T> {
    expires: Date,
    invariants: any[]
    value: T | null
}

export default class TimedCache<T> {
    private cache: {[key: string]: TimedCacheEntry<T>} = {}

    public async get(key: string, secondsToCache: number, refreshFn: () => Promise<T>, invariants: any[] = []): Promise<T> {
        const cachedValue = this.cache[key]
        if (cachedValue && this.checkInvariants(cachedValue.invariants, invariants) && new Date() < cachedValue.expires) {
            return cachedValue.value
        }
        else {
            const value = await refreshFn()
            const expires = new Date()
            expires.setSeconds(expires.getSeconds() + secondsToCache)
            this.cache[key] = { expires, invariants, value }
            return value
        }
    }

    private checkInvariants(oldInvariants: any[], newInvariants: any[]): boolean {
        if (oldInvariants.length !== newInvariants.length) { return false }
        for (let index = 0; index < oldInvariants.length; index++) {
            if (oldInvariants[index] !== newInvariants[index]) {
                return false
            }
        }
        return true
    }
}
