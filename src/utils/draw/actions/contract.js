import { query } from "../../query.js"

export const getActiveContracts = async () => {
    try {
        let res = { success: false, message: "", data: "" }
        const pk = `CONTRACT#`
        const tableName = process.env.TABLE_NAME
        const keyExpression = "PK = :pk"
        const attValues = { ":pk": pk }

        const contractRes = await query(tableName, keyExpression, attValues)
        if (!contractRes.Items) {
            res.success = false
            res.message = "Unable to access contracts"
            return res
        }
        res.success = true
        res.message = "Found Contracts!"
        res.data = contractRes.Items
        return res
    } catch (error) {
        console.log(error)
    }

}