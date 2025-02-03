import { useEffect, useRef, useState } from "react";
import {
  chainToOption,
  filterChains,
  filteredChains,
  getStoredChainsFromLocalStorage,
  initialGroupedOptions,
  mapChainsToOptions,
  networkIds,
  removeChainFromLocalStorage,
  storeChainInLocalStorage,
} from "./utils";
import { useTheme } from "next-themes";
import Select, { SingleValue, ActionMeta } from "react-select";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { AddCustomChainModal, CustomOption, OtherChainsModal } from "~~/components/NetworksDropdown";
import { useGlobalState } from "~~/services/store/store";
import { lukso } from "~~/services/web3/wagmiConfig";

// Define proper types for the options
interface Option {
  value: number;
  label: string;
  icon?: string;
  testnet?: boolean;
}

export const NetworksDropdown = ({ onChange }: { onChange: (option: Option | null) => void }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const [groupedOptionsState, setGroupedOptionsState] = useState(initialGroupedOptions);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const { addCustomChain, removeChain, resetTargetNetwork, setTargetNetwork, chains } = useGlobalState(state => ({
    addCustomChain: state.addChain,
    removeChain: state.removeChain,
    resetTargetNetwork: () => state.setTargetNetwork(mainnet),
    setTargetNetwork: state.setTargetNetwork,
    chains: state.chains,
  }));

  const seeOtherChainsModalRef = useRef<HTMLDialogElement>(null);
  const customChainModalRef = useRef<HTMLDialogElement>(null);

  const isDarkMode = resolvedTheme === "dark";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateGroupedOptions = () => {
      const storedChains = getStoredChainsFromLocalStorage();
      const newGroupedOptions = { ...groupedOptionsState };

      storedChains.forEach(chain => {
        const groupName = chain.testnet ? "testnet" : "mainnet";
        if (!newGroupedOptions[groupName].options.some(option => option.value === chain.id)) {
          const option = chainToOption(chain);
          newGroupedOptions[groupName].options.push(option);
        }
      });

      setGroupedOptionsState(newGroupedOptions);
    };

    updateGroupedOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addCustomChain]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 640px)");
      setIsMobile(mediaQuery.matches);

      const handleResize = () => setIsMobile(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleResize);
      return () => mediaQuery.removeEventListener("change", handleResize);
    }
  }, []);

  useEffect(() => {
    if (!selectedOption) {
      const defaultOption: Option = {
        value: Number(lukso.id),
        label: lukso.name,
        icon: "/networks/lukso.svg",
      };
      setSelectedOption(defaultOption);
      onChange(defaultOption);
    }
  }, [onChange, selectedOption]);

  const handleNetworkSelect = (newValue: SingleValue<Option>, _actionMeta: ActionMeta<Option>) => {
    if (!newValue) {
      setSelectedOption(null);
      onChange(null);
    } else {
      setSelectedOption(newValue);
      const chain = Object.values(chains).find(chain => chain.id === newValue.value);
      setTargetNetwork(chain as Chain);
      onChange(newValue);
    }
  };

  const handleSelectOtherChainInModal = (option: Option) => {
    const groupName = option.testnet ? "testnet" : "mainnet";
    if (!groupedOptionsState[groupName].options.some(chain => chain.value === option.value)) {
      const newGroupedOptions = { ...groupedOptionsState };
      newGroupedOptions[groupName].options.push(option);
      setGroupedOptionsState(newGroupedOptions);
    }

    const chain = Object.values(filteredChains).find(chain => chain.id === option.value);
    storeChainInLocalStorage(chain as Chain);

    setSelectedOption(option);
    onChange(option);
    if (seeOtherChainsModalRef.current) {
      seeOtherChainsModalRef.current.close();
    }
  };

  const handleDeleteCustomChain = (option: Option) => {
    const chainId = option.value;

    removeChain(chainId);
    removeChainFromLocalStorage(chainId);
    resetTargetNetwork();

    const newGroupedOptions = { ...groupedOptionsState };
    const groupName = option.testnet ? "testnet" : "mainnet";
    newGroupedOptions[groupName].options = newGroupedOptions[groupName].options.filter(
      chain => chain.value !== option.value,
    );

    setGroupedOptionsState(newGroupedOptions);

    if (selectedOption?.value === option.value) {
      const mainnetOption: Option = {
        value: Number(mainnet.id),
        label: mainnet.name,
        icon: "/networks/ethereum.svg",
      };
      setSelectedOption(mainnetOption);
      onChange(mainnetOption);
    }
  };

  const existingChainIds = new Set(
    Object.values(groupedOptionsState)
      .flatMap(group => group.options.map(option => option.value))
      .filter(value => typeof value === "number") as number[],
  );

  const filteredChainsForModal = filterChains(filteredChains, networkIds, existingChainIds);

  const modalChains = mapChainsToOptions(filteredChainsForModal);

  if (!mounted) return <div className="skeleton bg-neutral max-w-xs w-44 relative h-[38px]" />;

  return (
    <>
      <Select<Option>
        value={selectedOption}
        defaultValue={groupedOptionsState["mainnet"].options[0] as Option}
        instanceId="network-select"
        options={Object.values(groupedOptionsState)}
        onChange={handleNetworkSelect}
        components={{ Option: props => <CustomOption {...props} onDelete={handleDeleteCustomChain} /> }}
        isSearchable={!isMobile}
        className="max-w-xs relative text-sm w-44"
        theme={theme => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: isDarkMode ? "#401574" : "#efeaff",
            primary50: isDarkMode ? "#551d98" : "#c1aeff",
            primary: isDarkMode ? "#BA8DE8" : "#551d98",
            neutral0: isDarkMode ? "#130C25" : theme.colors.neutral0,
            neutral80: isDarkMode ? "#ffffff" : theme.colors.neutral80,
          },
        })}
        styles={{
          menuList: provided => ({ ...provided, maxHeight: 280, overflow: "auto" }),
          control: provided => ({ ...provided, borderRadius: 12 }),
          indicatorSeparator: provided => ({ ...provided, display: "none" }),
          menu: provided => ({
            ...provided,
            border: `1px solid ${isDarkMode ? "#555555" : "#a3a3a3"}`,
          }),
        }}
      />
      <OtherChainsModal
        ref={seeOtherChainsModalRef}
        modalChains={modalChains}
        onSelect={handleSelectOtherChainInModal}
      />
      <AddCustomChainModal
        ref={customChainModalRef}
        groupedOptionsState={groupedOptionsState}
        setGroupedOptionsState={setGroupedOptionsState}
        setSelectedOption={setSelectedOption}
        onChange={onChange}
      />
    </>
  );
};
