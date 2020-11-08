import * as fs from "fs"
import * as pos from "pos"
import Clarifai from "../../utils/ClarifaiManager"

export default class CaptionGenerator {
    private readonly ignoreTags: string[]
    private tagger: any = null
    private lines: string[] = []
    private replaceMap: Array<[string, string[]]> = []

    public constructor(filename: string, ignoreTags: string[], replaceMap: Array<[string, string]>){
        this.tagger = new pos.Tagger()
        this.lines = fs.readFileSync(filename, "utf-8").split("\n")
        this.ignoreTags = ignoreTags
        for (const [text, file] of replaceMap) {
            this.replaceMap.push([text, fs.readFileSync(file).toString().split("\n")])
        }
    }

    public async generateCaption(url: string, forceReplacements: boolean = true): Promise<string> {
        const imageTags = (await Clarifai.getImageTags(url)).map(tag => this.tagger.tag([tag])[0] as [string, string])
        const filteredTags = imageTags.filter(x => this.ignoreTags.every(t => x[1].toLowerCase() !== t))
        if (filteredTags.length === 0) {
            throw new Error("No image tags")
        }
        let result = await this.generateCaptionWithTags(filteredTags, forceReplacements)
        for (const entry of this.replaceMap) {
            result = result.replace(entry[0], entry[1][Math.floor(Math.random() * entry[1].length)])
        }
        return result
    }

    private async generateCaptionWithTags(imageTags: Array<[string, string]>, forceReplacements: boolean, depth: number = 0): Promise<string> {
        if (depth > 100) {
            throw new Error("Unable to resolve image tags to depth 100")
        }
        const baseCaption = this.lines[Math.floor(Math.random() * this.lines.length)]
        const baseCaptionTags = this.tagger.tag(baseCaption.split(/\s+/).filter(x => x.length > 0)) as Array<[string, string]>
        const imageWordsByTag: {[key: string]: string[]} = {}

        for (const tag of imageTags) {
            imageWordsByTag[tag[1]] = imageWordsByTag[tag[1]] || ([] as string[])
            imageWordsByTag[tag[1]].push(tag[0])
        }

        const possibleReplacements: Array<() => void> = []

        for (let wordIndex = 0; wordIndex < baseCaptionTags.length; wordIndex++) {
            const tag = (baseCaptionTags[wordIndex][1])
            const word = (baseCaptionTags[wordIndex][0])
            if (imageWordsByTag[tag] && imageWordsByTag[tag].length > 0) {
                possibleReplacements.push(() => baseCaptionTags[wordIndex] = [imageWordsByTag[tag][Math.floor(Math.random() * imageWordsByTag[tag].length)], tag])
            }
        }

        if (possibleReplacements.length === 0 && forceReplacements) {
            return this.generateCaptionWithTags(imageTags, forceReplacements, depth + 1)
        }
        else {
            const replacements = forceReplacements
                ? (1 + Math.floor(Math.random() * possibleReplacements.length))
                : (Math.floor(Math.random() * possibleReplacements.length + 1))
            shuffle(possibleReplacements).slice(0, replacements).forEach(r => r())
            return baseCaptionTags.map(v => v[0]).join(" ")
        }
    }

}

function shuffle<T>(a: T[]): T[] {
    let j: number = 0
    let x: T = null
    let i: number = 0
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        x = a[i]
        a[i] = a[j]
        a[j] = x
    }
    return a
}
