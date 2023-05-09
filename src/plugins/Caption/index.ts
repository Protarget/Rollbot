import Clarifai from "../../utils/ClarifaiManager"
import Image, {ImageFont, rgb, rgba} from "../../utils/Image"
import CommandPlugin from "../CommandPlugin"
import WikipediaImageGenerator from "./WikipediaImageGenerator"
import openAi from "../../utils/OpenAiManager"

export default class Caption extends CommandPlugin {
    private wikipediaImageGenerator: WikipediaImageGenerator

    public constructor() {
        super()
        this.register("!caption", this.caption.bind(this))
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
            const caption = await this.generateCaption(imageUrl)
            const image = await Image.fromUrl(imageUrl)
            image.rescaleToFit(1024).setFont(new ImageFont("Rollbot Sans", 20)).setStrokeColor(rgb(0, 0, 0)).setFillColor(rgb(255, 255, 0)).setStrokeWidth(3).caption(caption)
            this.bot.sayToAll(await image.upload())
        }
        catch (e) {
            console.error(e)
            this.bot.sayToAll("Error fetching image")
        }
    }

    private async generateCaption(url: string): Promise<string> {
        try {
            const imageTags = await Clarifai.getImageTags(url)
            const prompt = `Write a wacky, strange, or off-kilter line of dialogue for a video scene described by the following tags: ${imageTags.join(", ")}.`
            const text = await openAi.complete(prompt, Math.floor(32 + Math.random() * 64), false)
            return text
        }
        catch (e) {
            return "[Something Went Wrong]"
        }
    }
}
