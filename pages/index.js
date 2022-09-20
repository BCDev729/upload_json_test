import Head from 'next/head'
import { MainContext } from '../globalContext'
import { useContext, useEffect, useRef, useState } from 'react'
import { useConnect,useAccount } from 'wagmi'

export default function Home() {
  const { initBundlrInstance,uploadFile, bundlrBalance,fundWallet,initContractInterface, fileIDs} = useContext(MainContext)
  const [jsonFile, setJsonFile] = useState('')
  const [file, setFile] = useState()
  const [number, setNumber] = useState(0)
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const hiddenFileInput = useRef(null);

  function onFileChange(e) {
      const file = e.target.files[0]
      if (file) {
          const json = URL.createObjectURL(file)
          setJsonFile(json)
          let reader = new FileReader()
          reader.onload = function () {
              if (reader.result) {
                  setFile(Buffer.from(reader.result))
              }
          }
          reader.readAsArrayBuffer(file)
      }
  }
  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  const handleUpload = async () => {
    await uploadFile(file);
  }

  const initBundlr = async () => {
    await initBundlrInstance();
  }

  const addBundlr = async () => {
    await fundWallet(number);
  }

  useEffect(() => {
    console.log(isConnected, address);
    if(address){
      initContractInterface(address)
    }
  },[address])

  return (
    <div>
      <Head>
        <title>Upload Json</title>
        <meta
          name="description"
          content="Upload Json using Arweave and Polygon"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='flex flex-row justify-end px-4 py-4 '>
        <></>
        {connectors.map((connector) => (
          <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="inline-flex items-center px-4 py-2 border shadow-sm text-base text-white font-medium rounded-md bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
            >
              {
                isConnected 
                ?
                'Wallet Connected'
                :
                'Connect Wallet'
              }
            </button>
          ))}
      </div>
      <div className='flex flex-row justify-between px-4 py-4 '>
        <div className='justify-center items-center px-4 py-2 border border shadow-sm text-base text-white font-medium rounded-md bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300'>
          <button onClick={initBundlr}>
             Init Bundlr
          </button>
        </div>
        <div>Bundlr Balance: {bundlrBalance} Matic</div>
        <div className='flex flex-row justify-between items-center'>
          <input type='number' value={number} onChange={e => setNumber(e.target.value)} className='px-2 py-2 border border-2 rounded-md focus:outline-none'/>
          <div className='mx-2 px-4 py-2 border border shadow-sm text-base text-white font-medium rounded-md bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300'>
            <button onClick={addBundlr}>
              Add Bundlr Fund
            </button>
          </div>
        </div>
        
      </div>
      <div className='flex flex-row justify-around px-4 py-4 '>
      <div className='flex flex-col justify-center items-center px-4 py-2 border border shadow-sm text-base text-white font-medium rounded-md bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300'>
            <button onClick={handleClick}>
                {jsonFile ? 'Change Selection' : 'Select Json File'}
            </button>
            <input
                accept="application/json"
                type="file"
                ref={hiddenFileInput}
                onChange={onFileChange}
                style={{ display: 'none' }}
            />
        </div>
        <div className='flex flex-col justify-center items-center px-4 py-2 border border shadow-sm text-base text-white font-medium rounded-md bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300'>
          <button onClick={handleUpload}>
             Upload File
          </button>
        </div>
      </div>
      <div className='flex flex-col justify-center px-4 py-4'>
        {fileIDs.map((file) => (
          <>
            <a href={`https://arweave.net/${file}`} key={file} target="_blank">{file}</a>
          </>
        ))}
      </div>
    </div>
  )
}
