import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    const { socialID } = event.pathParameters

    const year = new Date(decodeTime(socialID.split("#")[1])).getFullYear().toString()

    const pk = `SOCIAL#${year}`
    const sk = socialID
    console.log("test")

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