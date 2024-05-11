import { query } from "../utils/query.js"
import { queryPage } from "../utils/queryPage.js"
import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    const { eventID } = event.pathParameters

    const pk = `ENTRY#${eventID}`

    const tableName = process.env.TABLE_NAME
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }

    const res = await query(tableName, keyExpression, attValues)

    while (res.LastEvaluatedKey) {
        let newRes = await queryPage(tableName, keyExpression, attValues, res.LastEvaluatedKey)
        res.Items.concat(newRes.Items)
        res.LastEvaluatedKey = newRes.LastEvaluatedKey
    }

    for (let entry of res.Items) {
        const userID = "USER#" + entry.SK.split("#")[1]
        const userKey = { PK: userID, SK: userID }
        let data = await get(tableName, userKey)
        console.log(data)
        if (data.Item) {
            entry.Nickname = data.Item.Nickname
        } else {
            entry.Nickname = ""
        }
    }
    console.log(res)
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}