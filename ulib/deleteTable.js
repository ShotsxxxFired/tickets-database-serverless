//import { DeleteTableCommand, waitUntilTableNotExists } from "@aws-sdk/client-dynamodb"
//import { getClient } from "./client.js"
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb")
const { getClient } = require("./client.js")


const deleteTable = async (tableName, items) => {
    console.log(`Deleting all itmes in table Table: ${tableName}`)
    const client = await getClient()
    try {

        for (let item of items) {
            const command = new DeleteCommand({
                TableName: tableName,
                Key: { "PK": item.PK, "SK": item.SK }
            })

            const res = await client.send(command)
        }

        console.log(`Deleted ${items.length} items!`)
        return true

    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = { deleteTable }