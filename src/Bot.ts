import BotClient from "./BotClient"
import BotPlugin from "./BotPlugin"

class Bot {
    private plugins: BotPlugin[] = []
    private client: BotClient

    public constructor(client: BotClient) {
        this.client = client
        client.connectToBot(this)
    }

    public addPlugin(plugin: BotPlugin): void {
        this.plugins.push(plugin)
        plugin.setBot(this)
    }

    public onChatMessage(from: string, message: string): void {
        this.plugins.filter(x => x.onChatMessage != null).forEach(x => x.onChatMessage(from, message))
    }

    public onPrivateMessage(from: string, message: string): void {
        this.plugins.filter(x => x.onPrivateMessage != null).forEach(x => x.onPrivateMessage(from, message))
    }

    public sayToAll(message: string): void {
        this.client.sayToAll(message)
        this.plugins.filter(x => x.onOutgoingChatMessage != null).forEach(x => x.onOutgoingChatMessage(message))
    }

    public sayPrivate(to: string, message: string): void {
        this.client.sayPrivate(to, message)
        this.plugins.filter(x => x.onOutgoingPrivateMessage != null).forEach(x => x.onOutgoingPrivateMessage(to, message))
    }

    public getUsers(channel: string): string[] {
        return this.client.getUsers(channel)
    }
}

export default Bot
