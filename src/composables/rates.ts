import axios from "axios";
import { strict as assert } from "assert";
import { useStore } from "vuex";
import { computed } from "vue";
import { Preferences } from "@capacitor/preferences";
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const Dashcore = require("@dashevo/dashcore-lib");
import * as Dashcore from '@dashevo/dashcore-lib'
const Unit = Dashcore.Unit;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let isRefreshLoopActive = false;

export default function useRates() {
  const store = useStore();

  const getFiatSymbol = computed(() => store.getters.getFiatSymbol);

  const getFiatRate = computed(() => store.getters.getFiatRate);

  const duffsInDash = computed(() => (duffs: any) => {
    return Unit.fromSatoshis(duffs).toBTC();
  });

  const dashInDuffs = computed(() => (dash: any) => {
    return Unit.fromBTC(dash).toSatoshis();
  });

  const duffsInFiatString = computed(() => (duffs: any) =>
    (
      Unit.fromSatoshis(duffs).toBTC() *
      parseFloat(getFiatRate.value(getFiatSymbol.value).price)
    ).toFixed(2)
  );

  const duffsInFiatNumber = computed(() => (duffs: any) =>
    Unit.fromSatoshis(duffs).toBTC() *
    parseFloat(getFiatRate.value(getFiatSymbol.value).price)
  );

  // const getFiatRate = computed(() => store.getters.getFiatRate);

  async function fetchPairs() {
    const result = await axios.get("https://rates2.dashretail.org/symbols");
    const pairs = result.data
      .filter((pair: string) => pair.substr(0, 4) === "DASH")
      .map((pair: string) => {
        return { pair, fiatSymbol: pair.substr(5, pair.length) };
      })
      .sort((a: any, b: any) => {
        return a.fiatSymbol > b.fiatSymbol;
      });

    // console.log("pairs :>> ", pairs);
    return pairs;
  }

  async function fetchRate(fiatSymbol: string) {
    const result = await axios.get(
      `https://rates2.dashretail.org/rates?source=dashretail&symbol=dash${fiatSymbol}`
    );
    const rate = result.data[0];
    // console.log("rate :>> ", rate);
    return rate;
  }

  async function refreshRate() {
    const rate = await fetchRate(getFiatSymbol.value);

    // console.log("refreshRatesLoop rate :>> ", rate);

    store.commit("setFiatRate", rate);
  }

  async function refreshRatesLoop() {
    if (!isRefreshLoopActive) return;
    // console.log("refreshRatesLoop");
    await refreshRate();

    await sleep(50000);
    refreshRatesLoop();
  }

  async function startRefreshRatesLoop() {
    if (isRefreshLoopActive) return
    isRefreshLoopActive = true;

    const fiatSymbol = (
      await Preferences.get({
        key: `fiatSymbol_${store.getters.myLabel}`,
      })
    ).value;

    // console.log("fiatSymbol :>> ", fiatSymbol);

    store.commit("setFiatSymbol", fiatSymbol || "USD"); // TODO read system default locale

    refreshRatesLoop();
  }

  function stopRefreshRatesLoop() {
    isRefreshLoopActive = false;
  }

  return {
    fetchPairs,
    fetchRate,
    getFiatSymbol,
    getFiatRate,
    duffsInDash,
    dashInDuffs,
    duffsInFiatNumber,
    duffsInFiatString,
    refreshRate,
    startRefreshRatesLoop,
    stopRefreshRatesLoop,
  };
}
