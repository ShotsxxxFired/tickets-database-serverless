import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    const { eventID, walletID } = event.pathParameters

    const pk = `ENTRY#${eventID.split("#")[1]}`
    const sk = `USER#${walletID}`

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