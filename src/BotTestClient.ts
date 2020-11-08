import * as irc from "irc"
import * as readline from "readline"
import Bot from "./Bot"
import BotClient from "./BotClient"

export default class BotIRCClient implements BotClient {
    private bot: Bot = null
    private nick: string = "Owner"
    private channel: string = "#test"

    public connectToBot(bot: Bot): void {
        this.bot = bot

        const rl = readline.createInterface({input: process.stdin, output: process.stdout})
        rl.on("line", (value) => {
            if (value.startsWith("/nick ")) {
                this.nick = value.substring(6)
                console.log("Changed Nick: " + this.nick)
            }
            else if (value.startsWith("/join ")) {
                this.channel = value.substring(6)
                console.log("Changed Channel: " + this.channel)
            }
            else if (value.startsWith("/pm ")) {
                const msg = value.substring(4)
                this.bot.onPrivateMessage(this.nick, msg)
            }
            else {
                this.bot.onChatMessage(this.nick, value)
            }

            rl.prompt()
        })

        rl.prompt()
    }

    public sayToAll(message: string): void {
        console.log(`BOT: ${message}`)
    }

    public sayPrivate(to: string, message: string): void {
        console.log(`BOT <TO: ${to}>: ${message}`)
    }

    public getUsers(channel: string): string[] {
        return ["Owner"]
    }
}
