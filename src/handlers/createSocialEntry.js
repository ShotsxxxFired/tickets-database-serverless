import { create } from "../utils/create.js"

module.exports.handler = async (event) => {
    console.log(event.body)
    const { eventID, walletID, socialID } = JSON.parse(event.body)

    const pk = `SE#${eventID.split("#")[1]}`
    const sk = `SE#${walletID}`
    const tableName = process.env.TABLE_NAME
    const item = { PK: pk, SK: sk, SocialID: socialID.split("#")[1] }
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