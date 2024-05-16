import { deleteItem } from "../utils/delete.js"

module.exports.handler = async (event) => {
    const { PK, SK } = JSON.parse(event.body)
    const pk = PK
    const sk = SK

    const tableName = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }

    const res = await deleteItem(tableName, key)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}