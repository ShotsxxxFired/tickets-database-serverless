
//Attribute Definitions for create table (Tickets)
const attDeff = [
    {
        AttributeName: "PK",
        AttributeType: "S",
    },
    {
        AttributeName: "SK",
        AttributeType: "S",
    },
]

//Key Schema for create table (Tickets)
const keySchema = [
    {
        AttributeName: "PK",
        KeyType: "HASH",
    },
    {
        AttributeName: "SK",
        KeyType: "RANGE",
    },
]

//Test configs
let configs = [
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Origin",
        traitValue: "ATS",
        quantMin: 1,
        quantMax: "",
        ticketsBase: 11,
        ticketsMulti: 11,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Tier",
        traitValue: "2",
        quantMin: 1,
        quantMax: "",
        ticketsBase: 10,
        ticketsMulti: 10,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Tier",
        traitValue: "3",
        quantMin: 1,
        quantMax: "",
        ticketsBase: 10,
        ticketsMulti: 10,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Fur",
        traitValue: "Gold",
        quantMin: 1,
        quantMax: "",
        ticketsBase: 10,
        ticketsMulti: 10,
        listed: false,
    },
]

//Test Contracts
let contracts = [
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        active: true,
    },
]

module.exports = { attDeff, keySchema, configs, contracts }