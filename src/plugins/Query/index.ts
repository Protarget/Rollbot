import * as fs from "fs"
import fetch from "node-fetch"
import * as xml2js from "xml2js"
import Bot from "../../Bot"
import CommandPlugin from "../CommandPlugin"

export default class Query extends CommandPlugin {
    private appId: string = "96HEHH-HEHY56AH83"

    public constructor() {
        super()
        this.register("!q", this.execute.bind(this))
    }

    private async execute(from: string, args: string[]): Promise<void> {
        await this.tryForShortAnswer(from, args)
    }

    private async tryForShortAnswer(from: string, args: string[]): Promise<void> {
        const result = await fetch(`http://api.wolframalpha.com/v2/result?appid=${this.appId}&input=${encodeURIComponent(args.join(" "))}`)
        const body = await result.text()
        if (body === "Wolfram|Alpha did not understand your input") {
            this.bot.sayToAll("No idea")
        }
        else if (body === "No short answer available") {
            await this.tryForLongAnswer(from, args)
        }
        else {
            this.bot.sayToAll(body)
        }
    }

    private async tryForLongAnswer(from: string, args: string[]): Promise<void> {
        const result = await fetch(`http://api.wolframalpha.com/v2/query?appid=${this.appId}&input=${encodeURIComponent(args.join(" "))}`)
        const body = await result.text()
        xml2js.parseString(body, (err, result) => {
            if (err) {
                this.bot.sayToAll("Malformed result from query")
            }
            else {
                if (result.queryresult && result.queryresult.$ && result.queryresult.$.success === "true") {
                    // First, try to find a 'Result' pod
                    const firstAttempt = this.findResultPlaintext(result)
                    if (firstAttempt !== null) {
                        this.bot.sayToAll(firstAttempt)
                    }
                    else {
                        const secondAttempt = this.findFirstNonResultPlaintext(result)
                        if (secondAttempt !== null) {
                            this.bot.sayToAll(secondAttempt)
                        }
                        else {
                            this.bot.sayToAll("No idea")
                        }
                    }
                }
                else {
                    this.bot.sayToAll("No idea")
                }
            }
        })
    }

    private findResultPlaintext(data: any): string {
        const resultPod = data.queryresult.pod.find(x => x.$ && x.$.id === "Result")
        if (resultPod) {
            const plaintext = resultPod.subpod.find(x => x.plaintext && x.plaintext.length > 0)
            if (plaintext) {
                return plaintext.plaintext[0]
            }
        }
        return null
    }

    private findFirstNonResultPlaintext(data: any): string {
        const nextPod = data.queryresult.pod.find(x => x.$ && x.$.id !== "Result" && x.$.id !== "Input" && x.subpod && x.subpod.find(x => x.plaintext && x.plaintext.length > 0))
        if (nextPod) {
            const plaintext = nextPod.subpod.find(x => x.plaintext && x.plaintext.length > 0)
            if (plaintext) {
                return plaintext.plaintext[0]
            }
        }
        return null
    }
}
