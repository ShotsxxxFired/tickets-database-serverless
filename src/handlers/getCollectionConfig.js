import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    const { contractAddress, collectionID } = event.pathParameters
    const pk = "CONTRACT#" + contractAddress
    const sk = collectionID

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