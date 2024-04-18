import { getClient } from "./client.js"
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



export const create = async (tableName, item, condExpress) => {
    const client = await getClient()
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new PutCommand({
        TableName: tableName,
        Item: item,
        ConditionExpression: condExpress,
    })

    try {
        const res = await docClient.send(command)
        return res
    } catch (error) {
        console.log(error)
        return error
    }
}