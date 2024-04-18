import { get } from "../utils/get.js"
import { decodeTime } from "ulid"

module.exports.handler = async (event) => {
    const { eventID } = event.pathParameters

    const time = decodeTime(id)

    const year = new Date(time).getFullYear().toString()
    const month = new Date(time).getMonth().toString()
    let yearMonth = year + month.padStart(2, "0")

    const pk = `EVENT#${yearMonth}`
    const sk = eventID

    const tableName = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }

    const res = await get(tableName, key)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}