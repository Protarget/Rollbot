import * as fs from "fs"
import fetch from "node-fetch"
import * as pos from "pos"
import Bot from "../../Bot"
import Clarifai from "../../utils/ClarifaiManager"
import Image, {ImageFont, rgb, rgba} from "../../utils/Image"
import CommandPlugin from "../CommandPlugin"
import CaptionGenerator from "./CaptionGenerator"
import WikipediaImageGenerator from "./WikipediaImageGenerator"

export default class Caption extends CommandPlugin {
    private captionGenerator: CaptionGenerator
    private wikipediaImageGenerator: WikipediaImageGenerator

    public constructor(filename: string, ignoreTags: string[], replaceMap: Array<[string, string]>){
        super()
        this.register("!caption", this.caption.bind(this))
        this.captionGenerator = new CaptionGenerator(filename, ignoreTags, replaceMap)
        this.wikipediaImageGenerator = new WikipediaImageGenerator()
    }

    private async caption(from: string, args: string[], argString: string): Promise<void> {
        try {
            const arg = argString.trim()
            let imageUrl: string
            if (arg.length === 0) {
                imageUrl = await this.wikipediaImageGenerator.getRandomImageUrl()
            }
            else if (arg.match(/^https\:\/\//)) {
                imageUrl = arg
            }
            else {
                imageUrl = await this.wikipediaImageGenerator.getTopicImageUrl(arg)
            }
            const caption = await this.captionGenerator.generateCaption(imageUrl, false)
            const image = await Image.fromUrl(imageUrl)
            image.rescaleToFit(1024).setFont(new ImageFont("Rollbot Sans", 20)).setStrokeColor(rgb(0, 0, 0)).setFillColor(rgb(255, 255, 0)).setStrokeWidth(3).caption(caption)
            this.bot.sayToAll(await image.upload())
        }
        catch (e) {
            console.error(e)
            this.bot.sayToAll("Error fetching image")
        }
    }
}
