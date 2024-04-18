import { getClient } from "./client.js"
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



export const queryPage = async (tableName, keyExpression, attValues, startKey) => {
    const client = await getClient()
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: keyExpression,
        ExpressionAttributeValues: attValues,
        ExclusiveStartKey: startKey
    })

    try {
        const res = await docClient.send(command)
        return res
    } catch (error) {
        console.log(error)
        return error
    }
}