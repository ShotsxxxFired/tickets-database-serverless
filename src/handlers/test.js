import { create } from "../utils/create.js"
import 'dotenv/config'

async function test(event) {
    //const { wallet } = JSON.parse(event.body)
    const wallet = "test2"
    const userID = "USER#" + wallet
    const tableName = "dynamodb-tickets-dev-TicketsTable-1GF3544F0FDXQ"
    const item = { PK: userID, SK: userID }
    const condExpress = "attribute_not_exists(PK)"
    console.log(userID)
    const res = await create(tableName, item, condExpress)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}

console.log(test({ body: { wallet: "test" } }))