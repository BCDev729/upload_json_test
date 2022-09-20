import '../styles/globals.css'
import { MainContext } from '../globalContext'
import { WebBundlr } from '@bundlr-network/client'
import { providers, utils, Contract } from 'ethers'
import BigNumber from 'bignumber.js'
import { WagmiConfig, createClient, configureChains, chain } from "wagmi"
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { useState, useEffect } from 'react'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import ContractABI from '../Contract.json'

function MyApp({ Component, pageProps }) {
  
  const [bundlrInstance, setBundlrInstance] = useState()
  const [bundlrBalance, setbundlrBalance] = useState(0)
  const [contract, setContract] = useState()
  const [fileIDs, setFileIDs] = useState([]);

  const { provider } = configureChains(
    [chain.polygonMumbai],
    [
      jsonRpcProvider({ rpc: () => ({ http: 'https://polygon-mumbai.g.alchemy.com/v2/PJX8MpEDhdhw2Nzzxc5bR6rbscbPhaod' }) }),
      publicProvider(),
    ]
  );

  const client = createClient({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({
        chains: [chain.polygonMumbai],
      }),
    ],
    provider,
  })

  async function initBundlrInstance() {
    const webprovider = new providers.Web3Provider(window.ethereum);
    await webprovider._ready();
    const bundlr = new WebBundlr(
        "https://devnet.bundlr.network",
        "matic",
        webprovider,
        {
            providerUrl: 'https://polygon-mumbai.g.alchemy.com/v2/PJX8MpEDhdhw2Nzzxc5bR6rbscbPhaod',
        }
    );
    await bundlr.ready();
    setBundlrInstance(bundlr);
  }
  
  async function fetchBalance() {
    if (bundlrInstance) {
        const bal = await bundlrInstance.getLoadedBalance();
        console.log("bal: ", utils.formatEther(bal.toString()));
        setbundlrBalance(utils.formatEther(bal.toString()));
    }
  }

  function parseInput(input) {
    const conv = new BigNumber(input).multipliedBy(bundlrInstance.currencyConfig.base[1])
    console.log(bundlrInstance.currencyConfig.base[1])
    if (conv.isLessThan(1)) {
        console.log('error: value too small')
        return
    } else {
        return conv
    }
  }

  async function fundWallet(amount) {
    try {
        if (bundlrInstance) {
            if (!amount) return
            const amountParsed = parseInput(amount)
            if (amountParsed) {
                let response = await bundlrInstance.fund(amountParsed)
                console.log('Wallet funded: ', response)
            }
            fetchBalance()
        }
    } catch (error) {
        console.log("error", error);
    }
  }

  async function uploadFile(file) {
    try {
      console.log(bundlrInstance);
        let tx = await bundlrInstance.uploader.upload(file, [{ name: "Content-Type", value: "application/json" }])
        await contract.addFileIDs(tx.data.id);
    } catch (error) {
        console.log(error);
    }
  }
  
  async function initContractInterface(address) {
    if(window.ethereum){
      const webprovider = new providers.Web3Provider(window.ethereum);
      const signer = webprovider.getSigner()
      const contract = new Contract(ContractABI.address, ContractABI.abi, signer)
      setContract(contract)
      await getFileIDs(contract, address);
    }
  }

  async function getFileIDs(contract, address) {
    const files = []
    if(contract) {
      const length = await contract.getFileLength()
      for(let i = 0; i < parseInt(length); i++ ){
        files.push(await contract.IDs(address, i));
      }
      setFileIDs(files)
    }
  }

  useEffect(() => {
    if (bundlrInstance) {
        fetchBalance();
    }
  }, [bundlrInstance])


  return (
    <MainContext.Provider
      value={{
        initBundlrInstance,
        uploadFile,
        bundlrBalance,
        fundWallet,
        initContractInterface,
        fileIDs,
      }}>
      <WagmiConfig client={client}>
        <Component {...pageProps}/>
      </WagmiConfig>
    </MainContext.Provider>
  )
}

export default MyApp
