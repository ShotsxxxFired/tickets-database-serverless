import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"
import { getClient } from "../utils/client.js"
import { decodeTime } from 'ulid'

module.exports.handler = async (event) => {
    try {
        const { eventID, walletID, socialID, socialTickets, socialMulti } = JSON.parse(event.body)
        //const { } = event.pathParameters

        const client = await getClient()

        const pkSocialEntry = `SE#${eventID.split("#")[1]}`
        const skSocialEntry = `SE#${walletID}`

        const year = new Date(decodeTime(socialID.split("#")[1])).getFullYear().toString()
        const pkSocial = `SOCIAL#${year}`
        const skSocial = socialID

        const keySocial = { PK: { "S": pkSocial }, SK: { "S": skSocial } }

        const pkEntry = `ENTRY#${eventID.split("#")[1]}`
        const skEntry = `USER#${walletID}`

        const keyEntry = { PK: { "S": pkEntry }, SK: { "S": skEntry } }

        const tableName = process.env.TABLE_NAME
        const condExpress = "attribute_not_exists(PK)"
        const socialEntryItem = { PK: { "S": pkSocialEntry }, SK: { "S": skSocialEntry }, SocialID: { "S": socialID.split("#")[1] } }
        const input = {
            TransactItems: [
                {
                    Put: {
                        TableName: tableName,
                        Item: socialEntryItem,
                        ConditionExpression: condExpress,
                    }
                },
                {
                    Update: {
                        TableName: tableName,
                        Key: keySocial,
                        UpdateExpression: `set RedeemedCount = RedeemedCount + :inc`,
                        ExpressionAttributeValues: {
                            ":inc": { "N": "1" }
                        },
                        ReturnValues: "ALL_NEW",
                    }
                },
                {
                    Update: {
                        TableName: tableName,
                        Key: keyEntry,
                        UpdateExpression: `set SocialTickets = :tickets, SocialMulti = :ticketMulti`,
                        ExpressionAttributeValues: {
                            ":tickets": { "N": socialTickets.toString() },
                            ":ticketMulti": { "N": socialMulti.toString() }
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
        const response = {
            statusCode: 400,
            body: JSON.stringify({
                error
            })
        }

        return response
    }

}