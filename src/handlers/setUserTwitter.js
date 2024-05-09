import { update } from "../utils/update.js"

module.exports.handler = async (event) => {
    console.log("Setting user's twitter")
    const { walletID, twitter } = JSON.parse(event.body)
    const pk = "USER#" + walletID
    const sk = "USER#" + walletID
    let updateItems = [{ name: "Twitter", value: twitter }]

    const tableName = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }

    const res = await update(tableName, key, updateItems)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}