import { devAlert, allAlert } from "../../utils/smsAlert.js"

module.exports.start = async (event, context, callback) => {
    //let smsRes = await allAlert("TEST")
    console.log("Triggered Draw Function")
    let now = Math.round(Date.now() / 1000)
    let end = parseInt(event.endDate)

    let offset = now - end

    await devAlert(`Drawing Winner ${offset} seconds from scheduled draw. Now: ${now}, End: ${end}`)
    console.log(event)
    console.log(now)
    console.log(end)
}