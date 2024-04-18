import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    const { eventID, code } = event.pathParameters
    const pk = `PROMO#${eventID.split("#")[1]}`
    const sk = `PROMO#${code}`

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