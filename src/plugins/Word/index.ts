import CommandPlugin from "../CommandPlugin"
import fetch from "node-fetch"

export default class Cat extends CommandPlugin {
    public constructor() {
        super()
        this.register("!word", this.word.bind(this))
    }

    private async word(from: string, args: string[]): Promise<void> {
        try {
            const wordData = await fetch("https://www.thisworddoesnotexist.com/api/random_word.json")
            const wordJson = await wordData.json()
            const word = wordJson.word.word
            const definition = wordJson.word.definition
            const example = wordJson.word.example
            this.bot.sayToAll(word + "\n" + definition + "\n" + example)
        }
        catch {
            this.bot.sayToAll("Couldn't fetch random word")
        }
    }
}
