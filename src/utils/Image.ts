import * as nodeCanvas from "canvas"
import * as fs from "fs"
import fetch from "node-fetch"
import imgur, { ImgurManager } from "./ImgurManager"

nodeCanvas.registerFont("data/Fonts/Rollbot_Sans.ttf", {family: "Rollbot Sans"})
nodeCanvas.registerFont("data/Fonts/Rollbot_Serif.ttf", {family: "Rollbot Serif"})

interface ImageColor {
    red: number,
    green: number,
    blue: number,
    alpha: number
}

function colorToString(color: ImageColor): string {
    return `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 255}`
}

export function rgba(red: number, green: number, blue: number, alpha: number): ImageColor {
    return {red, green, blue, alpha}
}

export function rgb(red: number, green: number, blue: number): ImageColor {
    return {red, green, blue, alpha: 255}
}

export default class Image {
    public static async fromUrl(location: string): Promise<Image> {
        const data = await fetch(location)
        const buffer = await data.buffer()
        const final = await new Promise<Image>((resolve, reject) => {
            const image = new nodeCanvas.Image()
            image.onload = () => {
                const result = new Image(image.width, image.height)
                result.rawContext.drawImage(image as any, 0, 0)
                resolve(result)
            }
            image.onerror = e => reject(e)
            image.src = buffer
        })
        return final
    }
    
    public static async fromPath(path: string): Promise<Image> {
        const final = await new Promise<Image>((resolve, reject) => {
            const image = new nodeCanvas.Image()
            image.onload = () => {
                const result = new Image(image.width, image.height)
                result.rawContext.drawImage(image as any, 0, 0)
                resolve(result)
            }
            image.onerror = e => reject(e)
            image.src = path
        })
        return final
    }

    public static async fromBase64(mimeType: string, base64: string): Promise<Image> {
        const final = await new Promise<Image>((resolve, reject) => {
            const image = new nodeCanvas.Image()
            image.onload = () => {
                const result = new Image(image.width, image.height)
                result.rawContext.drawImage(image as any, 0, 0)
                resolve(result)
            }
            image.onerror = e => reject(e)
            image.src = `data:${mimeType};base64,${base64}`
        })
        return final
    }

    private internalWidth: number
    private internalHeight: number
    private internalCanvas: any
    private internalContext: CanvasRenderingContext2D
    private internalFont: ImageFont

    public constructor(width: number, height: number) {
        this.internalWidth = width
        this.internalHeight = height
        this.internalCanvas = nodeCanvas.createCanvas(width, height)
        this.internalContext = this.internalCanvas.getContext("2d")
        this.setFont(new ImageFont("Rollbot Sans", 12))
    }

    public filter(fn: (x: number, y: number, c: ImageColor) => ImageColor): Image {
        const data = this.rawContext.getImageData(0, 0, this.width, this.height)
        for (let y = 0; y < data.height; y++) {
            for (let x = 0; x < data.width; x++) {
                const index = (x + y * data.width) * 4
                const r = data.data[index]
                const g = data.data[index + 1]
                const b = data.data[index + 2]
                const a = data.data[index + 3]
                const col = fn(x, y, {red: r, green: g, blue: b, alpha: a})
                data.data[index] = col.red
                data.data[index + 1] = col.green
                data.data[index + 2] = col.blue
                data.data[index + 3] = col.alpha
            }
        }
        this.rawContext.putImageData(data, 0, 0)
        return this
    }

    public background(color: ImageColor): Image {
        const currFill = this.internalCanvas.fillStyle
        this.setFillColor(color)
        this.internalContext.fillRect(0, 0, this.width, this.height)
        this.internalCanvas.fillStyle = currFill
        return this
    }

    public setFont(font: ImageFont): Image {
        this.internalContext.font = font.fontString
        this.internalFont = font
        return this
    }

    public setStrokeColor(color: ImageColor): Image {
        this.internalContext.strokeStyle = colorToString(color)
        return this
    }

    public setFillColor(color: ImageColor): Image {
        this.internalContext.fillStyle = colorToString(color)
        return this
    }

    public setStrokeWidth(width: number): Image {
        this.internalContext.lineWidth = width
        return this
    }

    public composite(image: Image, x: number, y: number, width?: number, height?: number): Image {
        this.internalContext.drawImage(image.internalCanvas, x, y, width || image.width, height || image.height)
        return this
    }
    
    public fillRect(x: number, y: number, width: number, height: number): Image {
        this.internalContext.fillRect(x, y, width, height)
        return this
    }
    
    public fillText(x: number, y: number, text: string): Image {
        this.internalContext.fillText(text, x, y)
        return this
    }
    
    public strokeText(x: number, y: number, text: string): Image {
        this.internalContext.strokeText(text, x, y)
        return this
    }
    
    public textAlign(align: "center" | "end" | "left" | "right" | "start"): Image {
        this.internalContext.textAlign = align
        return this
    }
    
    public textBaseline(baseline: "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top"): Image {
        this.internalContext.textBaseline = baseline
        return this
    }

    public resize(width: number, height: number): Image {
        const data = this.internalCanvas.toBuffer()
        const img = new nodeCanvas.Image()
        img.src = data
        this.internalWidth = width
        this.internalHeight = height
        this.internalCanvas.width = width
        this.internalCanvas.height = height
        this.internalContext.drawImage(img as any, 0, 0, width, height)
        return this
    }

    public rescaleToFit(width: number): Image {
        if (this.width <= width) {
            return this
        }
        else {
            const ratio = width / this.width
            const newWidth = width
            const newHeight = Math.floor(this.height * ratio)
            return this.resize(newWidth, newHeight)
        }
    }

    public caption(text: string, lineHeightModifier: number = 1.4): Image {
        const lines: string[] = []
        let buffer: string[] = []
        for (const word of text.split(/\s+/)) {
            const nextBuffer = buffer.concat([word])
            const nextBufferString = nextBuffer.join(" ")
            if (this.internalContext.measureText(nextBufferString).width > this.width) {
                lines.push(buffer.join(" "))
                buffer = [word]
            }
            else {
                buffer = nextBuffer
            }
        }
        if (buffer.length > 0) {
            lines.push(buffer.join(" "))
        }

        const oldTextBaseline = this.internalContext.textBaseline
        const oldTextAlign = this.internalContext.textAlign
        this.internalContext.textBaseline = "bottom"
        this.internalContext.textAlign = "center"

        let offset = 0
        for (const line of lines.reverse()) {
            this.internalContext.strokeText(line, this.width / 2, this.height - 5 - offset)
            this.internalContext.fillText(line, this.width / 2, this.height - 5 - offset)
            offset += this.internalFont.height * lineHeightModifier
        }

        this.internalContext.textAlign = oldTextAlign
        this.internalContext.textBaseline = oldTextBaseline

        return this
    }

    public save(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, this.internalCanvas.toBuffer(), err => {
                if (err) { reject(err) } else { resolve() }
            })
        })
    }

    public async upload(): Promise<string> {
        if (process.env.IMAGE_UPLOAD_PATH && process.env.IMAGE_UPLOAD_URL) {
            const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
            const filePath = process.env.IMAGE_UPLOAD_PATH.replace("{image}", `${id}.png`)
            const uploadPath = process.env.IMAGE_UPLOAD_URL
            await this.save(filePath)
            return uploadPath.replace("{image}", `${id}.png`)
        }
        else {
            return imgur.upload(this.internalCanvas.toBuffer())
        }

    }

    public get width(): number {
        return this.internalWidth
    }

    public get height(): number {
        return this.internalHeight
    }

    public get rawContext(): CanvasRenderingContext2D {
        return this.internalContext
    }
}

export class ImageFont {
    public readonly height: number
    public readonly fontString: string
    public constructor(family: string, size: number) {
        this.height = size
        this.fontString = `${size}pt "${family}"`
    }
}
