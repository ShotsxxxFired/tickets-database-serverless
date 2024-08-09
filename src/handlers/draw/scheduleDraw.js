import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn"
import { devAlert, allAlert } from "../../utils/smsAlert.js"

const client = new SFNClient({ region: "us-east-1" })

module.exports.start = async (event, context, callback) => {
    console.log("Event: ", event)
    let queue = []
    const stateMachineArn = process.env.statemachine_arn

    for (let action of event.Records) {
        if (action.eventName == "INSERT" || action.eventName == "MODIFY") {
            queue.push(action)
        }
    }
    if (queue.length == 0) {
        return { message: "No event changes to schedule" }
    }

    for (let action of queue) {
        console.log("Setting draw: ", action)
        let drawData = action.dynamodb.NewImage
        const now = Math.round(new Date().getTime() / 1000)
        const end = Math.round(parseInt(drawData.EndDate.S))
        const time = end - now

        console.log("Now:", now)
        console.log("End:", end)
        console.log("Time:", time)

        if (time < 1 || time > 99999999) {
            await allAlert(`ERROR:  Invalid End set for Event: ${drawData.EventID.S}. Time until end date: ${formatTime(time)}`)
        } else {
            await allAlert(`Draw for Event: ${drawData.EventID.S} will be completed in ${formatTime(time)}`)
            const input = { eventID: drawData.EventID.S, keys: { PK: drawData.EventPK.S, SK: drawData.EventSK.S }, endDate: end, scheduledTime: time }
            console.log("Setting Draw Data: ", input)
            const params = {
                input: JSON.stringify(input),
                stateMachineArn: stateMachineArn
            }
            const command = new StartExecutionCommand(params)
            const res = await client.send(command)
            console.log(res)
        }
    }
}

const formatTime = (seconds) => {
    let neg = seconds < 0 ? true : false
    seconds = Math.abs(seconds)
    let date = new Date(0)
    date.setSeconds(seconds)
    return (neg ? "-" : "") + parseInt(seconds / 86400) + "d " + date.toISOString().substring(11, 19)
}