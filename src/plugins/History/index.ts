import BotPlugin from "../../BotPlugin"
import CommandPlugin from "../CommandPlugin"

export default class History extends CommandPlugin {
    private historyBuffer: string[] = []
    private defaultSize: number = 20
    private maxSize: number = 300

    public constructor(defaultSize: number = 20, maxSize: number = 300) {
        super()
        this.defaultSize = defaultSize
        this.maxSize = maxSize
        this.registerPrivate("!history", this.history.bind(this))
    }

    public onNoCommand(from: string, message: string): void {
        this.addHistoryLine(`${new Date().toISOString()} ${from}: ${message}`)
    }

    public onOutgoingChatMessage(message: string): void {
        this.addHistoryLine(`${new Date().toISOString()} rollbot: ${message}`)
    }

    private history(from: string, args: string[]): void {
        let size = this.defaultSize
        if (args.length > 0) {
            try {
                const count: number = parseInt(args[0], 10)
                if (Number.isNaN(count)) {
                    this.bot.sayPrivate(from, `Argument to history must be a positive number between 1 and ${this.maxSize}`)
                    return
                }
                else if (count <= 0) {
                    this.bot.sayPrivate(from, `Argument to history must be a positive number between 1 and ${this.maxSize}`)
                    return
                }
                else if (count > this.maxSize) {
                    this.bot.sayPrivate(from, `Argument to history must be a positive number between 1 and ${this.maxSize}`)
                    return
                }
                else {
                    size = count
                }
            }
            catch (e) {
                this.bot.sayPrivate(from, "Error parsing argument")
                return
            }
        }
        try {
            const buffer = this.getHistoryBuffer(size)
            buffer.reverse()
            this.sendMessagesInBatch(from, buffer)
        }
        catch (e) {
            this.bot.sayPrivate(from, "Error while fetching chatlog")
        }
    }

    private addHistoryLine(line: string): void {
        this.historyBuffer.unshift(line)
        if (this.historyBuffer.length > this.maxSize) {
            this.historyBuffer.pop()
        }
    }

    private getHistoryBuffer(size: number): string[] {
        return this.historyBuffer.slice(0, size)
    }

    private async sendMessagesInBatch(recipient: string, messages: string[]): Promise<void> {
        try {
            this.bot.sayPrivate(recipient, "======== BEGIN CHATLOG ========")
            let pauseCounter = 0
            for (const line of messages) {
                this.bot.sayPrivate(recipient, line)
                pauseCounter++
                if (pauseCounter >= 10) {
                    pauseCounter = 0
                    await this.wait(500)
                }
            }
            this.bot.sayPrivate(recipient, "========= END CHATLOG =========")
        }
        catch (e) {
            this.bot.sayPrivate(recipient, "Error while fetching chatlog")
        }

    }

    private wait(t: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, t))
    }
}
