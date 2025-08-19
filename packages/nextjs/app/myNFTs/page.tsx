"use client";

import { useEffect, useState } from "react";
import { MyHoldings } from "./_components";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { addToIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import nftsMetadata from "~~/utils/simpleNFT/nftsMetadata";

const MyNFTs: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { address: connectedAddress, isConnected, isConnecting } = useAccount();

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "YourCollectible",
  });

  const { data: tokenIdCounter } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "tokenIdCounter",
    watch: true,
  });

  const handleMintItem = async () => {
    if (tokenIdCounter === undefined) return;

    const tokenIdCounterNumber = Number(tokenIdCounter);
    const currentTokenMetaData = nftsMetadata[tokenIdCounterNumber % nftsMetadata.length];
    const notificationId = notification.loading("Uploading to IPFS");

    try {
      const uploadedItem = await addToIPFS(currentTokenMetaData);

      // Remove previous loading notification and show success
      notification.remove(notificationId);
      notification.success("Metadata uploaded to IPFS");

      await writeContractAsync({
        functionName: "mintItem",
        args: [connectedAddress, uploadedItem.path],
        value: parseEther("0.01"), // Enviar 0.01 ETH al contrato
      });
    } catch (error) {
      notification.remove(notificationId);
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">My NFTs</span>
          </h1>
        </div>
      </div>

      <div className="flex justify-center">
        {!isMounted ? null : !isConnected || isConnecting ? (
          <RainbowKitCustomConnectButton />
        ) : (
          <button className="btn btn-secondary" onClick={handleMintItem}>
            Mint Nft PAME
          </button>
        )}
      </div>

      <MyHoldings />
    </>
  );
};

export default MyNFTs;
