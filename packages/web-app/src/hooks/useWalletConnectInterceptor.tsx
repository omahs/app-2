import { useState, useCallback, useEffect } from "react";
import WalletConnect from "@walletconnect/client";
// import { IClientMeta } from "@walletconnect/types";
import {MinimalTransactionInput} from "utils/types";

export const LOCAL_STORAGE_URI_KEY = "aragonAppWcUri";
export const LOCAL_STORAGE_DAO_ADDRESS_KEY = "aragonDAOAddress";

type WalletConnectPeerMeta = {
  description: string;
  icons: string[];
  name: string;
  url: string;
}

const useWalletConnect = () => {
  const [wcClientData, setWcClientData] = useState<any>(null);
  const [peerMeta, setPeerMeta] = useState<WalletConnectPeerMeta | null>(null);
  const [connector, setConnector] = useState<WalletConnect | undefined>();
  const [transactions, setTransactions] = useState<Array<MinimalTransactionInput>>([]);

  const wcDisconnect = useCallback(async () => {
    connector?.killSession();
    localStorage.removeItem(LOCAL_STORAGE_URI_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DAO_ADDRESS_KEY);
    setConnector(undefined);
    setWcClientData(null);
  }, [connector]);

  const wcConnect = useCallback(
    async (uri: string, daoAddress: string) => {
      const network = 5;

      const wcConnector = new WalletConnect({
        uri,
        storageId: uri,
        clientMeta: {
          description: "Aragon WalletConnect",
          url: "https://aragon.org",
          icons: ["https://walletconnect.org/walletconnect-logo.png"],
          name: "Aragon",
        },
      });
      setConnector(wcConnector);
      setWcClientData(wcConnector.peerMeta);
      localStorage.setItem(LOCAL_STORAGE_URI_KEY, uri);
      localStorage.setItem(LOCAL_STORAGE_DAO_ADDRESS_KEY, daoAddress);

      wcConnector.on("session_request", (error, payload) => {
        if (error) {
          throw error;
        }
        console.log('The payload is: ', payload.params[0].peerMeta)
        setPeerMeta(payload.params[0].peerMeta)

        wcConnector.approveSession({
          accounts: [daoAddress],
          chainId: network,
        });
      });

      wcConnector.on("call_request", (error, payload) => {
        if (error) {
          throw error;
        }
        if (payload.method === "eth_sendTransaction") {
          const txInfo = payload.params[0];
          // Add transaction to the Proposal Payload
          let tx: MinimalTransactionInput = { 
            id: payload.id,
            to: txInfo.to || '0x0',
            value: txInfo.value || '0x0',
            data: txInfo.data || '0x'
          }
         
          setTransactions(txs => [...txs, tx])
          console.log('Transaction received: ', payload)
        }
      });

      wcConnector.on("disconnect", (error, payload) => {
        if (error) {
          throw error;
        }
        wcDisconnect();
      });
    },
    [wcDisconnect]
  );

  useEffect(() => {
    if (!connector) {
      const uri = localStorage.getItem(LOCAL_STORAGE_URI_KEY);
      const daoAddress = localStorage.getItem(LOCAL_STORAGE_DAO_ADDRESS_KEY);
      if (uri && daoAddress) wcConnect(uri, daoAddress);
    }
  }, [connector, wcConnect]);

  return { wcClientData, wcConnect, wcDisconnect, transactions, peerMeta };
};

export default useWalletConnect;
