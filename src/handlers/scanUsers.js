import { scan } from "../utils/scan.js"

module.exports.handler = async (event) => {
    let items = []
    const tableName = process.env.TABLE_NAME
    const filter = "contains(PK, :user)"
    const expresstionAtt = { ":user": "USER#" }
    let ExclusiveStartKey = ""
    let pageCount = 0

    let res = await scan(tableName, filter, expresstionAtt, ExclusiveStartKey)
    if (res.LastEvaluatedKey) {
        ExclusiveStartKey = res.LastEvaluatedKey
    }
    items = items.concat(res.Items)
    while (res.LastEvaluatedKey) {
        pageCount++
        res = await scan(tableName, filter, expresstionAtt, ExclusiveStartKey)
        console.log(res)
        if (res.LastEvaluatedKey) {
            ExclusiveStartKey = res.LastEvaluatedKey
        }
        items = items.concat(res.Items)
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(
            { Items: items, Count: items.length, PageCount: pageCount })
    }
    return response
}