//import { ListTablesCommand } from "@aws-sdk/client-dynamodb"
//import { getClient } from "./client.js"
const { ListTablesCommand } = require("@aws-sdk/client-dynamodb")
const { getClient } = require("./client.js")

const getTable = async () => {
    console.log(`Getting Table Name!`)
    const client = await getClient()
    try {

        const command = new ListTablesCommand({})
        const res = await client.send(command)
        for (let name of res.TableNames) {
            if (name.includes("TicketsTable")) {
                return name
            }
        }
        return "NONE"
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = { getTable }