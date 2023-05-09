import * as fs from "fs"
import fetch from "node-fetch"

export class OpenAiManager {
    private apiKey: string

    public constructor(secretFile: string) {
        const data = JSON.parse(fs.readFileSync(secretFile).toString())
        this.apiKey = data.apiKey
    }


    public async complete(prompt: string, size: number = 128, merge: boolean = true): Promise<string> {
        const trimmedMessage = prompt.trim()
        const completeData = await fetch("https://api.openai.com/v1/engines/text-davinci-002/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                prompt: trimmedMessage,
                max_tokens: size,
                temperature: 0.9,

            })
        })


        const completeJson = await completeData.json()

        if (merge) {
            return trimmedMessage + completeJson.choices[0].text
        }
        else {
            return completeJson.choices[0].text
        }
    }
}

const manager = new OpenAiManager("./data/_Secrets/openai.json")

export default manager
