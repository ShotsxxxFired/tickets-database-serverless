import { query } from "../utils/query.js"

module.exports.handler = async (event) => {
    const { year } = event.pathParameters

    const pk = `SOCIAL#${year}`

    const tableName = process.env.TABLE_NAME
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }

    const res = await query(tableName, keyExpression, attValues)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}