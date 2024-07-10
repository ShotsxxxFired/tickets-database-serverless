import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"
import { getClient } from "../utils/client.js"
import { get } from "../utils/get.js"

module.exports.handler = async (event) => {
    console.log(event.body)
    try {
        const { eventID, walletID, code, eventDeadline } = JSON.parse(event.body)
        console.log(event.body)
        console.log(Date.now())
        if (eventDeadline * 1000 < Date.now()) {
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    message: "This event has already expired!"
                })
            }

            return response
        }
        //Configuring this fields needed for the request is consolidated into the loadVariables method.
        const { keyPromo, keyEntry, tableName, condExpress, promoEntryItem, keyPromoEntry } = await loadVairables(eventID, walletID, code)
        // get client
        const client = await getClient()

        //check to see if there is already a promo entry for this event/user
        const { promoEntryExists, codes, codeAlreadyRedeemed } = await peExists(eventID, walletID, code, client)

        //transaction input
        let input = {}

        if (codeAlreadyRedeemed) {
            console.log("Code has already been used for this Event")
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    error: `User has aleady redeemed the code "${code}" for this event.`
                })
            }

            console.log(response)
            return response
        }

        const { promoTickets, promoMulti, deadline, success, available } = await getPromoData(eventID, code)

        if (!success) {
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    error: `Code: "${code}" does not exist!`
                })
            }
            return response
        }

        if (!available) {
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    error: `No more uses for "${code}" are available!`
                })
            }
            return response
        }

        if (deadline * 1000 < Date.now()) {
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    error: `Deadline for code "${code}" has passed!`
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
    const pk = `PE#${eventID}`
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
        codes = Array.from(res.Item.Codes)
    }
    codeAlreadyRedeemed = codes.includes(code)
    codes.push(code)

    return { promoEntryExists, codes, codeAlreadyRedeemed }
}
const getPromoData = async (eventID, code) => {
    const pk = `PROMO#${eventID}`
    const sk = `PROMO#${code}`

    const tableName = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }
    const res = await get(tableName, key)
    console.log(res)
    if (res.Item) {
        if (res.Item.Available < 1) {
            return { success: true, available: false }
        }
        let promoTickets = res.Item.TicketsBase
        let promoMulti = res.Item.TicketsMulti
        let deadline = res.Item.Deadline

        return { promoTickets, promoMulti, deadline, success: true, available: true }
    }
    return { success: false, available: false }
}

const loadVairables = async (eventID, walletID, code) => {
    let codes = [code]

    //PROMO ENTRY
    const pkPromoEntry = `PE#${eventID}`
    const skPromoEntry = `PE#${walletID}`
    const keyPromoEntry = { PK: { "S": pkPromoEntry }, SK: { "S": skPromoEntry } }
    const promoEntryItem = { PK: { "S": pkPromoEntry }, SK: { "S": skPromoEntry }, Codes: { "SS": codes } }

    //PROMO
    const pkPromo = `PROMO#${eventID}`
    const skPromo = `PROMO#${code}`
    const keyPromo = { PK: { "S": pkPromo }, SK: { "S": skPromo } }

    //ENTRY
    const pkEntry = `ENTRY#${eventID}`
    const skEntry = `USER#${walletID}`
    const keyEntry = { PK: { "S": pkEntry }, SK: { "S": skEntry } }

    //GENERIC
    const tableName = process.env.TABLE_NAME
    const condExpress = "attribute_not_exists(PK)"


    return { codes, pkPromoEntry, skPromoEntry, pkPromo, skPromo, keyPromo, pkEntry, skEntry, keyEntry, tableName, condExpress, promoEntryItem, keyPromoEntry }

}