<template>
  <div class="scroll_container">
    <div>
      <ion-grid class="ion-no-padding">
        <!-- TODO replace idx with tx hash -->
        <ion-row
          v-for="transaction in transactionHistoryWithMeta"
          :key="transaction.txId"
          class="row_padding"
        >
          <ion-col class="ion-padding-horizontal">
            <div
              v-if="transaction._chipDate"
              class="flex ion-justify-content-center"
            >
              <ion-chip class="timestamp_chip ion-text-center"
                ><ion-label class="timestamp_label">
                  {{ transaction._chipDate }}
                </ion-label></ion-chip
              >
            </div>
            <legacy-payment-content
              :transaction="transaction"
            ></legacy-payment-content>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  </div>
</template>

<script lang="ts">
import { IonChip, IonLabel, IonGrid, IonRow, IonCol } from "@ionic/vue";
import LegacyPaymentContent from "@/components/Chat/LegacyPayments/LegacyPaymentContent.vue";
import useWallet from "@/composables/wallet";
import { useStore } from "vuex";
import { watchEffect, computed } from "vue";
import { msgDate } from "@/lib/helpers/Date";

export default {
  components: {
    IonChip,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    LegacyPaymentContent,
  },
  setup() {
    const store = useStore();
    const { myTransactionHistory, myBalance } = useWallet();

    const transactionHistoryWithMeta = computed(() => {
      const chatsWithMeta = [];
      const txs = myTransactionHistory?.value?.slice().reverse();
      for (let i = 0; i < txs.length; i++) {
        const transaction = txs[i];
        // console.log("transaction", transaction);
        let chipDate = msgDate(transaction.time * 1000);

        const previousTransaction: any = chatsWithMeta[i - 1];
        const previousChipDate = previousTransaction
          ? msgDate(previousTransaction?.time * 1000)
          : undefined;

        // console.log("chipDate :>> ", chipDate);
        // console.log("previousChipDate :>> ", previousChipDate);
        // console.log("chatsWithMeta :>> ", chatsWithMeta);
        // console.log("previousTransaction :>> ", previousTransaction);

        if (previousChipDate === chipDate) {
          chipDate = "";
        }

        chatsWithMeta.push({
          ...transaction,
          _chipDate: chipDate,
        });
      }
      // console.log("chatsWithMeta", chatsWithMeta);
      return chatsWithMeta;
    });

    // Mark msgs as read
    watchEffect(() => {
      if (!(myTransactionHistory.value.length > 0)) return;

      const lastTimestamp = myTransactionHistory.value[0].time;

      console.log(
        "watch effect loop myTransactionHistory.value[0].time :>> ",
        myTransactionHistory.value[0].time
      );

      // TODO loop through to txs and find first confirmed time
      if (myTransactionHistory.value[0].time === "999999999") return;

      store.commit("setLastSeenChatTimestampByOwnerId", {
        lastTimestamp,
        friendOwnerId: "legacy",
      });

      store.dispatch("saveLastSeenChatTimestamps");
    });
    return {
      myTransactionHistory,
      transactionHistoryWithMeta,
    };
  },
};
</script>

<style scoped>
.scroll_container {
  height: 100%;
  display: flex;
  overflow-y: scroll;
  flex-direction: column-reverse;
}
</style>
