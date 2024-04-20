import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"
import { getClient } from "../utils/client.js"

module.exports.handler = async (event) => {
    try {
        const { eventID, walletID, code, promoTickets, promoMulti } = JSON.parse(event.body)
        //const { } = event.pathParameters

        const client = await getClient()
        let codes = [code]

        const pkPromoEntry = `PE#${eventID.split("#")[1]}`
        const skPromoEntry = `PE#${walletID}`

        const pkPromo = `PROMO#${eventID.split("#")[1]}`
        const skPromo = `PROMO#${code}`

        const keyPromo = { PK: pkPromo, SK: skPromo }

        const pkEntry = `ENTRY#${eventID.split("#")[1]}`
        const skEntry = `USER#${walletID}`

        const keyEntry = { PK: pkEntry, SK: skEntry }

        const tableName = process.env.TABLE_NAME
        const condExpress = "attribute_not_exists(PK)"
        const promoEntryItem = { PK: pkPromoEntry, SK: skPromoEntry, Codes: codes }
        const input = {
            TransactItems: [
                {
                    Put: {
                        TableName: tableName,
                        Item: promoEntryItem,
                        ConditionExpression: condExpress,
                        ReturnValuesOnConditionCheckFailure: "ALL_OLD" || "NONE",
                    }
                },
                {
                    Update: {
                        TableName: tableName,
                        Key: keyPromo,
                        UpdateExpression: `set RedeemedCount = RedeemedCount + :inc, Available = Available - :inc`,
                        ConditionExpression: "Available > :val",
                        ExpressionAttributeValues: {
                            ":inc": 1,
                            ":val": 0
                        },
                        ReturnValues: "ALL_NEW",
                    }
                },
                {
                    Update: {
                        TableName: tableName,
                        Key: keyEntry,
                        UpdateExpression: `set PromoTickets = PromoTickets + :tickets, PromoMulti = PromoMulti + :multi`,
                        ExpressionAttributeValues: {
                            ":tickets": Number(promoTickets),
                            ":multi": Number(promoMulti)
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