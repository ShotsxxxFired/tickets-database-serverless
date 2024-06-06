import { create } from "../utils/create.js"
import { ulid, decodeTime } from 'ulid'

module.exports.handler = async (event) => {
    console.log(event.body)
    const { startDate, endDate, title, description, eventImageUrl, numWinners } = JSON.parse(event.body)

    const id = ulid()
    const time = decodeTime(id)

    const year = new Date(time).getFullYear().toString()
    const month = new Date(time).getMonth().toString()
    let yearMonth = year + month.padStart(2, "0")

    const pk = `EVENT#${yearMonth}`
    const sk = `EVENT#${id}`
    const tableName = process.env.TABLE_NAME
    const item = { PK: pk, SK: sk, StartDate: startDate, EndDate: endDate, Title: title, Description: description, EventImageURL: eventImageUrl, Entries: 0, NumberWinners: Number(numWinners), Winners: [""] }
    const condExpress = "attribute_not_exists(PK)"

    const res = await create(tableName, item, condExpress)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}