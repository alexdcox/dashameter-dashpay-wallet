<script lang="ts">
import {ref} from "vue";
import UnlockSvg from '../..//public/assets/icons/unlock.svg'
import {
  IonPage,
  IonToolbar,
  IonContent,
  IonChip,
  IonAvatar,
  IonInput,
  IonItem,
  IonFooter,
  IonIcon,
  IonLoading,
  modalController,
} from "@ionic/vue";

import Dash from "@/lib/Dash";

import {useRouter} from "vue-router";
import {useStore} from "vuex";
import useWallet from "@/composables/wallet";

import AccountStorage, {LocalAccount} from "@/lib/helpers/AccountStorage";

import {closeOutline} from "ionicons/icons";
import crypto from "crypto";
import CryptoJS from "crypto-js";

export default {
  name: "ChoosePassword",
  components: {
    IonToolbar,
    IonContent,
    IonPage,
    IonFooter,
    IonChip,
    IonInput,
    IonItem,
    IonIcon,
    IonAvatar,
    IonLoading,
  },
  data() {
    return {UnlockSvg}
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const {myBalance} = useWallet();
    const formPassword = ref('');
    const checkMessage = ref("");
    const isNextClicked = ref(false);
    const {getUserLabel, getUserAvatar} = store.getters;
    const showLoader = ref(false);

    const cancel = () => {
      modalController.dismiss();
    };

    const checkPassword = async () => {
      console.log('@checkPassword')

      if (formPassword.value.trim() === '') {
        return
      }

      showLoader.value = true;
      isNextClicked.value = true;

      const client = await Dash.client()
      const mnemonic = String(client.wallet?.exportWallet())

      const accountRecord = new LocalAccount({
        name: store.getters.myLabel || store.state.wishName,
        identityId: store.getters.myOwnerId,
        encMnemonic: CryptoJS.AES.encrypt(mnemonic, formPassword.value).toString(),
        isNameRegistered: store.getters.myLabel !== undefined,
      })

      const ok = await AccountStorage.store(accountRecord)
      if (!ok) {
        showLoader.value = false
        isNextClicked.value = false
        return
      }

      checkMessage.value = "Wallet saved on device";

      setTimeout(() => {
        // We recovered a mnemonic, we don't need to backup the mnemonic
        if (store.state.isMnemonicBackedUp) {
          // The recovered mnemonic already has a dpns entry, go straight to home screen
          if (store.getters.myLabel) router.push("/home");
          // The recovered mnemonic is missing an identity or dpns entry, finish registration or redeem invite first
          else if (myBalance.value > 1e5) {
            router.push("/finishregistration");
          } else {
            router.push("/redeeminvite");
          }
        }

        // We registered a new account, we must backup the mnemonic
        else {
          router.push("/backupmnemonic");
        }
        showLoader.value = false;
      }, 1200);
    };

    return {
      getUserLabel,
      getUserAvatar,
      formPassword,
      checkPassword,
      isNextClicked,
      checkMessage,
      closeOutline,
      cancel,
      router,
      showLoader,
    };
  },
};
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="flex ion-nowrap ion-padding-bottom">
        <ion-icon
            :icon="closeOutline"
            class="close"
            @click="router.push('choosename')"
        ></ion-icon>
        <div class="unlock">Choose Password</div>
      </div>

      <ion-avatar slot="start" class="avatar">
        <!-- <img :src="store.getters.getUserAvatar(pass in account chosen as prop)" /> -->
      </ion-avatar>

      <ion-item class="ion-margin-top password" lines="none">
        <form @submit.prevent>
          <ion-input
              v-model="formPassword"
              enterkeyhint="next"
              placeholder="Enter password"
              show-clear-button="never"
              type="password"
              @keyup.enter="checkPassword"
          >
          </ion-input>
        </form>
      </ion-item>
      <div>
        <ion-icon
            class="lock"
            :src="UnlockSvg"
        />
      </div>
    </ion-content>
    <ion-footer class="ion-no-border">
      <!-- <ion-toolbar>
        <ion-title>{{ checkMessage }}</ion-title>
      </ion-toolbar> -->
      <ion-toolbar>
        <ion-chip
            expand="block"
            class="nextbutton next-color"
            :disabled="isNextClicked"
            @click="checkPassword()"
        ><span class="next-text">Next</span></ion-chip
        >
      </ion-toolbar>
    </ion-footer>
    <ion-loading :is-open="showLoader" :message="'Initializing Wallet'">
    </ion-loading>
  </ion-page>
</template>

<style scoped>
.avatar {
  width: 85px;
  height: 85px;
}

ion-input {
  --padding-start: 12px; /* did not work, so used css class below */
  /* --width: 400px; */
  height: 45px;
  --background: #f5f5f7;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  border-radius: 10px;
}

ion-item.sc-ion-input-md-h:not(.item-label),
ion-item:not(.item-label) .sc-ion-input-md-h {
  --padding-start: 12px;
  width: 296px;
}

.lock {
  position: absolute;
  left: 156px;
  top: 394px;
  width: 48px;
  height: 62px;
}

.password {
  margin-top: 150px;
}
</style>
