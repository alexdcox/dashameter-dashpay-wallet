<template>
  <ion-alert
    :is-open="isOpenRef"
    header="Low Credit Balance"
    :sub-header="credits + ' credits remaining'"
    message="Dash Platform uses credits to pay for usage fees. Topup now to keep using your dapps without interuption."
    :buttons="buttons"
    @didDismiss="setOpen(false)"
  >
  </ion-alert>
  <ion-alert
    :is-open="isOpenSuccess"
    header="Success"
    :sub-header="credits + ' credits remaining'"
    message="You topped up your credits and can continue using your dapps."
    :buttons="['Ok']"
    @didDismiss="isOpenSuccess = false"
  >
  </ion-alert>
</template>

<script lang="ts">
import { IonAlert } from "@ionic/vue";
import { defineComponent, ref } from "vue";

import DashClient from "@/lib/Dash";
import {useStore} from "vuex";

export default defineComponent({
  components: { IonAlert },
  setup() {
    const isOpenRef = ref(false);
    const isOpenSuccess = ref(false);

    const store = useStore()
    const identity = store.getters.identityId
    console.log("identity from topup :>> ", identity);
    const credits = '(some credits)';
    console.log("topup identity :>> ", identity);

    const setOpen = (state: boolean) => (isOpenRef.value = state);

    const buttons = [
      {
        text: "Dismiss",
        role: "cancel",
        id: "cancel-button",
      },
      {
        text: "Top Up",
        id: "confirm-button",
        handler: async () => {
          const client = await DashClient.client()
          await client.platform?.identities.topUp(identity.id, 1000);
          isOpenSuccess.value = true;
        },
      },
    ];

    if (identity?.balance <= 100000) setOpen(true);

    return { credits, buttons, isOpenRef, setOpen, isOpenSuccess };
  },
});
</script>
