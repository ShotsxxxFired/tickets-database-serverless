import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn"
import { devAlert, allAlert } from "../../utils/smsAlert.js"

const client = new SFNClient({ region: "us-east-1" })

module.exports.start = async (event, context, callback) => {
    //let smsRes = await allAlert("TEST")
    const stateMachineArn = process.env.statemachine_arn
    const eventData = event.Records[0].dynamodb.NewImage
    console.log("Event: ", eventData)
    console.log(eventData.EndDate.S)
    const now = new Date().getTime() / 1000
    const end = parseInt(eventData.EndDate.S)
    const time = Math.round(end - now)

    console.log("Now:", now)
    console.log("End:", end)
    console.log("Time:", time)

    if (time < 1 || time > 99999999) {
        await devAlert(`Time until draw has been set to an invalid amount. Time until draw: ${formatTime(time)}`)
    } else {
        await devAlert(`Setting Event: ${eventData.EventID.S} to draw a winner in ${formatTime(time)}`)
        const input = { eventID: eventData.EventID.S, endDate: end, scheduledTime: time }
        const params = {
            input: JSON.stringify(input),
            stateMachineArn: stateMachineArn
        }
        const command = new StartExecutionCommand(params)
        const res = await client.send(command)
        console.log(res)
    }
}

const formatTime = (seconds) => {
    let date = new Date(0)
    date.setSeconds(seconds)
    return parseInt(seconds / 86400) + "d " + date.toISOString().substring(11, 19)
}