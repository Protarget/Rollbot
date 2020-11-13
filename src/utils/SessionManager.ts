export class Session<T> {
    public end: () => void
    public onCreate(value?: T, id?: string): void { /* */ }
    public onDestroy(): void { /* */ }
}

export class SessionManager<T extends Session<TS>, TS> {
    private typeConstructor: { new(): T }
    private sessions: Map<string, T> = new Map<string, T>()

    public constructor(typeConstructor: { new(): T }) {
        this.typeConstructor = typeConstructor
    }

    public create(id: string, argument?: TS): T {
        const session = new this.typeConstructor()
        session.end = () => { this.destroy(id) }
        this.sessions.set(id, session)
        session.onCreate(argument, id)
        return session
    }

    public destroy(id: string): void {
        if (this.sessions.has(id)) {
            this.sessions.get(id).onDestroy()
            this.sessions.delete(id)
        }
    }

    public clear(): void {
        this.sessions.forEach((v, k) => {
            v.end()
        })
    }

    public with(id: string, callback: (value: T) => void): void {
        if (this.sessions.has(id)) {
            callback(this.sessions.get(id))
        }
    }

    public without(id: string, callback: () => void): void {
        if (!this.sessions.has(id)) {
            callback()
        }
    }

    public withOrWithout(id: string, withCallback: (value: T) => void, withoutCallback: () => void): void {
        if (this.sessions.has(id)) {
            withCallback(this.sessions.get(id))
        }
        else {
            withoutCallback()
        }
    }

    public getWhere(predicate: (value: T) => boolean): T[] {
        const result = []
        for (const session of this.sessions.values()) {
            if (predicate(session)) {
                result.push(session)
            }
        }
        return result
    }

    public getAll(): T[] {
        return Array.from(this.sessions.values())
    }
}
