<script lang="ts">
import {ref} from "vue";
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import MnemonicForm from "@/components/MnemonicForm.vue";
import {IonBackButton, IonButtons, IonContent, IonHeader, IonLoading, IonPage, IonTitle, IonToolbar,} from "@ionic/vue";
import Dash from "@/lib/Dash";
import {arrowBack} from "ionicons/icons";

export default {
  name: "RecoverWallet",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonBackButton,
    IonButtons,
    IonLoading,
    MnemonicForm,
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    const isWalletLoading = ref(false);

    const recoverWallet = async (mnemonic: string) => {
      isWalletLoading.value = true;
      store.commit("resetState");
      await Dash.loadWalletFromMnemonic(mnemonic)

      const dpnsDoc = await Dash.dpnsDoc()
      if (dpnsDoc) {
        store.commit("setAccountDPNS", dpnsDoc.toJSON());
        store.commit("setDPNS", dpnsDoc);
      }

      store.commit("setIsMnemonicBackedUp", true); // User recovered from mnemonic, so it's backed up
      if (!store.getters.myOwnerId || !store.getters.myLabel) {
        router.push("/choosename");
      } else {
        router.push("/choosepassword");
      }
      isWalletLoading.value = false;
    };

    return {
      recoverWallet,
      router,
      isWalletLoading,
      arrowBack,
    };
  },
};
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-no-border">
        <ion-buttons slot="start"
        >
          <ion-back-button
              style="color: #6c69fc"
              :icon="arrowBack"
          ></ion-back-button
          >
        </ion-buttons>
        <ion-title class="title">Add an existing wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <MnemonicForm @mnemonicEntered="recoverWallet"></MnemonicForm>
      <ion-loading :is-open="isWalletLoading" message="Loading Wallet...">
      </ion-loading>
    </ion-content>
    <!-- <ion-footer class="ion-no-border">
      <ion-toolbar>
        <ion-button color="tertiary" @click="recoverWallet()" expand="block">Next</ion-button>
      </ion-toolbar>
    </ion-footer> -->
  </ion-page>
</template>
