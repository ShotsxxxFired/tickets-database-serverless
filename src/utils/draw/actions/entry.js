import { query } from "../../query.js"
import { queryPage } from "../../queryPage.js"
import { update } from "../../update.js"

export const getAllEntries = async (pk) => {
    const tableName = process.env.TABLE_NAME
    let res = { success: false, message: "", data: "" }
    const keyExpression = "PK = :pk"
    const attValues = { ":pk": pk }
    let ExclusiveStartKey = ""
    let Entries = []
    let entryRes = await query(tableName, keyExpression, attValues)
    console.log(entryRes)
    if (!entryRes.Items) {
        res.success = false
        res.message = "Unable to find any entries!"
        return res
    }
    Entries = Entries.concat(entryRes.Items)
    if (entryRes.LastEvaluatedKey) {
        ExclusiveStartKey = entryRes.LastEvaluatedKey
    }
    while (entryRes.LastEvaluatedKey) {
        entryRes = await queryPage(tableName, keyExpression, attValues, ExclusiveStartKey)
        if (entryRes.LastEvaluatedKey) {
            ExclusiveStartKey = entryRes.LastEvaluatedKey
        }
        Entries = Entries.concat(entryRes.Items)
    }

    res.success = true
    res.message = "Found Entries"
    res.data = Entries

    return res
}

export const updateEntry = async (entry, updates) => {
    let res = { success: false, message: "", data: "" }
    const tableName = process.env.TABLE_NAME
    const key = { PK: entry.PK, SK: entry.SK }
    console.log(updates)
    console.log(key)

    try {
        let updateRes = await update(tableName, key, updates)

        res.success = true
        res.message = "Updated User"
        res.data = updateRes
        return res
    } catch (error) {
        console.log(error)
        res.success = false
        res.message = "Unable to update User for"
        return res
    }
}