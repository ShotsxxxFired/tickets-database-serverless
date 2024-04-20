import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"
import { getClient } from "../utils/client.js"
import { decodeTime } from 'ulid'

module.exports.handler = async (event) => {
    try {
        const { eventID, walletID, fixedTickets, fixedMulti, holdingTickets, holdingMulti, totalTickets } = JSON.parse(event.body)
        //const { } = event.pathParameters

        const client = await getClient()

        const pkEntry = `ENTRY#${eventID.split("#")[1]}`
        const skEntry = `USER#${walletID}`

        const time = decodeTime(id)

        const year = new Date(time).getFullYear().toString()
        const month = new Date(time).getMonth().toString()
        let yearMonth = year + month.padStart(2, "0")

        const pkEvent = `EVENT#${yearMonth}`
        const skEvent = eventID
        const keyEvent = { PK: pkEvent, SK: skEvent }

        const tableName = process.env.TABLE_NAME
        const condExpress = "attribute_not_exists(PK)"
        const entryItem = { PK: pkEntry, SK: skEntry, FixedTickets: fixedTickets, FixedMulti: fixedMulti, HoldingTickets: holdingTickets, HoldingMulti: holdingMulti, TotalTickets: totalTickets }
        const input = {
            TransactItems: [{
                Put: {
                    TableName: tableName,
                    Item: entryItem,
                    ConditionExpression: condExpress,
                    ReturnValuesOnConditionCheckFailure: "ALL_OLD" || "NONE",
                },
                Update: {
                    TableName: tableName,
                    Key: keyEvent,
                    UpdateExpression: `set Entries = Entries + :inc`,
                    ExpressionAttributeValues: {
                        ":inc": 1
                    },
                    ReturnValues: "ALL_NEW",
                }
            }
            ]
        }

        const command = new TransactWriteItemsCommand(input)
        const res = client.send(command)
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                res
            })
        }
        return response
    } catch (error) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({
                error
            })
        }

        return response
    }

}