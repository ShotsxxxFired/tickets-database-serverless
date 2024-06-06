import { create } from "../utils/create.js"
import { ulid } from 'ulid'

module.exports.handler = async (event) => {
    console.log(event.body)
    const { eventID, code, ticketsBase, ticketsMulti, available, redeemedCount, deadline } = JSON.parse(event.body)
    console.log(event.body)
    const pk = `PROMO#${eventID.split("#")[1]}`
    const sk = `PROMO#${code}`
    const tableName = process.env.TABLE_NAME
    const item = { PK: pk, SK: sk, TicketsBase: Number(ticketsBase), TicketsMulti: Number(ticketsMulti), Available: Number(available), RedeemedCount: 0, Deadline: deadline }
    const condExpress = "attribute_not_exists(PK)"

    const res = await create(tableName, item, condExpress)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}