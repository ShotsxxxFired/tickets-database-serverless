import { query } from "../utils/query.js"
import { queryPage } from "../utils/queryPage.js"

module.exports.handler = async (event) => {
    const { eventID } = event.pathParameters

    const pk = `ENTRY#${eventID}`

    const tableName = process.env.TABLE_NAME
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }

    const res = await query(tableName, keyExpression, attValues)

    while (res.LastEvaluatedKey != null) {
        let newRes = await queryPage(tableName, keyExpression, attValues, res.LastEvaluatedKey)
        res.items.concat(newRes.items)
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}