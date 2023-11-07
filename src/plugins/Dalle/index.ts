import CommandPlugin from "../CommandPlugin"
import openAi from "../../utils/OpenAiManager"

export default class Dalle extends CommandPlugin {
    public constructor() {
        super()
        this.register("!dalle", this.dalle.bind(this))
    }

    private async dalle(from: string, args: string[], fullMessage: string): Promise<void> {
        try {
            const [image, prompt] = await openAi.image(fullMessage)
            this.bot.sayToAll(await image)
            this.bot.sayToAll(prompt)
        }
        catch (e) {
            console.error(e)
            this.bot.sayToAll(e.message)
        }
    }
}
