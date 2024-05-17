import { create } from "../utils/create.js"

module.exports.handler = async (event) => {
    const { eventID, walletID, fixedTickets, fixedMulti, holdingTickets, holdingMulti, totalTickets } = JSON.parse(event.body)

    const pk = `ENTRY#${eventID.split("#")[1]}`
    const sk = `USER#${walletID}`
    const tableName = process.env.TABLE_NAME
    const item = { PK: pk, SK: sk, FixedTickets: Number(fixedTickets), FixedMulti: Number(fixedMulti), HoldingTickets: Number(holdingTickets), HoldingMulti: Number(holdingMulti), SocialTickets: 0, SocialMulti: 0, PromoTickets: 0, PromoMulti: 0, TotalTickets: Number(totalTickets) }
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