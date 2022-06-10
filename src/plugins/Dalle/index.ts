import Image from "../../utils/Image"
import CommandPlugin from "../CommandPlugin"
import fetch, { Response } from "node-fetch"

export default class Dalle extends CommandPlugin {
    private static RETRY_COUNT = 5
    private static RETRY_BACKOFF_INITIAL = 1000
    private static RETRY_BACKOFF_MULTIPLIER = 2
    private fetching: boolean = false

    public constructor() {
        super()
        this.register("!dalle", this.dalle.bind(this))
    }

    private async dalle(from: string, args: string[]): Promise<void> {
        if (this.fetching) {
            this.bot.sayToAll("A Dall-E Mini request is already in progress")
        }
        this.fetching = true
        try {
            const prompt = args.join(" ")
            const data = await this.fetchData(args.join(" "))
            const image = await this.generateImage(data)
            const url = await image.upload()
            this.bot.sayToAll("Finished fetching Dall-E Mini images for prompt: " + prompt)
            this.bot.sayToAll(url)
        }
        catch (e) {
            this.bot.sayToAll("Failed to fetch Dall-E Mini images")
        }
        this.fetching = false
    }

    private async fetchData(prompt: string): Promise<string[]> {
        const response = await this.fetchResponseRetrying(prompt)
        const json = await response.json()
        return json.images
    }

    private async fetchResponseRetrying(prompt: string): Promise<Response> {
        let currentRetryMillis = Dalle.RETRY_BACKOFF_INITIAL
        const body = JSON.stringify({prompt})
        const url = "https://bf.dallemini.ai/generate"

        for (let attempt = 0; attempt < Dalle.RETRY_COUNT; attempt++) {
            const headers = {
                "Content-Type": "application/json",
                "Content-Length": body.length.toString()
            }
            
            const response = await fetch(url, {method: "POST", body, headers })
            if (response.ok) {
                return response
            }
            else if (attempt < Dalle.RETRY_COUNT - 1) {
                await this.wait(currentRetryMillis)
                currentRetryMillis *= Dalle.RETRY_BACKOFF_MULTIPLIER
            }
        }

        throw new Error(`Unable to fetch JSON after ${Dalle.RETRY_COUNT} retries`)
    }

    private async generateImage(imageData: string[]): Promise<Image> {
        const imageWidth = 256
        const imageHeight = 256
        const images = await Promise.all(imageData.map(x => Image.fromBase64("image/png", x)))

        const totalColumns = Math.min(images.length, 3)
        const totalRows = Math.ceil(images.length / 3)

        const totalWidth = totalColumns * imageWidth;
        const totalHeight = totalRows * imageHeight;

        const finalImage = new Image(totalWidth, totalHeight)

        for (let index = 0; index < images.length; index++) {
            const x = index % 3 * imageWidth;
            const y = Math.floor(index / 3) * imageHeight;
            finalImage.composite(images[index], x, y, imageWidth, imageHeight)
        }

        return finalImage
    }

    private wait(t: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, t))
    }
}
