import {LoginRequired} from 'containers/walletMenu/LoginRequired';
import {useWallet} from 'hooks/useWallet';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useNavigate} from 'react-router-dom';

import {useGlobalModalContext} from './globalModals';

const LoginMenuContext = createContext<LoginMenuContextType | null>(null);

type LoginMenuContextType = {
  showLoginModal: boolean;
  handleCloseLoginModal: () => void;
  handleOpenLoginModal: () => void;
  userWentThroughLoginFlowRef?: React.MutableRefObject<boolean>;
  web3ModalWasShownRef?: React.MutableRefObject<boolean>;
};

type LoginMenuProviderProps = {
  daoId: string;
};

const LoginMenuProvider: React.FC<LoginMenuProviderProps> = ({children}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const {open, close} = useGlobalModalContext();

  const navigate = useNavigate();
  const {
    address,
    status,
    isOnWrongNetwork,
    isModalOpen: web3ModalIsShown,
  } = useWallet();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleCloseLoginModal = useCallback(() => {
    setShowLoginModal(false);

    // navigate back to the page the user came from
    navigate(-1);
  }, [navigate]);

  /*************************************************
   *                     Effects                   *
   *************************************************/
  // The following hook and effects manage a seamless journey from login ->
  // switch network -> authentication. The appropriate modals are shown in
  // such a way to minimize user interaction
  const userWentThroughLoginFlowRef = useRef(false);
  const web3ModalWasShownRef = useRef(false);

  // a weird state happens when the web3Modal has been closed
  // by the user without logging in. The status is set to
  // "connecting" instead of "disconnected". Regardless, this
  // state set to be the same as the user closing the LoginRequired
  // modal manually [FF-07/03/2023]
  useEffect(() => {
    if (
      status === 'connecting' &&
      !showLoginModal &&
      !web3ModalIsShown &&
      web3ModalWasShownRef.current
    )
      navigate(-1);
  }, [navigate, showLoginModal, status, web3ModalIsShown]);

  useEffect(() => {
    // show the wallet menu only if the user hasn't gone through the flow previously
    // and is currently logged out; this allows user to log out mid flow with
    // no lasting consequences considering status will be checked upon proposal creation
    // If we want to keep user logged in (I'm in favor of), remove ref throughout component
    // Fabrice F. - [12/07/2022]
    if (!address && userWentThroughLoginFlowRef.current === false) {
      setShowLoginModal(true);
    } else {
      if (isOnWrongNetwork) open('network');
      else close('network');
    }
  }, [address, close, isOnWrongNetwork, open]);

  // close the LoginRequired modal when web3Modal is shown
  useEffect(() => {
    if (web3ModalIsShown) setShowLoginModal(false);
  }, [close, web3ModalIsShown]);

  const value = useMemo(
    (): LoginMenuContextType => ({
      showLoginModal,
      handleOpenLoginModal: () => setShowLoginModal(true),
      handleCloseLoginModal,
      userWentThroughLoginFlowRef,
      web3ModalWasShownRef,
    }),
    [showLoginModal, handleCloseLoginModal]
  );

  return (
    <LoginMenuContext.Provider value={value}>
      {children}
      <LoginRequired isOpen={showLoginModal} onClose={handleCloseLoginModal} />
    </LoginMenuContext.Provider>
  );
};

function useLoginMenuContext(): LoginMenuContextType {
  return useContext(LoginMenuContext) as LoginMenuContextType;
}

export {useLoginMenuContext, LoginMenuProvider};
