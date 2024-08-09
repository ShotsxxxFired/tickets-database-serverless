import { get } from "../../get.js"

const baseURL = process.env.TICKETS_PROD_BASE_URL;
const apiKey = process.env.TICKETS_PROD_PRIVATE_KEY;

export const getUserInfo = async (wallet) => {

    const tableName = process.env.TABLE_NAME
    let res = { success: false, message: "", data: "" }
    const key = "USER#" + wallet
    const keys = { PK: key, SK: key }

    const userRes = await get(tableName, keys)

    res.success = userRes.Item ? true : false
    res.message = userRes.Item ? "User Found!" : "Unable to find User!"
    res.data = userRes.Item ? userRes.Item : ""

    return res
}