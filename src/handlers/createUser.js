import { create } from "../utils/create.js"

module.exports.handler = async (event) => {
    const { walletID } = JSON.parse(event.body)
    const userID = "USER#" + walletID
    const tableName = process.env.TABLE_NAME
    let role = "user"
    if (walletID == "0xd667AAE67aCf222Ac7cAc6796F53b20510999B6c" || walletID == "0x9489Ab6172D59cc4bCFcFA277922d1D39AE1e5A9" || walletID == "0xd667AAE67aCf222Ac7cAc6796F53b20510999B6c") {
        role = "admin"
    }
    const item = { PK: userID, SK: userID, FixedBaseTickets: 0, FixedBaseMulti: 0, Role: role, Blacklist: false }
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