import React, { useEffect, useState } from "react";

import logo from "./logoWhite.png";
import {FaQuestionCircle} from "react-icons/fa";
import './App.scss';

import {
  getAccounts,
  getAccountBalance,
  detectEthNetwork,
  init,
} from './EthConnector';
import DeepFreezeContractInterface from "./DeepFreezeContractInterface";

const CREATE_VIEW = "create_view";
const FREEZER_VIEW = "FREEZER_view";

function App() {
  const [connectedAccountAddress, setConnectedAccountAddress] = useState("");
  const [view, setView] = useState(CREATE_VIEW);
  const [freezers, setFreezers] = useState([]);
  const [dfci, setDfci] = useState(null); // DeepFreezeContractInterface
  
  const killFormSubmit = (evt) => { evt.preventDefault(); /* Suppress submission. Handle buttons instead*/ }

  async function connectWallet() {
    try {
      const web3 = await init();
      const accounts = await getAccounts();
      const account = accounts[0];
      const ethNetwork = await detectEthNetwork();

      setConnectedAccountAddress(account);
      setDfci(await createContractInterface(web3, account, ethNetwork));            
    } catch (err) {
      console.error(err);
      window.alert("Wallet connection failed."); // remove if annoying. TODO replace with html popup
      throw new Error("Wallet connection failed.");
    }
  }

  async function createContractInterface(web3Instance, sendAccountAddress, ethNetwork) {  
    const dfci = new DeepFreezeContractInterface(web3Instance, sendAccountAddress, ethNetwork);

    window.dfci = dfci; // for console debugging
    window.debugWeb3 = web3Instance; // for console debugging

    return dfci;
  }

  function submitCreateForm(evt) {
    evt.preventDefault(); // don't submit the form unintentionally
    
    const creatationForm = new FormData(document.getElementById("createForm"));
    const hint = creatationForm.get("hint"); // by name attribute
    const password = creatationForm.get("password"); // by name attribute
    if(password.length !== 64) {
      alert("Your hash should be 64 characters long.");
      throw new Error("Invalid keccck-256 hash.");
    }
    dfci.createFreezer(hint, password);            
  }

  useEffect(() => {
    if(!dfci) {
      return; // short circuit if rendering before wallet connection
    }

    const fetchData = async () => {
      const data = await dfci?.getFreezers();
      if(!data) {
        throw new Error("Failed to load freezers. No data returned.")
      }
      setFreezers(data);
    }

    fetchData().catch((err) => {
      console.error(err);
      alert("Could not load your freezers.");
    });
  }, [dfci, view]); // if dfci changes (because the user pressed the connect wallet button), run the function inside useEffect

  return (
    <div className="deepfreeze-root">
      <div className="light-section">
        <div className="logo">
          <img src={logo} alt="Deep Freeze Logo"/>
        </div>
        <div className="wallet-info">
          <span>{connectedAccountAddress}</span>
          <button className="connect-wallet" onClick={connectWallet}>Connect wallet</button>
        </div>
        <div className="form" onSubmit={killFormSubmit}>
          <tabs>
            <tab onClick={() => setView(CREATE_VIEW)} className={view === CREATE_VIEW ? "selected" : ""}>Create freezer</tab>
            <tab onClick={() => setView(FREEZER_VIEW)} className={view === FREEZER_VIEW ? "selected" : ""}>My freezers</tab>
          </tabs>
          <form className={view} id="createForm" onSubmit={killFormSubmit}>
            {
              view === CREATE_VIEW ? (
                <React.Fragment>           
                  <input title={!dfci ? "Connect your wallet first" : ""} disabled={!dfci} name="hint" placeholder="Hint (optional)" type="text" maxLength="160" required/>
                  <input title={!dfci ? "Connect your wallet first" : ""} disabled={!dfci} name="password" placeholder="Hashed password" type="password" required />
                  <div className="howToHash"><FaQuestionCircle/>&nbsp;<a href="#todo">How to securely hash your password</a></div>
                  <button title={!dfci ? "Connect your wallet first" : ""} disabled={!dfci} className="submit" onClick={submitCreateForm}>Create freezer</button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {freezers?.length > 0 ?
                    freezers.map((freezer) => (
                      <freezer>
                        <div>   
                          {/*TODO currency icons */}                     
                          <h2>{freezer.balance || "error"}</h2>                  
                          <button className="withdrawButton" onClick={() => {
                            const unhashedPassword = window.prompt("Enter your unhashed password to withdraw all funds then destroy this freezer.")
                            dfci.withdraw(freezer, unhashedPassword);
                          }}>Withdraw all</button>
                        </div>
                        <div>
                          {/*TODO currency icons */}
                          <input className="depositAmount" name="depositAmount" placeholder="Amount" type="number" />
                          <button className="depositButton" onClick={(evt) => dfci.deposit(freezer, evt.target.previousSibling.value)}>Deposit</button>{/* Previous sibling is a fraaile way to do this. Don't feel like hooking up more state*/}
                        </div>
                      </freezer>
                    ))
                    :
                    <h3>You have no freezers yet.</h3>
                  }
                </React.Fragment>
              )
            }        
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
