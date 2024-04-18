import { create } from "../utils/create.js"

module.exports.handler = async (event) => {
    console.log(event.body)
    const { wallet } = JSON.parse(event.body)
    const userID = "USER#" + wallet
    const tableName = process.env.TABLE_NAME
    const item = { PK: userID, SK: userID }
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