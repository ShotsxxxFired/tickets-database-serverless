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

        const keySocial = { PK: pkSocial, SK: skSocial }

        const pkEntry = `ENTRY#${eventID.split("#")[1]}`
        const skEntry = `USER#${walletID}`

        const keyEntry = { PK: pkEntry, SK: skEntry }

        const tableName = process.env.TABLE_NAME
        const condExpress = "attribute_not_exists(PK)"
        const socialEntryItem = { PK: pkSocialEntry, SK: skSocialEntry, SocialID: socialID.split("#")[1] }
        const input = {
            TransactItems: [
                {
                    Put: {
                        TableName: tableName,
                        Item: socialEntryItem,
                        ConditionExpression: condExpress,
                        ReturnValuesOnConditionCheckFailure: "ALL_OLD" || "NONE",
                    }
                },
                {
                    Update: {
                        TableName: tableName,
                        Key: keySocial,
                        UpdateExpression: `set RedeemedCount = RedeemedCount + :inc`,
                        ExpressionAttributeValues: {
                            ":inc": 1
                        },
                        ReturnValues: "ALL_NEW",
                    }
                },
                {
                    Update: {
                        TableName: tableName,
                        Key: keyEntry,
                        UpdateExpression: `set SocialTickets = :tickets, SocialMulti = multi`,
                        ExpressionAttributeValues: {
                            ":tickets": Number(socialTickets),
                            ":multi": Number(socialMulti)
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