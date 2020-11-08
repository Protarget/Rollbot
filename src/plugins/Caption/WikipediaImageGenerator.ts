import fetch from "node-fetch"

export default class WikipediaImageGenerator {
    public async getRandomImageUrl(): Promise<string> {
        const imageData = await fetch("https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&prop=imageinfo&iiprop=url&format=json")
        const imageDataJson = await imageData.json()
        const pages = imageDataJson.query.pages
        const key = Object.keys(pages)[0]
        if (key) {
            const title: string = pages[key].title.toLowerCase()
            const supportedFileTypes = ["png", "jpg", "jpeg", "gif"]
            return supportedFileTypes.some(ext => title.endsWith(ext)) ? pages[key].imageinfo[0].url : this.getRandomImageUrl()
        }
        else {
            throw new Error("Unable to extract image key")
        }
    }

    public async getTopicImageUrl(topic: string): Promise<string> {
        const imageSearch = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch="${encodeURIComponent(topic.replace("\"", ""))}"&srnamespace=6&srlimit=100&format=json`)
        const imageSearchJson = await imageSearch.json()
        const results = imageSearchJson.query.search as any[]
        const supportedFileTypes = [".png", ".jpg", ".jpeg", ".gif"]
        const validResults = results.filter(x => supportedFileTypes.some(t => x.title.toLowerCase().endsWith(t)))
        if (validResults.length === 0) {
            throw new Error("Unable to extract image key")
        }
        const title = validResults[Math.floor(Math.random() * validResults.length)].title
        const imageInfo = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`)
        const imageInfoJson = await imageInfo.json()
        const key = Object.keys(imageInfoJson.query.pages)[0]
        return imageInfoJson.query.pages[key].imageinfo[0].url
    }
}
