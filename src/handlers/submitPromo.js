import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"
import { getClient } from "../utils/client.js"
import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    try {
        const { eventID, walletID, code, promoTickets, promoMulti } = JSON.parse(event.body)

        //Configuring this fields needed for the request is consolidated into the loadVariables method.
        const { keyPromo, keyEntry, tableName, condExpress, promoEntryItem, keyPromoEntry } = await loadVairables(eventID, walletID, code, promoTickets, promoMulti)
        // get client
        const client = await getClient()

        //check to see if there is already a promo entry for this event/user
        const { promoEntryExists, codes, codeAlreadyRedeemed } = await peExists(eventID, walletID, code, client)
        //transaction input
        let input = {}

        if (codeAlreadyRedeemed) {
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    error: `User has aleady redeemed the code: ${code} for this event.`
                })
            }
            return response
        }

        //if there is no promo entry, create a new one
        if (!promoEntryExists) {
            input = {
                TransactItems: [
                    {
                        Put: {
                            TableName: tableName,
                            Item: promoEntryItem,
                            ConditionExpression: condExpress,
                        }
                    },
                    {
                        Update: {
                            TableName: tableName,
                            Key: keyPromo,
                            UpdateExpression: `set RedeemedCount = RedeemedCount + :inc, Available = Available - :inc`,
                            ConditionExpression: "Available > :val",
                            ExpressionAttributeValues: {
                                ":inc": { "N": "1" },
                                ":val": { "N": "0" }
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
                                ":tickets": { "N": promoTickets.toString() },
                                ":multi": { "N": promoMulti.toString() }
                            },
                            ReturnValues: "ALL_NEW",
                        }
                    }
                ]
            }
        } else if (promoEntryExists) {
            //if the promo entry does exist, update the existing one instead
            input = {
                TransactItems: [
                    {
                        Update: {
                            TableName: tableName,
                            Key: keyPromoEntry,
                            UpdateExpression: `set Codes = :codes`,
                            ExpressionAttributeValues: {
                                ":codes": { "SS": codes }
                            },
                            ReturnValues: "ALL_NEW",
                        }
                    },
                    {
                        Update: {
                            TableName: tableName,
                            Key: keyPromo,
                            UpdateExpression: `set RedeemedCount = RedeemedCount + :inc, Available = Available - :inc`,
                            ConditionExpression: "Available > :val",
                            ExpressionAttributeValues: {
                                ":inc": { "N": "1" },
                                ":val": { "N": "0" }
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
                                ":tickets": { "N": promoTickets.toString() },
                                ":multi": { "N": promoMulti.toString() }
                            },
                            ReturnValues: "ALL_NEW",
                        }
                    }
                ]
            }
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

const peExists = async (eventID, walletID, code) => {
    const pk = `PE#${eventID.split("#")[1]}`
    const sk = `PE#${walletID}`

    const tableName = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }
    let promoEntryExists = false
    let codes = []
    let codeAlreadyRedeemed = false

    const res = await get(tableName, key)

    // Promo Exists
    if (res.Item) {
        promoEntryExists = true
        codes = Array.from(Item.Codes)
    }
    codeAlreadyRedeemed = codes.includes(code)
    codes.push(code)

    return { promoEntryExists, codes, codeAlreadyRedeemed }
}

const loadVairables = async (eventID, walletID, code) => {
    let codes = [code]

    //PROMO ENTRY
    const pkPromoEntry = `PE#${eventID.split("#")[1]}`
    const skPromoEntry = `PE#${walletID}`
    const keyPromoEntry = { PK: { "S": pkPromoEntry }, SK: { "S": skPromoEntry } }
    const promoEntryItem = { PK: { "S": pkPromoEntry }, SK: { "S": skPromoEntry }, Codes: { "SS": codes } }

    //PROMO
    const pkPromo = `PROMO#${eventID.split("#")[1]}`
    const skPromo = `PROMO#${code}`
    const keyPromo = { PK: { "S": pkPromo }, SK: { "S": skPromo } }

    //ENTRY
    const pkEntry = `ENTRY#${eventID.split("#")[1]}`
    const skEntry = `USER#${walletID}`
    const keyEntry = { PK: { "S": pkEntry }, SK: { "S": skEntry } }

    //GENERIC
    const tableName = process.env.TABLE_NAME
    const condExpress = "attribute_not_exists(PK)"


    return { codes, pkPromoEntry, skPromoEntry, pkPromo, skPromo, keyPromo, pkEntry, skEntry, keyEntry, tableName, condExpress, promoEntryItem, keyPromoEntry }

}