import * as fs from "fs"
import CommandPlugin from "../CommandPlugin"

export default class Weed extends CommandPlugin {
    private weedNames: string[] = []
    private weedJson: object

    public constructor() {
        super()
        this.register("!weed", this.weed.bind(this))
        const weedData = fs.readFileSync("./data/Weed/strains.json", "utf8")
        this.weedJson = JSON.parse(weedData)
        for (const i of Object.keys(this.weedJson)) {
            this.weedNames.push(i)
        }
    }

    private weed(from: string, args: string[]): void {
        const randomWeed = this.weedNames[Math.floor(Math.random() * this.weedNames.length)]
        this.bot.sayToAll(randomWeed + " (" + this.weedJson[randomWeed].flavors.join(", ") + ")")
    }
}
