import { getClient } from "./client.js"
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";


export const update = async (tableName, key, updateItems) => {

    const client = await getClient()
    const docClient = DynamoDBDocumentClient.from(client);
    let updateExpression = "set"
    let attValues = ""

    for (let item of updateItems) {
        updateExpression += ` ${item.name} = :${item.name},`
        attValues[`:${item.name}`] = item.value
    }

    updateExpression = updateExpression.slice(0, -1)


    const command = new UpdateCommand({
        TableName: tableName,
        //examples "Blocks"
        Key: key,
        //example Shape: "square"
        UpdateExpression: updateExpression,
        //example "set color = :color, corners = :corners 
        ExpressionAttributeValues: expressionAttValues,
        //example ":color": "black", ":corners" = 8
        ReturnValues: "ALL_NEW",
    })

    try {
        const res = await docClient.send(command)
        return res
    } catch (error) {
        console.log(error)
        throw error
    }
}