import { update } from "../utils/update.js"
import { getClient } from "../utils/client.js"
import { create } from "../utils/create.js"
import { ulid } from 'ulid'

module.exports.handler = async (event) => {
    console.log(event.body)
    const { PK, SK, updateItems } = JSON.parse(event.body)

    const pk = PK
    const sk = SK

    const tableNameEvent = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }
    console.log(key)
    console.log(updateItems)

    const tableNameDraw = process.env.DRAW_TABLE_NAME
    const condExpress = "attribute_not_exists(PK)"
    let resDraw = {}

    const resEvent = await update(tableNameEvent, key, updateItems)

    if (pk.includes("EVENT#") && sk.includes("EVENT#")) {
        for (let item of updateItems) {
            if (item.name == "EndDate") {
                const pkDraw = `DRAW#`
                const skDraw = `DRAW#${ulid()}`
                const itemDraw = { PK: pkDraw, SK: skDraw, EndDate: item.value, EventID: sk.split("#")[1], EventPK: pk, EventSK: sk }
                resDraw = await create(tableNameDraw, itemDraw, condExpress)
                console.log(resDraw)
            }
        }
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            resEvent
        })
    }
    return response
}