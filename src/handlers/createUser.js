import { create } from "../utils/create.js"

module.exports.handler = async (event) => {
    console.log(event.body)
    const { walletID } = JSON.parse(event.body)
    console.log(event)
    const userID = "USER#" + walletID
    const tableName = process.env.TABLE_NAME
    const item = { PK: userID, SK: userID, FixedBaseTickets: fixedBaseTickets, FixedBaseMulti: fixedBaseMulti, Role: role }
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