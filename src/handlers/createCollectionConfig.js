import { create } from "../utils/create.js"
import { ulid } from 'ulid'

module.exports.handler = async (event) => {
    const { contractAddress, type, traitType, traitValue, quantMin, quantMax, ticketsBase, ticketsMulti, listed } = JSON.parse(event.body)

    const pk = `COLLECTION#${contractAddress}`
    const sk = `COLLECTION#${ulid()}`
    const tableName = process.env.TABLE_NAME
    const item = { PK: pk, SK: sk, Type: type, TraitType: traitType, TraitValue: traitValue, QuantMin: Number(quantMin), QuantMax: Number(quantMax), TicketsBase: Number(ticketsBase), TicketsMulti: Number(ticketsMulti), Listed: listed }
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