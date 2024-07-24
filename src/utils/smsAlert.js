require("dotenv").config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);


const dev = [
    {
        name: "Connor",
        number: "+17802667186"
    }
]
const others = [
    {
        name: "Brandon",
        number: "+17809742644"
    }
]

export const devAlert = async (message) => {
    let msg = "Dev Only: " + message
    console.log(`Sending SMS: ${message}`)
    for (let contact of dev) {
        res = await smsSend(msg, contact.number)
    }
    return res
}

export const allAlert = async (message) => {
    console.log(`Sending SMS: ${message}`)
    let contacts = dev.concat(others)
    let res = ""
    for (let contact of contacts) {
        res = await smsSend(message, contact.number)
    }
    return res
}

const smsSend = async (body, to) => {
    try {
        let message = client.messages.create({
            body: body,
            from: "+12292672301",
            to: to,
        })

        return message
    } catch (error) {
        console.log(error)
        return error
    }

}
