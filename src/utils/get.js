import { getClient } from "./client.js"
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



export const get = async (tableName, key) => {
    const client = await getClient()
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new GetCommand({
        TableName: tableName,
        Key: key,
    })

    try {
        const res = await docClient.send(command)
        return res
    } catch (error) {
        console.log(error)
        return error
    }
}