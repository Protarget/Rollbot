import * as fs from "fs"
import * as JSONStream from "JSONStream"

console.log(`Processing: ${process.argv[2]}`)
fs.createReadStream(`${process.argv[2]}`).pipe(JSONStream.parse("Data.*")).on("data", (v) => {
    const question = v.Question
    const mainAnswer = v.Answer.Value
    const aliases = v.Answer.Aliases.join("~")
    console.log(`${question}~${mainAnswer}~${aliases}`)
})
