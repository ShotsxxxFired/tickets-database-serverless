import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    const { contractAddress } = event.pathParameters
    const pk = `CONTRACT#`
    const sk = `CONTRACT#${contractAddress}`

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