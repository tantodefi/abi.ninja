import { useQuery } from "@tanstack/react-query";
import { fetchContractABI } from "~~/utils/abi";

const useFetchContractAbi = ({ contractAddress, chainId }: { contractAddress: string; chainId: number }) => {
  const { data: contractData, error, isLoading } = useQuery({
    queryKey: ["contractAbi", contractAddress, chainId],
    queryFn: async () => {
      if (!contractAddress) return null;
      return fetchContractABI(contractAddress, chainId);
    },
    enabled: Boolean(contractAddress),
    retry: 0,
  });

  return {
    contractData,
    error,
    isLoading,
    implementationAddress: contractData?.implementation || null,
  };
};

export default useFetchContractAbi;
