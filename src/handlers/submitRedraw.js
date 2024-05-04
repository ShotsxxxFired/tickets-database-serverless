import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb"
import { getClient } from "../utils/client.js"
import { decodeTime } from 'ulid'
import { query } from "../utils/query.js"
import { queryPage } from "../utils/queryPage.js"
import { get } from "../utils/get.js"
import { crypto } from "crypto"
import { update } from "../utils/update.js"
import { decodeTime } from "ulid"

module.exports.handler = async (event) => {
    try {
        const { eventID, badWinners } = JSON.parse(event.body)
        //const { } = event.pathParameters
        const time = decodeTime(eventID.split("#")[1])

        const year = new Date(time).getFullYear().toString()
        const month = new Date(time).getMonth().toString()
        let yearMonth = year + month.padStart(2, "0")

        const pk = `EVENT#${yearMonth}`
        const sk = eventID

        const client = await getClient()
        //returns the details of the event
        let eventData = await getEvent(eventID)

        if (eventData.Winners.Length == 0) {
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    "error": ""
                })
            }

            return response
        }

        //Returns the entries for this event
        let entries = await getEntries(eventID, badWinners)

        //Returns the newly selected winner. 
        let winners = drawWinner(entries, eventData)

        let res = await updateWinner(pk, sk, { "name": "Winners", "value": winners })

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

const getEntries = async (eventID, badWinners) => {

    const pk = `ENTRY#${eventID.split("#")[1]}`

    const tableName = process.env.TABLE_NAME
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }

    const res = await query(tableName, keyExpression, attValues)

    while (res.LastEvaluatedKey != null) {
        let newRes = await queryPage(tableName, keyExpression, attValues, res.LastEvaluatedKey)
        res.items.concat(newRes.items)
    }
}

const getEvent = async (eventID) => {
    const time = decodeTime(eventID.split("#")[1])

    const year = new Date(time).getFullYear().toString()
    const month = new Date(time).getMonth().toString()
    let yearMonth = year + month.padStart(2, "0")

    const pk = `EVENT#${yearMonth}`
    const sk = eventID

    const tableName = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }

    const res = await get(tableName, key)
}

const drawWinner = async (entries, eventData) => {
    let raffleList = []
    const numWin = eventData.NumberWinners
    const oldWinners = eventData.Winners
    let newWinners = []
    let first = 1
    let last = 0
    let totalOverallTickets = 0

    for (let entry of entries) {
        const walletID = entry.SK.split("#")[1]
        if (!oldWinners.includes(walletID)) {
            if (first > 1)
                first = first + entry.TotalTickets + 1
            last = first + entry.TotalTickets - 1
            totalOverallTickets += entry.TotalTickets
            raffleList.push({ name: walletID, ticketsFirst: first, ticketsLast: last })
        }
    }

    let newWinnersNum = Array.from({ length: (numWin + 5) }, () => getRandomInt(1, totalOverallTickets))
    for (let entry of raffleList) {
        for (let winNum of newWinnersNum) {
            if (winNum >= entry.first && winNum <= entry.last) {
                if (!newWinners.includes(entry.SK.split("#")[1]))
                    newWinners.push(entry.SK.split("#")[1])
            }
        }
    }

    let winners = newWinners.slice(0, numWin)
    return winners
}

const updateWinner = async (PK, SK, updateItems) => {
    const pk = PK
    const sk = SK

    const tableName = process.env.TABLE_NAME
    const key = { PK: pk, SK: sk }

    const res = await update(tableName, key, updateItems)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}

const getRandomInt = async (min, max) => {
    const range = max - min + 1;
    const randomBuffer = crypto.randomBytes(4);
    const randomNumber = randomBuffer.readUInt32LE(0);
    return min + Math.floor(randomNumber / (0xffffffff / range));
}

