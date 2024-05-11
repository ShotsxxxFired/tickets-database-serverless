import { getClient } from "./client.js"
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



export const scan = async (tableName, filter, expresstionAtt, exclusiveStartKey) => {
    const client = await getClient()
    const docClient = DynamoDBDocumentClient.from(client);
    let input = {}
    if (exclusiveStartKey != "") {
        input = {
            TableName: tableName,
            FilterExpression: filter,
            ExpressionAttributeValues: expresstionAtt,
            ExclusiveStartKey: exclusiveStartKey

        }
    } else {
        input = {
            TableName: tableName,
            FilterExpression: filter,
            ExpressionAttributeValues: expresstionAtt,
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