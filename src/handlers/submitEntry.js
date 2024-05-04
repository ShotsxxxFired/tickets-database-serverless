import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"
import { getClient } from "../utils/client.js"
import { decodeTime } from 'ulid'

module.exports.handler = async (event) => {
    try {
        const { eventID, walletID, fixedTickets, fixedMulti, holdingTickets, holdingMulti } = JSON.parse(event.body)
        console.log(event.body)
        const client = await getClient()

        const pkEntry = `ENTRY#${eventID}`
        const skEntry = `USER#${walletID}`

        const time = decodeTime(eventID)
        console.log(time)
        const year = new Date(time).getFullYear().toString()
        const month = new Date(time).getMonth().toString()
        let yearMonth = year + month.padStart(2, "0")

        const pkEvent = `EVENT#${yearMonth}`
        const skEvent = `EVENT#${eventID}`
        const keyEvent = { PK: { "S": pkEvent }, SK: { "S": skEvent } }

        const tableName = process.env.TABLE_NAME
        const condExpress = "attribute_not_exists(PK)"
        const entryItem = {
            PK: { "S": pkEntry },
            SK: { "S": skEntry },
            FixedTickets: { "N": fixedTickets.toString() },
            FixedMulti: { "N": fixedMulti.toString() },
            HoldingTickets: { "N": holdingTickets.toString() },
            HoldingMulti: { "N": holdingMulti.toString() },
            TotalTickets: { "N": "0" },
            SocialTickets: { "N": "0" },
            SocialMulti: { "N": "0" },
            PromoTickets: { "N": "0" },
            PromoMulti: { "N": "0" },
        }
        const input = {
            TransactItems: [
                {
                    Put: {
                        TableName: tableName,
                        Item: entryItem,
                        ConditionExpression: condExpress,
                    }
                }
                ,
                {
                    Update: {
                        TableName: tableName,
                        Key: keyEvent,
                        UpdateExpression: `set Entries = Entries + :inc`,
                        ExpressionAttributeValues: {
                            ":inc": { "N": "1" }
                        },
                        ReturnValues: "ALL_NEW",
                    }
                }
            ]
        }

        const command = new TransactWriteItemsCommand(input)
        const res = await client.send(command)
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                res
            })
        }
        return response
    } catch (error) {
        console.log(error)
        const response = {
            statusCode: 400,
            body: JSON.stringify({
                error
            })
        }

        return response
    }

}