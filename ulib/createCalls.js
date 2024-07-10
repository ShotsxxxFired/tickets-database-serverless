//import axios from "axios";
//import 'dotenv/config'
require('dotenv').config()
const axios = require("axios")


const baseURL = "https://l8akeu03b7.execute-api.us-east-1.amazonaws.com/prod/"
const apiKey = "AwBeB8uXzK5fPtOG39P7S4ZbvNKaa11O1bcnCfSC";

const eventCreate = async (event) => {
    let { startDate, endDate, title, description, eventImageUrl, numWinners } = event
    try {
        const options = {
            method: "post",
            url: `${baseURL}event`,
            data: {
                startDate,
                endDate,
                title,
                description,
                eventImageUrl,
                numWinners,
            },
            headers: {
                accept: 'application/json',
                'x-api-key': apiKey
            }
        }
        const response = await axios(options)
        if (!response.data.res.item) {
            console.log(response.data)
        }
        return response
    } catch (error) {
        console.log("ERROR")

        console.log(error)

        return error
    }
}

const contractCreate = async (contract) => {
    let { contractAddress, active, name } = contract
    try {
        const options = {
            method: "post",
            url: `${baseURL}contractconfig`,
            data: {
                contractAddress,
                active,
                name
            },
            headers: {
                accept: 'application/json',
                'x-api-key': apiKey
            }
        }
        const response = await axios(options)
        if (!response.data.res.item) {
            if (response.data.res.name != 'ConditionalCheckFailedException') {
                console.log(response.data)
            } else {
                console.log("Contract already exists!")
            }
        }
        return response
    } catch (error) {
        console.log(error)
        return error
    }
}

const configCreate = async (config) => {
    let { contractAddress, type, traitType, traitValue, quantMin, quantMax, ticketsBase, ticketsMulti, listed, forEach } = config
    try {
        const options = {
            method: "post",
            url: `${baseURL}collectionconfig`,
            data: {
                contractAddress,
                type,
                traitType,
                forEach: forEach,
                traitValue,
                quantMin,
                quantMax,
                ticketsBase,
                ticketsMulti,
                contractAddress,
                listed,
            },
            headers: {
                accept: 'application/json',
                'x-api-key': apiKey
            }
        }
        const response = await axios(options)
        if (!response.data.res.item) {
            console.log(response.data)
        }
        return response
    } catch (error) {
        console.log(error)
        return error
    }
}

const socialCreate = async (social) => {
    let { active, site, post, ticketsBase, ticketsMulti, redeemedCount } = social
    try {
        const options = {
            method: "post",
            url: `${baseURL}social`,
            data: {
                active,
                site,
                post,
                ticketsBase,
                ticketsMulti,
                redeemedCount
            },
            headers: {
                accept: 'application/json',
                'x-api-key': apiKey
            }
        }
        const response = await axios(options)
        if (!response.data.res.item) {
            console.log(response.data)
        }
        return response
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = { eventCreate, contractCreate, configCreate, socialCreate }