//import { getClient } from "./client.js"
//import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const { ScanCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb")
const { getClient } = require("./client.js")



const scan = async (tableName, exclusiveStartKey) => {
    const client = await getClient()
    const docClient = DynamoDBDocumentClient.from(client);
    let input = {}
    if (exclusiveStartKey != "") {
        input = {
            TableName: tableName,
            ExclusiveStartKey: exclusiveStartKey

        }
    } else {
        input = {
            TableName: tableName,
        }
    }

    const command = new ScanCommand(input)

    try {
        const res = await docClient.send(command)
        return res
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = { scan }