import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"
import { getClient } from "../utils/client.js"
import { ulid, decodeTime } from 'ulid'
import { devAlert, allAlert } from "../utils/smsAlert.js"

module.exports.handler = async (event) => {
    console.log(event.body)
    const { startDate, endDate, title, description, eventImageUrl, numWinners } = JSON.parse(event.body)
    try {
        const client = await getClient()

        const idEvent = ulid()
        const idDraw = ulid()
        const time = decodeTime(idEvent)

        const year = new Date(time).getFullYear().toString()
        const month = new Date(time).getMonth().toString()
        let yearMonth = year + month.padStart(2, "0")

        const pkEvent = `EVENT#${yearMonth}`
        const skEvent = `EVENT#${idEvent}`
        const eventTableName = process.env.TABLE_NAME
        const itemEvent = {
            PK: { "S": pkEvent },
            SK: { "S": skEvent },
            StartDate: { "S": startDate },
            EndDate: { "S": endDate },
            Title: { "S": title },
            Description: { "S": description },
            EventImageURL: { "S": eventImageUrl },
            Entries: { "N": "0" },
            NumberWinners: { "N": numWinners.toString() },
            Winners: { "L": [] }
        }

        const pkDraw = `DRAW#`
        const skDraw = `DRAW#${idDraw}`
        const drawTableName = process.env.DRAW_TABLE_NAME
        const itemDraw = {
            PK: { "S": pkDraw },
            SK: { "S": skDraw },
            EndDate: { "S": endDate },
            EventID: { "S": idEvent }
        }

        const condExpress = "attribute_not_exists(PK)"

        const input = {
            TransactItems: [
                {
                    Put: {
                        TableName: eventTableName,
                        Item: itemEvent,
                        ConditionExpression: condExpress,
                    }
                },
                {
                    Put: {
                        TableName: drawTableName,
                        Item: itemDraw,
                        ConditionExpression: condExpress,
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
        let smsRes = await allAlert("Tickets Alert: Event has been created")
        console.log(smsRes)
        return response
    } catch (error) {
        console.log(error)
        const response = {
            statusCode: 400,
            body: JSON.stringify({
                error
            })
        }
        await allAlert(`Tickets Alert: event wasn't able to be created: ${JSON.stringify({
            error
        })}`)
        return response
    }

}