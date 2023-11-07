import * as fs from "fs"
import fetch from "node-fetch"
import Image from "./Image"

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

    public async image(prompt: string) {
        const trimmedMessage = prompt.trim()
        const completeData = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                "model": "dall-e-3",
                "prompt": trimmedMessage,
                "n":1,
                "size":"1024x1024"
            })
        })

        const completeJson = await completeData.json()

        if (completeJson.error) {
            throw new Error(completeJson.error.message)
        }

        const baseUrl = completeJson.data[0].url

        const image = await Image.fromUrl(baseUrl)

        return [image.upload(), completeJson.data[0].revised_prompt]
    }
}

const manager = new OpenAiManager("./data/_Secrets/openai.json")

export default manager
