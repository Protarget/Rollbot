import TimedCache from "./TimedCache"

interface TextMashupTableEntry {
    sentenceIndex: number // The index of the sentence containing the word in the table
    wordIndex: number // The position in the sentence that the word starts at
}

type KeyFunction = (word: string) => string
type WordFilterFunction = (sentence: string, word: string, startIndex: number, endIndex: number) => boolean

const defaultKeyFn = x => x.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
const defaultWordFilter = (sentence, word, start, end) => !((start / sentence.length) < 0.2 || (end / sentence.length) > 0.8)

export default class TextMashupTable {
    private sentences: string[]
    private entries: {[key: string]: TextMashupTableEntry[]} = {}

    public constructor(sentences: string[], keyFn: KeyFunction = defaultKeyFn, wordFilter: WordFilterFunction = defaultWordFilter) {
        this.sentences = sentences
        const l = this.sentences.length
        for (let sentenceIndex = 0; sentenceIndex < l; sentenceIndex++) {
            const sentence = this.sentences[sentenceIndex]
            const words = getWordIndices(this.sentences[sentenceIndex]).filter(w => wordFilter(sentence, w[0], w[1], w[2]))
            for (const word of words) {
                const key = keyFn(word[0])
                if (!this.entries[key]) {
                    this.entries[key] = []
                }
                this.entries[key].push({sentenceIndex, wordIndex: word[1]})
            }
        }
    }

    public mashup(other: TextMashupTable): string | null {
        const sharedKeys = Object.keys(this.entries).filter(k => other.entries[k])
        if (sharedKeys.length > 0) {
            const chosenKey = sample(sharedKeys)
            const firstPart = sample(this.entries[chosenKey])
            const secondPart = sample(other.entries[chosenKey])
            if (Math.random() < 0.5) {
                return this.sentences[firstPart.sentenceIndex].substring(0, firstPart.wordIndex) + other.sentences[secondPart.sentenceIndex].substring(secondPart.wordIndex)
            }
            else {
                return other.sentences[secondPart.sentenceIndex].substring(0, secondPart.wordIndex) + this.sentences[firstPart.sentenceIndex].substring(firstPart.wordIndex)
            }
        }
        else {
            return null
        }

    }

}

function sample<T>(v: T[]): T {
    return v[Math.floor(Math.random() * v.length)]
}

function getWordIndices(text: string): Array<[string, number, number]> {
    let currentIndex = 0
    let wordIndex = 0
    let readingWord = false
    const results = []
    for (const c of text) {
        const whitespace = /\s/.test(c)
        if (readingWord && whitespace) {
            results.push([text.substring(wordIndex, currentIndex), wordIndex, currentIndex])
            readingWord = false
        }
        else if (!readingWord && !whitespace) {
            wordIndex = currentIndex
            readingWord = true
        }
        currentIndex++
    }
    return results
}
