const { TransactWriteItemsCommand, DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { decodeTime } = require("ulid")
const { GetCommand, DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb")


const tableName = "dynamodb-tickets-prod-TicketsTable-S9KH2HEPMM9I"

const startTrans = async () => {
    try {
        const { eventID, walletID, fixedTickets, fixedMulti, holdingTickets, holdingMulti, totalTickets } = {
            eventID: "EVENT#01HW3NGF15GR500MSGRCW050RE",
            walletID: "TESSTY12",
            fixedTickets: 1,
            fixedMulti: 2,
            holdingTickets: 0,
            holdingMulti: 0,
            totalTickets: 0
        }
        console.log(eventID)
        const client = new DynamoDBClient({})

        const pkEntry = `ENTRY#${eventID.split("#")[1]}`
        const skEntry = `USER#${walletID}`

        const time = decodeTime(eventID.split("#")[1])

        const year = new Date(time).getFullYear().toString()
        const month = new Date(time).getMonth().toString()
        let yearMonth = year + month.padStart(2, "0")

        const pkEvent = `EVENT#${yearMonth}`
        const skEvent = eventID
        const keyEvent = { PK: { S: pkEvent }, SK: { S: skEvent } }

        const condExpress = "attribute_not_exists(PK)"
        const entryItem = {
            PK: { "S": pkEntry },
            SK: { "S": skEntry },
            FixedTickets: { "N": fixedTickets.toString() },
            FixedMulti: { "N": fixedMulti.toString() },
            HoldingTickets: { "N": holdingTickets.toString() },
            HoldingMulti: { "N": holdingMulti.toString() },
            TotalTickets: { "N": totalTickets.toString() }
        }

        const input = {
            TransactItems: [
                {
                    Put: {
                        TableName: tableName,
                        Item: entryItem,
                        ConditionExpression: condExpress
                    }
                },
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
        console.log("stage2")
        //console.log(command.input.TransactItems[0].Put)
        const res = await client.send(command)
        console.log("stage3")
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

const startGet = async () => {
    const pk = `PE#${"01HW3NGF15GR500MSGRCW050RE"}`
    const sk = `PE#${"TESTWALLET2"}`

    const key = { PK: pk, SK: sk }

    const client = new DynamoDBClient({})
    const docClient = DynamoDBDocumentClient.from(client);
    let code = "333"
    let codes = []
    const command = new GetCommand({
        TableName: tableName,
        Key: key,
    })

    try {
        const res = await docClient.send(command)

        if (res.Item) {
            codes = Array.from(res.Item.Codes)
            codes.push(code)
            console.log(codes)
        }


    } catch (error) {
        console.log(error)
    }


}


const getEntries = async () => {
    const eventID = "EVENT#01HW3NGF15GR500MSGRCW050RE"

    const pk = `ENTRY#${eventID.split("#")[1]}`

    const tableName = process.env.TABLE_NAME
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }
    console.log(keyExpression)
    console.log(attValues)
    const res = await query(keyExpression, attValues)

    while (res.LastEvaluatedKey != null) {
        let newRes = await queryPage(tableName, keyExpression, attValues, res.LastEvaluatedKey)
        res.items.concat(newRes.items)
    }

    console.log(res)
}

const query = async (keyExpression, attValues) => {
    const client = new DynamoDBClient({})
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: keyExpression,
        ExpressionAttributeValues: attValues,
    })

    try {
        const res = await docClient.send(command)
        return res
    } catch (error) {
        console.log(error)
        return error
    }
}

getEntries()