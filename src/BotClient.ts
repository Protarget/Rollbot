import Bot from "./Bot"

interface BotClient {
    connectToBot(bot: Bot): void
    sayToAll(message: string): void
    sayPrivate(to: string, message: string): void
    getUsers(channel: string): string[]
}

export default BotClient
