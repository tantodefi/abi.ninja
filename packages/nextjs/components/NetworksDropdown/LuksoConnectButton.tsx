import { FC } from 'react';
import { useLuksoConnection } from '~~/hooks/useLuksoConnection';

export const LuksoConnectButton: FC = () => {
  const { isConnected, connect, disconnect, address } = useLuksoConnection();

  if (!isConnected) {
    return (
      <button
        className="bg-primary text-white px-4 py-2 rounded-lg"
        onClick={connect}
      >
        Connect LUKSO
      </button>
    );
  }

  return (
    <button
      className="bg-primary text-white px-4 py-2 rounded-lg"
      onClick={disconnect}
    >
      {address?.slice(0, 6)}...{address?.slice(-4)}
    </button>
  );
}; 