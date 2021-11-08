import CommandPlugin from "../CommandPlugin"
import fetch from "node-fetch"

export default class Cat extends CommandPlugin {
    public constructor() {
        super()
        this.register("!ai", this.ai.bind(this))
    }

    private async ai(from: string, args: string[], fullMessage: string): Promise<void> {
        try {
            const trimmedMessage = fullMessage.trim()
            const completeData = await fetch("https://api.eleuther.ai/completion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    context: trimmedMessage,
                    remove_input: true,
                    response_length: 128,
                    temp: 0.8,
                    top_p: 0.9
                })
            })

            const completeJson = await completeData.json()
            const text = completeJson[0].generated_text
            this.bot.sayToAll(trimmedMessage + text)
        }
        catch (e) {
            console.error(e)
            this.bot.sayToAll("Couldn't fetch AI completion")
        }
    }
}
