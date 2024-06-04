import { create } from "../utils/create.js"
import { ulid, decodeTime } from 'ulid'

module.exports.handler = async (event) => {
    const { active, type, post, ticketsBase, ticketsMulti, redeemedCount } = JSON.parse(event.body)
    const id = ulid()

    const year = new Date(decodeTime(id)).getFullYear().toString()

    const pk = `SOCIAL#${year}`
    const sk = `SOCIAL#${id}`

    const tableName = process.env.TABLE_NAME
    const item = { PK: pk, SK: sk, Active: active, Type: type, Post: post, TicketsBase: ticketsBase, TicketsMulti: ticketsMulti, RedeemedCount: 0 }
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