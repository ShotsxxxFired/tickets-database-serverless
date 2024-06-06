import { update } from "../utils/update.js"

module.exports.handler = async (event) => {
    console.log(event.body)
    const { PK, SK, updateItems } = JSON.parse(event.body)
    const pk = PK
    const sk = SK

    const tableName = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }

    const res = await update(tableName, key, updateItems)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}