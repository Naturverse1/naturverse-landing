
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function ConnectWallet() {
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask is not installed!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setWalletAddress(accounts[0]);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    };
    checkWallet();
  }, []);

  return (
    <div className="text-center mt-4">
      {walletAddress ? (
        <div className="text-green-600 font-semibold">
          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all"
        >
          Connect Wallet
        </button>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
