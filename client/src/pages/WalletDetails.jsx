import React from 'react';
import { useStateContext } from '../context';
import { CustomButton } from '../components';
import { useNavigate } from 'react-router-dom';

const WalletDetails = () => {
  const { address, contract } = useStateContext();
  const walletPlatform = "MetaMask"; 
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center p-6 bg-[#1c1c24] rounded-[10px] max-w-lg mx-auto mt-10">
      <h2 className="text-white text-2xl font-semibold">Payment Details</h2>
      <p className="text-gray-400 text-sm mt-2">Wallet ID: <span className="text-white">{address}</span></p>
      <p className="text-gray-400 text-sm">Wallet Platform: <span className="text-white">{walletPlatform}</span></p>
      <CustomButton 
        btnType="button"
        title="Go Back"
        styles="mt-4 w-full bg-gray-600 hover:bg-gray-700"
        handleClick={() => navigate(-1)}
      />
    </div>
  );
};

export default WalletDetails;
