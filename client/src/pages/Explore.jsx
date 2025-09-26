import React, { useEffect, useState } from "react";
import { useStateContext } from "../context";

const Explore = () => {
  const { getCampaigns, address } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("highest");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allCampaigns = await getCampaigns();
        const activeCampaigns = allCampaigns.filter(
          (campaign) => campaign.owner !== "0x0000000000000000000000000000000000000000"
        );
        setCampaigns(activeCampaigns);
        setFilteredCampaigns(sortCampaigns(filterCampaigns(activeCampaigns, statusFilter), sortOrder));
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getCampaigns]);

  const isExpired = (deadline) => new Date().getTime() > deadline;

  const getProgress = (amountCollected, target) => {
    const collected = parseFloat(amountCollected) || 0;
    const goal = parseFloat(target) || 1;
    return Math.min((collected / goal) * 100, 100);
  };

  // ✅ Fixed Progress Bar Color Logic
  const getProgressBarColor = (campaign) => {
    const collected = parseFloat(campaign.amountCollected) || 0;
    const target = parseFloat(campaign.target) || 1;
    const expired = isExpired(campaign.deadline);

    if (expired) {
      return collected >= target ? "bg-green-500" : "bg-red-500";
    }

    return collected === 0 ? "bg-yellow-500" : "bg-green-500";
  };

  const sortCampaigns = (campaignList, order) => {
    return [...campaignList].sort((a, b) => {
      const donationA = parseFloat(a.amountCollected) || 0;
      const donationB = parseFloat(b.amountCollected) || 0;
      return order === "highest" ? donationB - donationA : donationA - donationB;
    });
  };

  const filterCampaigns = (campaignList, filter) => {
    if (filter === "active") return campaignList.filter((campaign) => !isExpired(campaign.deadline));
    if (filter === "expired") return campaignList.filter((campaign) => isExpired(campaign.deadline));
    return campaignList;
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    setFilteredCampaigns(sortCampaigns(filterCampaigns(campaigns, statusFilter), order));
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setFilteredCampaigns(sortCampaigns(filterCampaigns(campaigns, filter), sortOrder));
  };

  return (
    <div className="p-6 bg-[#13131a] text-white min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Explore Campaigns</h1>

      {/* 🔽 Filters & Sorting Section */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
        <select
          className="p-3 rounded-lg text-black border-2 border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">📌 All Campaigns</option>
          <option value="active">✅ Active Campaigns</option>
          <option value="expired">❌ Expired Campaigns</option>
        </select>

        <select
          className="p-3 rounded-lg text-black border-2 border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortOrder}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="highest">⬆️ Highest Donation</option>
          <option value="lowest">⬇️ Lowest Donation</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-lg">⏳ Loading campaigns...</p>
      ) : filteredCampaigns.length === 0 ? (
        <p className="text-center text-lg">❌ No campaigns found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const expired = isExpired(campaign.deadline);
            const goalReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
            const isOwner = campaign.owner === address;
            const disableDonate = expired || goalReached || isOwner;

            
            const displayedAmount = expired && !goalReached ? "0" : campaign.amountCollected;

            return (
              <div key={campaign.pId} className="bg-[#1c1c24] p-5 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <h2 className="text-2xl font-semibold mb-2">{campaign.title}</h2>
                <p className="text-sm text-gray-300">{campaign.description}</p>
                <p className="mt-3 text-lg font-bold">🎯 Goal: {campaign.target} ETH</p>
                <p className="mt-1 text-lg">
                  💰 Raised:{" "}
                  <span className={goalReached ? "text-green-400" : expired ? "text-red-400" : "text-yellow-400"}>
                    {displayedAmount} ETH
                  </span>
                </p>
                <p className={`mt-2 font-bold ${expired ? "text-red-500" : "text-green-500"}`}>
                  ⏳ Status: {expired ? "Expired" : "Active"}
                </p>

                
                <div className="w-full bg-gray-700 h-5 rounded-md mt-3">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ${getProgressBarColor(campaign)}`}
                    style={{ width: `${getProgress(campaign.amountCollected, campaign.target)}%` }}
                  ></div>
                </div>

                
                <button
                  className={`mt-4 w-full py-2 text-white font-bold rounded-lg transition-all duration-300 ${
                    disableDonate
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                  disabled={disableDonate}
                >
                  {isOwner
                    ? "❌ You Can't Donate To Your Own Campaign"
                    : expired
                    ? "⏳ Campaign Expired"
                    : goalReached
                    ? "🎉 Goal Reached"
                    : "💸 Donate Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Explore;
