import { query } from "../utils/query.js"
import { queryPage } from "../utils/queryPage.js"

module.exports.handler = async (event) => {
    let { eventID } = event.pathParameters

    if (eventID.includes("#")) {
        eventID = eventID.split("#")[1]
    }
    const pk = `ENTRY#${eventID}`
    const tableName = process.env.TABLE_NAME
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }
    let ExclusiveStartKey = ""
    console.log(tableName)
    console.log(keyExpression)
    console.log(attValues)
    let Items = []
    let res = await query(tableName, keyExpression, attValues)
    Items = Items.concat(res.Items)
    if (res.LastEvaluatedKey) {
        ExclusiveStartKey = res.LastEvaluatedKey
    }
    while (res.LastEvaluatedKey) {
        pageCount++
        res = await queryPage(tableName, keyExpression, attValues, ExclusiveStartKey)
        if (res.LastEvaluatedKey) {
            ExclusiveStartKey = res.LastEvaluatedKey
        }
        Items = Items.concat(res.Items)
    }
    res.Items = Items

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}