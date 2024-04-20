import { create } from "../utils/create.js"

module.exports.handler = async (event) => {
    const { contractAddress, active } = JSON.parse(event.body)

    const pk = `CONTRACT#`
    const sk = `CONTRACT#${contractAddress}`
    const tableName = process.env.TABLE_NAME
    const item = { PK: pk, SK: sk, ContractAddress: contractAddress, Active: active }
    const condExpress = "attribute_not_exists(PK)"

    const res = await create(tableName, item, condExpress)

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            res
        })
    }
    return response
}