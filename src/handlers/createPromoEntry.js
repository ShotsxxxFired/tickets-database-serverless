import { create } from "../utils/create.js"
import { ulid } from 'ulid'

module.exports.handler = async (event) => {
    console.log(event.body)
    const { eventID, walletID, codes } = JSON.parse(event.body)

    const pk = `PE#${eventID.split("#")[1]}`
    const sk = `PE#${walletID}`
    const tableName = process.env.TABLE_NAME
    const item = { PK: pk, SK: sk, Codes: codes }
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