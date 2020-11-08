import * as irc from "irc"
import Bot from "./Bot"
import BotClient from "./BotClient"

enum IRCMode {
    Op = "@",
    Voice = "+",
    User = "",
}

export default class BotIRCClient implements BotClient {
    public readonly channel: string
    private client: irc.Client = null
    private bot: Bot = null
    private names: {[id: string]: {[id: string]: IRCMode}} = {}

    public constructor(server: string, nick: string, channel: string) {
        this.channel = channel.split(" ")[0]
        this.client = new irc.Client(server, nick, {channels: [channel]})
    }

    public connectToBot(bot: Bot): void {
        this.bot = bot
        this.client.on(`message${this.channel}`, this.onChatMessage.bind(this))
        this.client.on("pm", this.onPrivateMessage.bind(this))
        this.client.on("names", this.onNames.bind(this))

        this.client.on("error", e => {
            console.error("ERROR: ", e)
        })
    }

    public sayToAll(message: string): void {
        this.client.say(this.channel, message)
    }

    public sayPrivate(to: string, message: string): void {
        this.client.say(to, message)
    }

    public getUsers(channel: string): string[] {
        return Object.keys(this.names[channel])
    }

    private onChatMessage(from: string, message: string): void {
        this.bot.onChatMessage(from, message)
    }

    private onPrivateMessage(from: string, message: string): void {
        this.bot.onPrivateMessage(from, message)
    }

    private onNames(channel: string, nicks: {[id: string]: IRCMode}): void {
        this.names[channel] = nicks
    }
}
