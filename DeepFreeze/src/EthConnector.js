const Web3 = require('web3');

 // TODO look up syntax for non-ethereum chains and make this connector code generic to account for different chains as well as different networks

var web3;

const ETH_NET_NAMES = ['main', 'ropsten', 'kovan', 'rinkeby', 'goerli'];

export const detectEthNetwork = async () => {
  try {
    const network = await web3.eth.net.getNetworkType();
    return ETH_NET_NAMES.includes(network) ? network : 'local';
  } catch (err) {
    console.error('Could not detect blockchain network. ' + err);
    return 'unknown';
  }
}

export const isWalletConnected = async () => { 
  if (window.ethereum && web3) {
    return true;
  } 
  return false; 
}

export const getAccounts = async () => {
  const isConnected = await isWalletConnected();

  if (isConnected) {
    return await web3.eth.getAccounts();
  }
}

export const getAccountBalance = async (accountAddress) => {
  const isConnected = await isWalletConnected();

  if (isConnected) {
    let balance = await web3.eth.getBalance(accountAddress);
    balance = balance.toNumber();
    balance = web3.utils.fromWei(balance); // wei -> eth
    return balance;
  }

  return null;
}

/**
 * 
 * @param {JSON string} contractABI 
 * @param {string} contractAddress 
 * 
 * Returns a javascript object interface to call contract functions.
 */
export const getContract = async (contractABI, contractAddress) => {
  const isConnected = await isWalletConnected();

  if (isConnected) {
    return new web3.eth.Contract(contractABI, contractAddress);
  }
  return null;
}

export const getWeb3 = () => web3;

export const init = async () => {
  try {
    await window.ethereum.send('eth_requestAccounts'); // pops up metamask, asking for permission to see account addresses for the current wallet. TODO switch to non-deprecated function 
  } catch (err) {
    console.error(err);
    throw new Error('Wallet connection failed.')
  }
  web3 = new Web3(window.ethereum); // connects to metamask. uses whatever ethereum network it is connected to

  return web3;
};