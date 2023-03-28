const dotenv = require('dotenv');
dotenv.config();

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const ethNetwork = process.env.RINKEBY_RPC;
const web3 = createAlchemyWeb3(ethNetwork);

const coinABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        'constant': false,
        'inputs': [
            {
                'name': '_to',
                'type': 'address'
            },
            {
                'name': '_value',
                'type': 'uint256'
            }
        ],
        'name': 'transfer',
        'outputs': [
            {
                'name': '',
                'type': 'bool'
            }
        ],
        "type": "function"
    }
];

exports.getTotalRellaCoin = async (tokenHolder) => {

    const contract = new web3.eth.Contract(coinABI, process.env.RELLA_COIN_TOKEN_ADDRESS);

    const result = await contract.methods.balanceOf(tokenHolder).call(); // 29803630997051883414242659

    // Convert the value from Wei to Ether
    const formattedResult = web3.utils.fromWei(result, "ether"); // 29803630.997051883414242659

    return formattedResult;
}

exports.sendRellaCoinTo = async (_toAddress, _amount) => {

    const contract = new web3.eth.Contract(coinABI, process.env.RELLA_COIN_TOKEN_ADDRESS, { from: process.env.RELLA_COIN_CREATOR});

    let amount = web3.utils.toWei(_amount); //1 Token
    let data = contract.methods.transfer(_toAddress, amount).encodeABI();

    let txObj = {
        gas: web3.utils.toHex(100000),
        "to": process.env.RELLA_COIN_TOKEN_ADDRESS,
        "value": "0x00",
        "data": data,
        "from": process.env.RELLA_COIN_CREATOR
    }
    return await web3.eth.accounts.signTransaction(txObj, process.env.RINKEBY_PK, (err, signedTx) => {
        if (err) {
            console.log(err)
            return callback(err)
        } else {
            console.log(signedTx)
            return web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(res)
                }
            })
        }
    })

}