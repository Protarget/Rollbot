import * as fs from "fs"
import fetch from "node-fetch"

export class ImgurManager {
    private clientId: string = ""

    public constructor(secretFile: string) {
        const data = JSON.parse(fs.readFileSync(secretFile).toString())
        this.clientId = data.clientId
    }

    public async upload(data: Buffer): Promise<string> {
        const uploadRequest = await fetch("https://api.imgur.com/3/image", {
            body: data,
            headers: {
                "Authorization": `Client-ID ${this.clientId}`,
                "Content-Type": "image/png"
            },
            method: "POST"
        })

        if (!uploadRequest.ok) {
            throw new Error(`Error during upload: ${uploadRequest.status}`)
        }
        else {
            const uploadJson = await uploadRequest.json()
            return uploadJson.data.link
        }
    }

}

const manager = new ImgurManager("./data/_Secrets/imgur.json")

export default manager
