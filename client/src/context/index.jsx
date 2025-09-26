import React, { useContext, createContext, useEffect, useState } from 'react'; 
import { useAddress, useContract, useMetamask, useDisconnect, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract('0xf7B9Cd11558C65BB1627aB9d96179612EA12CA8D'); 
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useMetamask();
  const disconnect = useDisconnect();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (address) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [address]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to connect.");
      return;
    }

    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect to MetaMask", error);
    }
  };

  const disconnectWallet = () => {
    try {
      disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const publishCampaign = async (form) => {
    if (!contract) {
      console.error("Contract is not initialized");
      return;
    }

    if (!address) {
      console.error("User wallet is not connected");
      return;
    }

    try {
      const data = await createCampaign({
        args: [
          address,
          form.title,
          form.description,
          form.target,
          new Date(form.deadline).getTime(),
          form.image,
        ],
      });

      console.log("Contract call success", data);
    } catch (error) {
      console.error("Contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    if (!contract) return [];

    try {
      const campaigns = await contract.call('getCampaigns');

      return campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
        image: campaign.image,
        pId: i
      }));
    } catch (error) {
      console.error("Error fetching campaigns", error);
      return [];
    }
  };

  const getUserCampaigns = async () => {
    if (!address) {
      console.error("User wallet is not connected");
      return [];
    }

    const allCampaigns = await getCampaigns();
    return allCampaigns.filter((campaign) => campaign.owner.toLowerCase() === address.toLowerCase());
  };

  const donate = async (pId, amount) => {
    if (!contract) {
      console.error("Contract is not initialized");
      return;
    }

    if (!address) {
      console.error("User wallet is not connected");
      return;
    }

    try {
      const transaction = await contract.call('donateToCampaign', [pId], {
        value: ethers.utils.parseEther(amount),
      });

      return transaction;
    } catch (error) {
      console.error("Donation failed", error);
      throw error;
    }
  };

  const getDonations = async (pId) => {
    if (!contract) return [];

    try {
      const donations = await contract.call('getDonators', [pId]);
      const numberOfDonations = donations[0].length;

      return donations[0].map((donator, i) => ({
        donator,
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      }));
    } catch (error) {
      console.error("Error fetching donations", error);
      return [];
    }
  };

 
  const deleteCampaign = async (pId) => {
    if (!contract) {
      console.error("Contract is not initialized.");
      return;
    }

    try {
      const transaction = await contract.call("deleteCampaign", [pId]);
      await transaction.wait(); // Wait for the transaction to be confirmed
      console.log("Campaign deleted successfully!");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      throw error;
    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        isConnected,
        connect: connectWallet,
        disconnect: disconnectWallet,
        contract,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        deleteCampaign,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
