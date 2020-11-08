import * as Clarifai from "clarifai"
import * as fs from "fs"

class ClarifaiManager {
    private clarifaiApp: any = null

    public constructor(secretFile: string) {
        const data = JSON.parse(fs.readFileSync(secretFile).toString())
        this.clarifaiApp = new Clarifai.App({
            apiKey: data.apiKey
        })
    }

    public async getImageTags(url: string): Promise<string[]> {
        const response = await this.clarifaiApp.models.predict(Clarifai.GENERAL_MODEL, url)
        const tags = response.outputs[0].data.concepts.map(c => c.name)
        return tags
    }
}

const manager = new ClarifaiManager("./data/_Secrets/clarifai.json")

export default manager
