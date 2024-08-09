import { devAlert, allAlert } from "../../utils/smsAlert.js"
import { getEventDetails, updateWinner } from "../../utils/draw/actions/event.js"
import { getAllEntries, updateEntry } from "../../utils/draw/actions/entry.js"
import { getActiveConfigs } from "../../utils/draw/actions/config.js"
import { getActiveContracts } from "../../utils/draw/actions/contract.js"
import { getUserInfo } from "../../utils/draw/actions/user.js"
import { getHolderTickets } from "../../utils/draw/actions/holder.js"
import truncateEthAddress from 'truncate-eth-address'

module.exports.start = async (event, context, callback) => {
    try {
        console.log(`Getting Winner for Event:`, event)
        await allAlert(`Drawing winner(s) for Event: ${event.eventID}`)
        let scheduled = { endDate: event.endDate, eventID: event.eventID, keys: event.keys, event: "" }
        let entryPK = "ENTRY#" + scheduled.eventID

        let contracts = []
        let drawArray = []
        let entries = []

        //#region Get and Validate Event and Entries
        const eventRes = await getEventDetails(event.keys)
        const entriesRes = await getAllEntries(entryPK)
        console.log("Get Event Responce: ", eventRes)
        console.log("Get Entries Responce: ", entriesRes)

        //checking for errors and valid data
        if (!eventRes.success) {
            await devAlert(`Unable to access details of EventID: ${scheduled.eventID}`)
            return { message: "Error" }
        }
        if (eventRes.data.EndDate != scheduled.endDate) {
            console.log("End Date:", eventRes.data.EndDate)
            console.log("Scheduled End Date:", scheduled.endDate)
            await devAlert(`Skipped draw for EventID: ${scheduled.eventID}. End date and scheduled end date do not match.`)
            return { message: "Error" }
        }
        if (!entriesRes.success) {
            await devAlert(`Unable to access details of Entries for EventID: ${scheduled.eventID}`)
            return { message: "Error" }
        }
        scheduled.event = eventRes.data
        entries = entriesRes.data

        //#endregion

        //#region Get and Validate Contracts and Configs
        console.log("Getting Contracts and Configs")
        const contractRes = await getActiveContracts()
        const tempContracts = [] //[{address: [CONTRACTG ADDRESS], configs: [NFT TICKET CONFIGS]}]
        console.log("Get Contract Responce: ", contractRes)
        if (!contractRes.success) {
            await devAlert(`Unable find any contracts when drawing EventID: ${scheduled.eventID}`)
            console.log(`Contract Error: `, contractRes)
        }

        for (let contract of contractRes.data) {
            let address = contract.ContractAddress
            let configRes = await getActiveConfigs(address)
            if (!configRes.success) {
                await devAlert(`Unable find any configs for contract ${contract.Name}`)
                console.log(`Config Error `, configRes)
            }
            console.log(`Get Config Responces for contract ${contract.Name}: `, configRes)
            contracts.push({ address: address, configs: configRes.data })
        }

        //#endregion

        //#region Filter blacklisted user entries out. 
        console.log("Filtering out any Blacklisted Users")

        let validEntries = []
        let invalidEntries = []

        for (let entry of entries) {
            let entryWallet = entry.SK.split("#")[1]
            let userRes = await getUserInfo(entryWallet)

            if (userRes.success) {
                if (!userRes.data.Blacklist) {
                    entry.user = userRes.data
                    validEntries.push(entry)
                } else {
                    invalidEntries.push(entry)
                }
            } else {
                console.log("Unable to find user for entry: ", entry)
            }

        }
        console.log(`${validEntries.length}/${entries.length} entries are valid. ${invalidEntries.length} were removed due to being blacklisted.`)
        entries = validEntries
        //#endregion

        //#region Check for any duplicate entries
        console.log("Checking for duplicate entries")
        let uEntries = []
        let duplicates = []
        let uWallets = []

        for (let entry of entries) {
            let entryWallet = entry.SK.split("#")[1].toLowerCase()
            if (!uWallets.includes(entryWallet)) {
                uWallets.push(entryWallet)
                uEntries.push(entry)
            } else {
                duplicates.push(entry)
            }
        }

        entries = uEntries
        console.log(`${duplicates.length} duplicates found and removed!`)
        console.log("Duplicates: ", duplicates)
        //#endregion

        //#region Holding Tickets Snapshot + Final Ticket Total
        let changeLog = []
        for (let entry of entries) {
            let updatedEntry = []
            let entryWallet = entry.SK.split("#")[1]
            let holderTicketRes = await getHolderTickets(entryWallet, contracts)

            if (holderTicketRes.success) {
                let ticketsNew = holderTicketRes.Tickets
                if (ticketsNew.Base != entry.HoldingTickets) {
                    changeLog.push({ OldTickets: entry.HoldingTickets, NewTickets: ticketsNew.Base, Entry: { PK: entry.PK, SK: entry.SK } })
                    entry.HoldingTickets = ticketsNew.Base
                    updatedEntry.push({ name: "HoldingTickets", value: entry.HoldingTickets })
                }
                if (ticketsNew.Multi != entry.HoldingMulti) {
                    changeLog.push({ OldMulti: entry.HoldingMulti, NewMulti: ticketsNew.Multi, Entry: { PK: entry.PK, SK: entry.SK } })
                    entry.HoldingMulti = ticketsNew.Multi
                    updatedEntry.push({ name: "HoldingMulti", value: entry.HoldingMulti })
                }
            } else {
                console.log("Unable to update user's holding tickets: ", entry)
            }



            let totalBaseTickets = entry.FixedTickets + entry.SocialTickets + entry.PromoTickets + entry.HoldingTickets;
            let totalBaseMulti = entry.FixedMulti + entry.SocialMulti + entry.PromoMulti + entry.HoldingMulti;
            entry.TotalTickets = Math.round(totalBaseTickets * (totalBaseMulti / 100 + 1))
            updatedEntry.push({ name: "TotalTickets", value: entry.TotalTickets })
            let updateResponse = await updateEntry(entry, updatedEntry)

            if (!updateResponse.success) {
                console.log("Error Updating Entry:", entry)
                console.log("Update Response:", updateResponse)
                throw updateResponse
            }
        }

        if (changeLog.length > 0) {
            console.log("Changed Holding Tickets: ", changeLog)
        }

        //#endregion

        //#region Generate Draw Array
        console.log("Creating Draw Array")
        let prevLastTicket = 0
        let ticketSum = 0
        //let removedEntries = []

        for (let entry of entries) {
            //Remove none holders from draw for Test Holder only Draws
            // if (entry.HoldingTickets < 1 && entry.HoldingMulti < 1) {
            //     removedEntries.push(entry)
            // } else {
            let entryWallet = entry.SK.split("#")[1]
            let firstTicket = prevLastTicket + 1
            let lastTicket = prevLastTicket + entry.TotalTickets
            let hasSocial = false
            prevLastTicket = lastTicket
            ticketSum += entry.TotalTickets

            if (entry.SocialTickets > 0 || entry.SocialMulti > 0) {
                hasSocial = true
            }
            drawArray.push({ wallet: entryWallet, first: firstTicket, last: lastTicket, total: entry.TotalTickets, user: entry.user, social: hasSocial })
            //}

        }

        console.log(`Final Tickets Assigned - ${entries.length} entries with ${ticketSum} total Tickets`)
        //#endregion

        //#region Get Winning Ticket & Update with Winners
        console.log("Generating Winning Numbers")
        let winNum = []
        for (let i = 0; i < scheduled.event.NumberWinners; i++) {
            let num = Math.floor((Math.random() * ticketSum) + 1)
            winNum.push(num)
        }
        console.log(`Winning Numbers: ${winNum}`)

        console.log("Getting Winners")
        //Create Winner item & add to a Winners array & Update Event with Winners
        //let winner = ["[Winner Label: NICKNAME (TRUNCATED WALLET ADDY)]", "[FULL WALLET ADDY]", "[NICKNAME]", "[TWITTER HANDLE]", "[Has Social Points: Yes or No]", "[TxHash - updated after prize is awarded]"]
        let winners = []
        for (let num of winNum) {
            for (let entry of drawArray) {
                if (entry.first <= num && entry.last >= num) {
                    console.log("Winner: ", entry)
                    let nickname = entry.user.Nickname ? (`${entry.user.Nickname} (${truncateEthAddress(entry.wallet)})`) : (truncateEthAddress(entry.wallet))
                    winners.push([nickname, entry.wallet, (entry.user.Nickname ? entry.user.Nickname : ""), (entry.user.Twitter ? entry.user.Twitter : ""), entry.social ? "Yes" : "No", ""])
                }
            }
        }
        console.log("Winners: ", winners)

        console.log("Updating Event with Winners")
        let winnerRes = await updateWinner({ PK: scheduled.event.PK, SK: scheduled.event.SK }, winners)
        if (winnerRes.success) {
            console.log("Event Update Successful: ", winnerRes.data.Attributes.winners)
            await allAlert(`Winner Drawn: ${winners}`)
        } else {
            console.log("Unable to update even with Winners: ", winnerRes)
            await devAlert(`ERROR DRAWING WINNER FOR ${scheduled.eventID}`)
        }
        //#endregion

    } catch (error) {
        console.log(error)
        await devAlert(`ERROR DRAWING WINNER FOR ${scheduled.eventID}`)
    }
}