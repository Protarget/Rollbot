import Image from "../../utils/Image"
import CommandPlugin from "../CommandPlugin"

export default class Cat extends CommandPlugin {
    public constructor() {
        super()
        this.register("!cat", this.face.bind(this))
    }

    private async face(from: string, args: string[]): Promise<void> {
        const image = await Image.fromUrl("https://thiscatdoesnotexist.com/")
        const url = await image.upload()
        this.bot.sayToAll(url)
    }
}
