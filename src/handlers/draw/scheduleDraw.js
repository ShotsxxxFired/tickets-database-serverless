import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn"

const client = new SFNClient({ region: "us-east-1" })

module.exports.start = async (event, context, callback) => {
    const stateMachineArn = process.env.statemachine_arn
    const eventData = event.Records[0].dynamodb.NewImage
    const input = { eventID: eventData.EventID, endDate: eventData.EndDate }
    const params = {
        input: JSON.stringify(input),
        stateMachineArn: stateMachineArn
    }

    const command = new StartExecutionCommand(params)
    const res = await client.send(command)
    console.log("Trigger Management Function")
    console.log(res)
    console.log(stateMachineArn)
}