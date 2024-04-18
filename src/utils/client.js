import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

let client = null

export const getClient = async () => {
    if (client) return client
    client = new DynamoDBClient({})
    return client
}