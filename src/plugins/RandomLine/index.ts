import * as fs from "fs"
import Bot from "../../Bot"
import CommandPlugin from "../CommandPlugin"

export default class RandomLine extends CommandPlugin {
    private lines: string[] = []
    private processor: (line: string) => string

    public constructor(command: string, filename: string, processor?: (line: string) => string) {
        super()
        try {
            this.processor = processor
            this.lines = fs.readFileSync(filename, "utf-8").split("\n")
            this.register(command, this.randomLine.bind(this))
        }
        catch (e) {
            console.error(e)
        }
    }

    private randomLine(from: string, args: string[]): void {
        const line = this.lines[Math.floor(Math.random() * this.lines.length)]
        if (this.processor) {
            this.bot.sayToAll(this.processor(line))
        }
        else {
            const linebreak = line.split("<br />")
            for (const i of linebreak) {
                this.bot.sayToAll(i)
            }
        }
    }
}
