import { query } from "../../query.js"

export const getActiveConfigs = async (contractAddress) => {
    let res = { success: false, message: "", data: "" }
    const pk = `COLLECTION#${contractAddress}`

    const tableName = process.env.TABLE_NAME
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }

    const configRes = await query(tableName, keyExpression, attValues)
    if (!configRes.Items) {
        res.success = false
        res.message = `Unable to find configs for ${contractAddress}!`
        return res
    }

    res.success = true
    res.message = "Found Configs"
    res.data = configRes.Items

    return res
}