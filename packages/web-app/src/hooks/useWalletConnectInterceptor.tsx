import { useState, useCallback, useEffect } from "react";
import WalletConnect from "@walletconnect/client";
// import { IClientMeta } from "@walletconnect/types";

export const LOCAL_STORAGE_URI_KEY = "aragonAppWcUri";
export const LOCAL_STORAGE_DAO_ADDRESS_KEY = "aragonDAOAddress";

type TransactionContent = {
  to: string;
  data: string;
  value: string;
}

const useWalletConnect = () => {
  const [wcClientData, setWcClientData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Array<string>>([]);
  const [transaction, setTransaction] = useState<TransactionContent | null>(null);
  const [connector, setConnector] = useState<WalletConnect | undefined>();

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
        alert("Connected!")

        wcConnector.approveSession({
          accounts: [daoAddress],
          chainId: network,
        });

        setWcClientData(payload.params[0].peerMeta);
      });

      wcConnector.on("call_request", (error, payload) => {
        if (error) {
          throw error;
        }
        if (payload.method === "eth_sendTransaction") {
          const txInfo = payload.params[0];
          // Add transaction to the Proposal Payload
          let data = txInfo.data || "0x"
          let tx: TransactionContent = { 
            to: txInfo.to,
            value: txInfo.value || "0x0",
            data: txInfo.data || "0x"
          }
          setTransaction(tx)
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

  return { wcClientData, wcConnect, wcDisconnect, transactions, transaction };
};

export default useWalletConnect;
