//import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")

let client = null

const getClient = async () => {
    if (client) return client
    client = new DynamoDBClient({})
    return client
}

module.exports = { getClient }