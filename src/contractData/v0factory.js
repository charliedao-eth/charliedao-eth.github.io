export const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "hint_",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "password_",
				"type": "bytes32"
			}
		],
		"name": "createDeepFreeze",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "creatorOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "deployedFreezer",
		"outputs": [
			{
				"internalType": "contract DeepFreeze",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userFreezer",
		"outputs": [
			{
				"internalType": "contract DeepFreeze",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export const addresses = { // TODO extend to other chains
	local: "0x426Ea59829bD35c262A0e8F1a2d8A23e35CbB7E8",
	kovan: "0x84BeC65FAdd027f86A4D20058A5FBE12EC4362DA",
	rinkeby: "0xd271f1eafe25a46da6c1c00d38bc443d940e6bc5",
	main: "", // TBD
}

export default {
	abi,
	addresses,
}