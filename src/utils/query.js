import { getClient } from "./client.js"
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



export const query = async (tableName, keyExpression, attValues) => {
    const client = await getClient()
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: keyExpression,
        ExpressionAttributeValues: attValues,
    })

    try {
        const res = await docClient.send(command)
        return res
    } catch (error) {
        console.log(error)
        return error
    }
}