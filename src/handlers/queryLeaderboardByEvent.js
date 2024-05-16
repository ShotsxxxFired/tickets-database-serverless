import { query } from "../utils/query.js"
import { queryPage } from "../utils/queryPage.js"
import { get } from "../utils/get.js"
import truncateEthAddress from 'truncate-eth-address'

module.exports.handler = async (event) => {
    try {
        const { eventID } = event.pathParameters
        let leaderboard = []
        let topEntries = await getTopEntries(eventID)
        console.log("Top Entries")
        console.log(topEntries)
        for (let entry of topEntries) {

            entry = await getNicknames(entry)
            leaderboard.push({ Nickname: entry.Nickname, Tickets: entry.total })
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                leaderboard
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

const totalTickets = async (item) => {

    let totalBaseTickets = item.FixedTickets + item.SocialTickets + item.PromoTickets + item.HoldingTickets
    let totalBaseMulti = item.FixedMulti + item.SocialMulti + item.PromoMulti + item.HoldingMulti
    const entry = {
        base: item.FixedTickets ? item.FixedTickets : 0,
        baseMulti: item.FixedMulti ? item.FixedMulti : 0,
        engagement: item.SocialTickets ? item.SocialTickets : 0,
        engagementMulti: item.SocialMulti ? item.SocialMulti : 0,
        promoCodes: item.PromoTickets ? item.PromoTickets : 0,
        promoCodesMulti: item.PromoMulti ? item.PromoMulti : 0,
        listedPenalty: item.PromoMulti ? item.PromoMulti : 0,
        listedPenaltyMulti: item.PromoMulti ? item.PromoMulti : 0,
        holdingTickets: item.HoldingTickets,
        holdingMulti: item.HoldingMulti,
        totalTickets: totalBaseTickets,
        totalMulti: totalBaseMulti,
        total: Math.round(totalBaseTickets * (totalBaseMulti / 100 + 1))
    };
    return entry.total
}

const getTopEntries = async (eventID) => {
    const pk = `ENTRY#${eventID}`

    const tableName = process.env.TABLE_NAME
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }

    let res = await query(tableName, keyExpression, attValues)

    while (res.LastEvaluatedKey) {
        let newRes = await queryPage(tableName, keyExpression, attValues, res.LastEvaluatedKey)
        res.Items.concat(newRes.Items)
        res.LastEvaluatedKey = newRes.LastEvaluatedKey
    }

    for (let entry of res.Items) {
        entry.total = await totalTickets(entry)
    }

    res.Items.sort((a, b) => {
        if (a.total > b.total)
            return -1
        else
            return 1

    })
    let response = res.Items.splice(0, 11)
    console.log(response)
    return response
}

const getNicknames = async (item) => {
    const tableName = process.env.TABLE_NAME
    const userID = "USER#" + item.SK.split("#")[1]
    const userKey = { PK: userID, SK: userID }
    let temp = item
    let data = await get(tableName, userKey)
    if (data.Item.Nickname == null) {
        temp.Nickname = truncateEthAddress(temp.SK.split("#")[1])
    } else {
        if (data.Item.Nickname == "") {
            temp.Nickname = truncateEthAddress(temp.SK.split("#")[1])
        } else {
            temp.Nickname = data.Item.Nickname
        }
    }

    return temp
}