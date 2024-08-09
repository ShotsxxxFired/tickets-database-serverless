import { get } from "../../get.js"
import { update } from "../../update.js"

export const getEventDetails = async (keys) => {
    const tableName = process.env.TABLE_NAME
    let res = { success: false, message: "", data: "" }
    console.log(keys)

    const eventRes = await get(tableName, keys)

    res.success = eventRes.Item ? true : false
    res.message = eventRes.Item ? "Event Found!" : "Unable to find Event!"
    res.data = eventRes.Item ? eventRes.Item : ""


    return res
}

export const updateWinner = async (key, winners) => {
    let res = { success: false, message: "", data: "" }
    const tableName = process.env.TABLE_NAME

    try {
        let updateWinners = [{ name: "Winners", value: winners }]
        let updateRes = await update(tableName, key, updateWinners)

        res.success = true
        res.message = "Updated Event"
        res.data = updateRes
        return res
    } catch (error) {
        console.log(error)
        res.success = false
        res.message = "Unable to update Event"
        return res
    }
}