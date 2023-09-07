import {Client} from "dash";

enum DIRECTION {
  SENT = "sent",
  RECEIVED = "received",
  MOVED = "moved",
}

interface ResolvedTransaction {
  external: number;
  internal: number;
  outputAmount: number;
  transferDirection: string | null;
  transferSatoshis: number;
  misc?: any;
  remoteAddress: string;
}

const resolveTransaction = function(client: Client, transaction: any) {
  const outputs = transaction.outputs;

  console.log("outputs :>> ", outputs);

  const resolvedTransaction: ResolvedTransaction = {
    external: 0,
    internal: 0,
    outputAmount: transaction.outputAmount,
    transferDirection: null,
    transferSatoshis: 0,
    remoteAddress: "",
  };

  outputs.forEach((output: any) => {
    // TODO: Hard-coded network should be variable
    const address = output.script.toAddress("testnet").toString();
    const isMine = client.wallet!.storage.searchAddress(address, false); // TODO 2 parameter should be optional

    console.log("isMine :>> ", isMine);

    if (isMine.type) resolvedTransaction[isMine.type] += output.satoshis;
    else {
      resolvedTransaction.remoteAddress = address;
    }
  });

  if (resolvedTransaction.external === 0) {
    // We sent Dash to remote address
    resolvedTransaction.transferDirection = DIRECTION.SENT;

    resolvedTransaction.transferSatoshis =
      resolvedTransaction.outputAmount - resolvedTransaction.internal;
  } else if (resolvedTransaction.internal === 0) {
    // We received Dash from remote address
    resolvedTransaction.transferDirection = DIRECTION.RECEIVED;

    resolvedTransaction.transferSatoshis = resolvedTransaction.external;
  } else {
    // Internal transfer within the wallet
    resolvedTransaction.transferDirection = DIRECTION.MOVED;

    resolvedTransaction.transferSatoshis =
      resolvedTransaction.outputAmount - resolvedTransaction.internal;
  }

  return resolvedTransaction;
};

export { resolveTransaction, DIRECTION };
