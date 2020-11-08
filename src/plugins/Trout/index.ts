import Bot from "../../Bot"
import BotPlugin from "../../BotPlugin"
import { Session, SessionManager } from "../../utils/SessionManager"

class PermaTrout extends Session<void> {

}

export default class Trout extends BotPlugin {
    private sessions: SessionManager<PermaTrout, void> = new SessionManager(PermaTrout)

    public onChatMessage(from: string, message: string): void {
        if (message.startsWith("!trout ")) {
            const argument = message.substr(7).trim()
            if (argument.length > 0) {
                this.bot.sayToAll(`${from} slaps ${argument} around a bit with a large trout`)
            }
        }
        else if (message.startsWith("!permatrout ")) {
            const argument = message.substr(12).trim()
            if (argument.length > 0) {
                this.sessions.withOrWithout(argument, (session) => {
                    this.bot.sayToAll(`Deactivating PermaTrout on ${argument}`)
                    session.end()
                },
                () => {
                    this.bot.sayToAll(`Initiating PermaTrout on ${argument}`)
                    this.sessions.create(argument)
                })
            }
        }
        else if (message === "!notrout") {
            this.sessions.clear()
        }
        else {
            this.sessions.with(from, () => {
                this.bot.sayToAll(`rollbot slaps ${from} around a bit with a large trout`)
            })
        }
    }
}
