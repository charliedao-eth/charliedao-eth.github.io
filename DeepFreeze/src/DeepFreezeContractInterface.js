// an interface to the web 3 js contract objects. handles type conversion, errors, etc 
// so that the front end doesn't need to know about blockchain concepts. it can just call these plain functions
import {abi as factoryAbi, addresses} from "./contractData/v0factory";
import freezerAbi from "./contractData/v0freezer";

const MAX_LIVE_FREEZERS = 100; // don't fetch or display more than X freezers on the UI

export default class DeepFreezeContractInterface {

    constructor (web3, sendAddress, ethNetwork) {
        this.web3 = web3;
        this.sendAddress = sendAddress;
        if (!addresses[ethNetwork]) {
            const errMsg = "Deep Freeze is not deployed on this network: " + ethNetwork;
            window.alert(errMsg);
            throw new Error(errMsg);
        }
        this.freezerFactoryContract = new web3.eth.Contract(factoryAbi, addresses[ethNetwork]);
    }

    makeFreezerContract(contractAddress) { // one per each freezer instance
        return new this.web3.eth.Contract(freezerAbi, contractAddress);
    }


    // CONTRACT METHODS

    createFreezer (hint, hashedPassword) {
        hashedPassword = "0x" + hashedPassword;        
        this.freezerFactoryContract.methods.createDeepFreeze(hint, hashedPassword).send({ from: this.sendAddress }); // don't await this. TODO wait for event when transaction is confirmed      
    }
    async getFreezer (index) {            
        const freezerAddress = await this.freezerFactoryContract.methods.userFreezer(this.sendAddress, index).call({from: this.sendAddress});
        return  {
            freezerAddress,
            contract: this.makeFreezerContract(freezerAddress),
        };
    }

    async getFreezers (omitDestroyedFreezers = true) {
        let freezerAddressesToReturn = [],
            endOfArrayReached = false,
            iterator = 0;             
        while(freezerAddressesToReturn.length < MAX_LIVE_FREEZERS && !endOfArrayReached) { // could be `while(true)`, but this prevents unlikely infinite loop error cases where web 3 js isn't throwing errors on failed calls
            try {
                let freezer = await this.getFreezer(iterator);
                const isFreezerLive = await this.isFreezerLive(freezer);
                if(!omitDestroyedFreezers || isFreezerLive) { // filter out "dead" freezers
                    freezerAddressesToReturn.push(freezer); 
                    freezer.balance = await this.getBalance(freezer);
                }
                iterator += 1;
            } catch (err) {
                endOfArrayReached = true; // break loop
            }
        }
        return freezerAddressesToReturn;       
    }

    // freezer methods
    async getBalance(freezer) {
        const balance = await freezer.contract.methods.getBalance().call();
        return this.web3.utils.fromWei("" + balance).substring(0,9); // force conversion to string. cap length to 9 digits
    }
    deposit(freezer, amountInEth) {
        const amountInWei = this.web3.utils.toWei(amountInEth + "");
        freezer.contract.methods.deposit().send({ from: this.sendAddress, value: amountInWei }); // don't await this. TODO wait for event when transaction is confirmed
    }
    withdraw(freezer, unhashedPassword) {
        freezer.contract.methods.withdraw(unhashedPassword).send({ from: this.sendAddress }); // don't await this. TODO wait for event when transaction is confirmed
    }        
    async isFreezerLive(freezer) {
        try {
            const freezerOwner = await freezer.contract.methods.FreezerOwner().call();
            if (freezerOwner?.substring(2) == 0) { // "0x000000..." -> "000000". then in javascript "000000" == 0 -> true, via number coercion from string. any other hex value coerces to NaN. NaN == 0 -> false
                return false; // owner of 0x0... is self-destructed
            }
        } catch (err) {
            console.warn(err); // this seems to be throwing errors for any self-destructed freezer. treat the error as destroyed, for now.
            return false;
        }
        return true;
    }
    async requestHint(freezer) {
        return await freezer.contract.methods.requestHint().call();
    }
    async requestHashedPassword(freezer) {
        return await freezer.contract.methods.requestKey().call();
    }
};