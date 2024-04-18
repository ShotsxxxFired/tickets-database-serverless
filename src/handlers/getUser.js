import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    const { walletID } = event.pathParameters
    const userID = "USER#" + walletID
    const tableName = process.env.TABLE_NAME
    const key = { PK: userID, SK: userID }

    const res = await get(tableName, key)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}