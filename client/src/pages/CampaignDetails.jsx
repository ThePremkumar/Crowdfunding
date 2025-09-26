import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, deleteCampaign, contract, address } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // Track if user is admin

  // Admin Check (Option 1: Hardcoded Admin Address)
  const adminAddress = "0x1C0FDDBa3a77d6C1ece9b319a5810bDc66911711"; // Replace with actual admin wallet
  useEffect(() => {
    setIsAdmin(address === adminAddress);
  }, [address]);


  // Calculate remaining days
  let remainingDays = daysLeft(state.deadline);
  const isCampaignExpired = remainingDays <= 0; // Campaign has ended

  useEffect(() => {
    if (contract) fetchDonators();
  }, [contract, address]);

  const fetchDonators = async () => {
    if (!contract) return;
    const data = await getDonations(state.pId);
    setDonators(data);
  };

  const handleDonate = async () => {
    if (!contract) {
      console.error("Contract is not initialized.");
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      console.error("Invalid donation amount.");
      return;
    }

    setIsLoading(true);

    try {
      await donate(state.pId, amount);
      navigate('/');
    } catch (error) {
      console.error("Donation failed", error);
    }

    setIsLoading(false);
  };

  // Handle Campaign Deletion (Only Campaign Owner)
  const handleDelete = async (pId) => {
    if (address !== state.owner) {
      alert("Only the campaign owner can delete this campaign!");
      return;
    }

    try {
      await deleteCampaign(pId);
      alert("Campaign deleted successfully!");
      navigate('/');
    } catch (error) {
      console.error("Failed to delete campaign", error);
    }
  };

  return (
    <div className="p-5">
      {isLoading && <Loader />}

      <div className="w-full flex flex-col md:flex-row mt-10 gap-6">
        <div className="flex-1 flex flex-col bg-[#1c1c24] p-5 rounded-lg shadow-lg">
          <img 
            src={state.image} 
            alt="campaign" 
            className="w-full h-[410px] object-cover rounded-lg shadow-md"
          />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2 rounded-lg">
            <div className="absolute h-full bg-[#4acd8d]" 
                 style={{ width: `${calculateBarPercentage(state.target, state.amountCollected)}%`, maxWidth: '100%' }}>
            </div>
          </div>
        </div>

        <div className="md:w-[200px] w-full flex flex-col gap-4 p-4 rounded-lg items-center">
          <CountBox title={isCampaignExpired ? "Ended" : "Days Left"} value={isCampaignExpired ? "0" : remainingDays} />
          <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} />
          <CountBox title="Total Backers" value={donators.length} />
          
          {/* Show Campaign ID only for Admin */}
          {isAdmin && (
            <div className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-md shadow-md">
              Campaign ID: {state.pId}
            </div>
          )}
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <h4 className="font-epilogue font-semibold text-[20px] text-white uppercase">Story</h4>
          <h1 className="font-epilogue font-bold text-[18px] text-white">{state.title}</h1>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{state.description}</p>

          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>
          <div className="mt-[20px] flex flex-col gap-4">
            {donators.length > 0 ? donators.map((item, index) => (
              <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px]">{index + 1}. {item.donator}</p>
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">{item.donation}</p>
              </div>
            )) : (
              <p className="font-epilogue font-normal text-[16px] text-[#808191]">No donators yet. Be the first one!</p>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Fund</h4>   

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="text-center text-[#808191]">Fund the campaign</p>
            <br />

            <input 
              type="number"
              placeholder="ETH 0.001"
              className="w-full py-[10px] px-[15px] border bg-transparent text-white rounded-[10px]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={state.owner === address}
            />
            <br/>

            <CustomButton 
              btnType="button"
              title={isCampaignExpired ? "Campaign Expired" : state.amountCollected >= state.target ? "Campaign is Over" : state.owner === address ? "You can't fund your own campaign" : "Fund Campaign"}
              styles={`w-full py-3 px-6 font-semibold text-white rounded-lg transition duration-300 ${
                isCampaignExpired || state.amountCollected >= state.target || state.owner === address
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[#8c6dfd] hover:bg-[#7a5be3]"
              }`}
              handleClick={handleDonate}
              disabled={isCampaignExpired || state.amountCollected >= state.target || state.owner === address}
/>
          </div>
        </div>
      </div>

      {/* Show Delete Button Only for Campaign Owner */}
      {address === state.owner && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => handleDelete(state.pId)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold shadow-lg transition duration-300">
            Delete Campaign
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;
