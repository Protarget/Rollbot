import CommandPlugin from "../CommandPlugin"
import openAi from "../../utils/OpenAiManager"

export default class Ai extends CommandPlugin {
    public constructor() {
        super()
        this.register("!ai", this.ai.bind(this))
    }

    private async ai(from: string, args: string[], fullMessage: string): Promise<void> {
        try {
            const text = await openAi.complete(fullMessage, Math.floor(128 + Math.random() * 128))
            this.bot.sayToAll(text)
        }
        catch (e) {
            console.error(e)
            this.bot.sayToAll("Couldn't fetch AI completion")
        }
    }
}
