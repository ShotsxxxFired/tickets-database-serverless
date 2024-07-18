import { query } from "../utils/query.js"

module.exports.handler = async (event) => {
    //const { } = event.pathParameters
    //returns all events +/- 6 months from today

    let eventList = []
    const tableName = process.env.TABLE_NAME
    let res = {}
    let offset = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]
    for (let i of offset) {
        let date = new Date(Date.now())
        let eventDate = new Date(date.setMonth(date.getMonth() + i)).getTime()
        let yearMonth = new Date(eventDate).getFullYear().toString() + new Date(eventDate).getMonth().toString().padStart(2, "0")

        let pk = `EVENT#${yearMonth}`
        const keyExpression = "PK = :pk"
        const attValues = { ":pk": pk }
        res = await query(tableName, keyExpression, attValues)

        eventList = eventList.concat(res.Items)
    }
    res.Items = eventList

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}