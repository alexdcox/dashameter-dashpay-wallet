import {computed, ref} from "vue";
import Dash from "@/lib/Dash";
import useRates from "@/composables/rates";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import {Unit} from '@dashevo/dashcore-lib'
import {debounce} from "@/lib/Util";

let isRefreshLoopActive = false;
let refreshLoopInterval: any
const myBalance = ref(0);
const myTransactionHistory = ref();

export default function useWallet() {
  const {getFiatSymbol, getFiatRate} = useRates();
  const myDashBalance = computed(() =>
    Unit.fromSatoshis(myBalance.value).toBTC()
  );

  const myFiatBalance = computed(() => {
    return (
      Unit.fromSatoshis(myBalance.value).toBTC() *
      parseFloat(getFiatRate.value(getFiatSymbol.value).price)
    ).toFixed(2);
  });

  async function refreshTransactionHistory() {
    const account = await Dash.account()


    //   .map((tx: any) => {
    //   if (tx.time === -1) tx.time = 999999999; // TODO remove this hack when unconfirmed time correction is merged upstream
    //   return tx;
    // });



    //     .map((tx: any) => {
    //     console.log("tx", tx);
    //     // resolveTransaction(getClient(), tx);
    //   });
    //   console.log("transactionHistory.value :>> ", myTransactionHistory.value);
  }

  // const transactionDisplay = (transaction: any) => {
  //   console.log("transaction :>> ", transaction);
  //   let txDisplay = "";
  //   switch (transaction.transferDirection) {
  //     case DIRECTION.SENT:
  //       txDisplay = `Sent ${transaction.transferSatoshis} to ${transaction.remoteAddress}`;

  //       if (transaction.remoteAddress === "false")
  //         txDisplay = `Identity TopUp of ${transaction.transferSatoshis}`;
  //       break;
  //     case DIRECTION.RECEIVED:
  //       txDisplay = `Received ${transaction.transferSatoshis} from ${transaction.remoteAddress}`;
  //       break;
  //     case DIRECTION.MOVED:
  //       txDisplay = `Internal transfer of ${transaction.transferSatoshis}`;
  //       break;

  //     default:
  //       break;
  //   }

  // return myTransactionHistory;
  // }

  async function refreshWalletDataLoop() {
    if (!isRefreshLoopActive) return;
    // console.log("refreshWalletDataLoop");

    const account = await Dash.account()
    myBalance.value = account?.getTotalBalance();
    // console.log("balance.value :>> ", myBalance.value);

    myTransactionHistory.value = account.getTransactionHistory();
    // console.log("transactionHistory.value :>> ", myTransactionHistory.value);
  }

  async function startRefreshWalletDataLoop() {
    // assert(!isRefreshLoopActive, "Error: Wallet refresh loop already running!");
    if (isRefreshLoopActive) return;
    isRefreshLoopActive = true;
    console.log("[wallet] START DATA LOOP");
    refreshLoopInterval = setInterval(refreshWalletDataLoop, 3000)
  }

  function stopRefreshWalletDataLoop() {
    console.log("[wallet] STOP DATA LOOP");
    isRefreshLoopActive = false;
    clearInterval(refreshLoopInterval)
  }

  return {
    startRefreshWalletDataLoop,
    stopRefreshWalletDataLoop,
    // transactionDisplay,
    myTransactionHistory,
    myBalance,
    myDashBalance,
    myFiatBalance,
  };
}
