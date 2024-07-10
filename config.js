
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
        traitType: "Tier",
        traitValue: "1",
        forEach: true,
        quantMin: 1,
        quantMax: "",
        ticketsBase: 75,
        ticketsMulti: 0,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Tier",
        traitValue: "2",
        forEach: true,
        quantMin: 1,
        quantMax: "",
        ticketsBase: 30,
        ticketsMulti: 0,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Tier",
        traitValue: "3",
        forEach: true,
        quantMin: 1,
        quantMax: "",
        ticketsBase: 20,
        ticketsMulti: 0,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Tier",
        traitValue: "4",
        forEach: true,
        quantMin: 1,
        quantMax: "",
        ticketsBase: 12,
        ticketsMulti: 0,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Tier",
        traitValue: "5",
        forEach: true,
        quantMin: 1,
        quantMax: "",
        ticketsBase: 6,
        ticketsMulti: 0,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Tier",
        traitValue: "6",
        forEach: true,
        quantMin: 1,
        quantMax: "",
        ticketsBase: 4,
        ticketsMulti: 0,
        listed: false,
    },
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        type: "Trait",
        traitType: "Tier",
        traitValue: "7",
        forEach: true,
        quantMin: 1,
        quantMax: "",
        ticketsBase: 1,
        ticketsMulti: 0,
        listed: false,
    },

]

//Test Contracts
let contracts = [
    {
        contractAddress: "0x9697745c6d279FAc17203756E40dEe4D2DbB6E39",
        active: true,
        name: "Grapes",
    },
]

module.exports = { attDeff, keySchema, configs, contracts }