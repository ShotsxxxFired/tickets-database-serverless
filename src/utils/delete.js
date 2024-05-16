import { getClient } from "./client.js"
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



export const deleteItem = async (tableName, key) => {
    const client = await getClient()
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new DeleteCommand({
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