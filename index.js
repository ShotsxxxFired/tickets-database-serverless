// import { deleteTable } from "./utils/deleteTable.js";
// import { tableExists } from "./utils/existsTable.js";
// import { attDeff, keySchema, configs, contracts } from "./config.js";
// import { input } from '@inquirer/prompts';
// import { eventCreate, contractCreate, configCreate } from "./utils/createCalls.js";
// import { exec } from "child_process";
// import 'dotenv/config'
require('dotenv').config()
const { deleteTable } = require("./ulib/deleteTable.js")
const { getTable } = require("./ulib/getTable.js")
const { attDeff, keySchema, configs, contracts } = require("./config.js")
const { input } = require('@inquirer/prompts')
const { eventCreate, contractCreate, configCreate, socialCreate } = require("./ulib/createCalls.js")
const util = require("node:util")
const exec = util.promisify(require("node:child_process").exec)
const { waitUntilTableExists } = require("@aws-sdk/client-dynamodb")
const { getClient } = require("./ulib/client.js")
const { scan } = require("./ulib/getAllItems.js")


let tableName = ""

const confirmation = async (msg) => {
    console.log(msg)
    const confirm = await input({ message: `To proceed type "CONTINUE" then press Enter` })

    if (confirm == "CONTINUE") {
        return true
    } else {
        return false
    }
}

const createTable = async () => {
    const client = await getClient()
    console.log("Creating Table")
    const { stdout, stderr } = await exec('sls deploy -s prod --force')
    //console.log(`stdout: ${stdout}`)
    //console.log(`stderr: ${stderr}`)
    console.log("Create Command Completed, Waiting for Table to be ready!")
    let response = await waitUntilTableExists({ client: client, maxWaitTime: 120 }, { TableName: tableName })
    if (response.state == 'SUCCESS') {
        console.log("Table is ready!")
    }
    else {
        console.log("Table wasn't created within 2 minutes!")
        return
    }

}

const addTestValues = async () => {
    //#region Create Events based on config below
    console.log("Adding Test Events")
    let imgURL = "https://s3.us-east-1.amazonaws.com/publicassets.atsnft.io/grapes/pixels/2865.png"
    let count = 3
    let successCount = 0
    let offset = [-1, 6, 8]
    for (let i = 0; i < count; i++) {
        let date = new Date(Date.now())
        let date2 = new Date(Date.now())
        let endDate = Math.floor(new Date(date.setDate(date.getDate() + offset[i])).getTime() / 1000)
        let startDate = Math.floor(new Date(date2.setDate((date2.getDate() + offset[i]) - 7)).getTime() / 1000)

        let title = `Test Event #${i + 1}`
        let description = `Test Event`
        let numWinners = 1
        let eventImageUrl = imgURL
        let res = await eventCreate({ startDate, endDate, title, description, numWinners, eventImageUrl })
        if (res.data.res.item) {
            successCount++
        }
    }
    console.log(`Successfully created ${successCount}/${count} Events`)
    console.log(` `)
    //#endregion

    //#region Create Contracts based on the config.js
    console.log(`Adding Test Contracts`)
    successCount = 0

    for (let contract of contracts) {
        let res = await contractCreate(contract)
        if (res.data.res.item) {
            successCount++
        }
    }
    console.log(`Successfully created ${successCount}/${contracts.length} Contract(s)`)
    console.log(` `)
    //#endregion

    //#region Create Configs based on the config.js
    console.log(`Adding Test Configs`)
    successCount = 0

    for (let config of configs) {
        let res = await configCreate(config)
        if (res.data.res.item) {
            successCount++
        }
    }
    console.log(`Successfully created ${successCount}/${configs.length} Config(s)`)
    console.log(` `)
    //#endregion

    //#region Create Test Social
    console.log(`Adding Test Social`)
    successCount = 0
    let social = {
        active: true,
        type: "Twitter",
        post: "TEST POST FOR APETICKETS!",
        ticketsBase: 5,
        ticketsMulti: 5,
        redeemedCount: 0
    }

    let res = await socialCreate(social)
    if (res.data.res.item) {
        successCount++
    }

    console.log(`Successfully created ${successCount}/1 Social`)
    console.log(` `)
    //#endregion

    console.log("Test values have all been added!")
    console.log(` `)
}

const addProdValues = async () => {

    //#region Create Contracts based on the config.js
    console.log(`Adding Test Contracts`)
    successCount = 0

    for (let contract of contracts) {
        let res = await contractCreate(contract)
        if (res.data.res.item) {
            successCount++
        }
    }
    console.log(`Successfully created ${successCount}/${contracts.length} Contract(s)`)
    console.log(` `)
    //#endregion

    //#region Create Configs based on the config.js
    console.log(`Adding Test Configs`)
    successCount = 0

    for (let config of configs) {
        let res = await configCreate(config)
        if (res.data.res.item) {
            successCount++
        }
    }
    console.log(`Successfully created ${successCount}/${configs.length} Config(s)`)
    console.log(` `)
    //#endregion

    //#region Create Test Social
    console.log(`Adding Test Social`)
    successCount = 0
    let social = {
        active: true,
        type: "Twitter",
        post: "Checkout ApeTickets @ grapes.gg/tickets!",
        ticketsBase: 5,
        ticketsMulti: 0,
        redeemedCount: 0
    }

    let res = await socialCreate(social)
    if (res.data.res.item) {
        successCount++
    }

    console.log(`Successfully created ${successCount}/1 Social`)
    console.log(` `)
    //#endregion

    console.log("Test values have all been added!")
    console.log(` `)
}

const run = async () => {

    //let msg = `This function delete all items in AWS Dynamo Table: ${tableName} then redeploy the empty table!`
    let msg = `This function delete all items in AWS Dynamo Table: ${tableName} then redeploy the table, and add test items`
    let confirm = await confirmation(msg)

    if (confirm) {
        //check to see if the table already exists
        let resp = await getTable()
        let checkRes = false
        if (resp != "None") {
            checkRes = true
            console.log(`Table Name:  ${resp}!`)
            tableName = resp

        } else {
            checkRes = false
            console.log("No Valid Table")
        }

        console.log("")

        //if the table exists, delete it.
        if (checkRes) {
            let resItems = await scan(tableName, "")
            let allItems = resItems.Items
            while (resItems.exclusiveStartKey) {
                resItems = await scan(tableName, resItems.exclusiveStartKey)
                allItems = allItems.concat(resItems.Items)
            }
            let deleteRes = await deleteTable(tableName, allItems)
            if (!deleteRes) {
                console.log("Unable to delete table, aborting process")
                return
            }

            console.log("")
        }

        console.log("Choose Prod or Test values")
        //add the test values to the newly created server
        //await addTestValues()

        //adds prod values for launch
        //await addProdValues()

        console.log("")
    } else {
        console.log("Process Aborted")
    }

}

run()