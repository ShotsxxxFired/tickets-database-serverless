import { Alchemy, Network } from "alchemy-sdk"

const alchemyAPI = process.env.TICKETS_ALCHEMY_API;

const config = { apiKey: alchemyAPI, network: Network.ETH_MAINNET }
const alchemy = new Alchemy(config)

export async function getHolderTickets(wallet, contracts) {

    try {
        //contracts becomes [{ Address: ContractAddress, Configs: ListConfigs, NFTs: ListNFTS }]

        let contractNFTs = await getNFTHoldings(wallet, contracts)
        let user = { Wallet: wallet, Contracts: contractNFTs.data, Tickets: { Base: 0, Multi: 0 } }

        //Iterate through the contracts
        for (let contract of user.Contracts) {
            //Itterate through each config for the contract
            for (let config of contract.configs) {
                //check to see if the NFTs owned match the config.
                let valid = await configNFTMatch(contract.NFTs, config)
                if (valid.success) {
                    //Add tickets + multi to the user object if their NFTs match the config
                    if (config.ForEach) {
                        user.Tickets.Base += (config.TicketsBase * valid.count)
                        user.Tickets.Multi += (config.TicketsMulti * valid.count)
                    } else {
                        user.Tickets.Base += config.TicketsBase
                        user.Tickets.Multi += config.TicketsMulti
                    }
                }
            }
        }
        //return the list of wallets w/ ticket totals
        return { success: true, Wallet: user.Wallet, Tickets: user.Tickets };
    } catch (error) {
        console.log(error)
        return { Success: false, message: error };
    }
}

const getNFTHoldings = async (wallet, contractAddresses) => {
    let res = { success: false, message: "", data: "" }

    try {
        for (let contract of contractAddresses) {
            let options = {
                contractAddresses: [contract.address],
            }
            let response = await alchemy.nft.getNftsForOwner(wallet, options)
            nfts = response.ownedNfts
            while (response.pageKey) {
                options.pageKey = response.pageKey
                response = await alchemy.nft.getNftsForOwner(wallet, options)
                nfts = nfts.concat(response.ownedNfts)
            }
            contract.NFTs = nfts
        }

        res = { success: true, message: "Found NFTS", data: contractAddresses }
        return res
    } catch (error) {
        console.log(error)
        res = { success: false, message: "Unable to find NFTs", data: "" }
        return res
    }
}

const configNFTMatch = async (nfts, config) => {
    let countValid = 0
    if (config.ConfigType == "Trait") {
        for (let nft of nfts) {
            let traits = nft.raw.metadata.attributes
            for (let trait of traits) {
                if (trait.trait_type == config.TraitType && trait.value == config.TraitValue) {
                    countValid++
                }
            }
        }

        if (config.QuantMin <= countValid && config.QuantMax >= countValid || config.QuantMin <= countValid && config.QuantMax == "" || config.QuantMin <= countValid && config.QuantMax == 0) {
            return { success: true, count: countValid }
        } else {
            return { success: false, count: countValid }
        }
    } else if (config.ConfigType == "Count") {
        let count = nfts.length
        if (config.QuantMin <= count && config.QuantMax >= count || config.QuantMin <= count && config.QuantMax == "" || config.QuantMin <= count && config.QuantMax == 0) {
            return { success: false, count: countValid }
        } else {
            return { success: false, count: countValid }
        }
    }
}