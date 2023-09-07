<script lang="ts">
import NewaccountSvg from '../../public/assets/icons/newaccount.svg'
import AddwalletSvg from '../../public/assets/icons/addwallet.svg'
import LogoutSvg from '../../public/assets/icons/logout.svg'
import CryptoJS from 'crypto-js'

import {computed, Ref, ref} from "vue";
import {useRouter} from "vue-router";
import {useStore} from "vuex";

import AccountList from "@/components/Login/AccountList.vue";
import PasswordPromptModal from "@/components/Login/PasswordPromptModal.vue";

import {
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLoading,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";

import {arrowBack} from "ionicons/icons";
import Dash from "@/lib/Dash";
import AccountItem from "@/components/Login/AccountItem.vue";
import {LocalAccount} from "@/lib/helpers/AccountStorage";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  name: "ChooseAccount",
  components: {
    AccountList,
    PasswordPromptModal,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonPage,
    IonFooter,
    IonModal,
    IonLoading,
  },
  data() {
    return {
      NewaccountSvg,
      AddwalletSvg,
      LogoutSvg,
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const isAccountOpen = ref(false);
    const password = ref("");
    const accounts = ref([]);
    const selectedAccount = ref<LocalAccount>();
    const showLoader = ref(false);
    const showAccountModal = (state: boolean) => (isAccountOpen.value = state);

    function selectAccount(account: LocalAccount) {
      store.commit("resetStateKeepDashpayProfiles");
      selectedAccount.value = account;
      console.log("selectedAccount.value :>> ", selectedAccount.value);
      store.commit("setWishName", account.name);
      showAccountModal(true);
    }

    const recoverWallet = async (mnemonic: string) => {
      // console.log("logged in with mnemonic :>> ", client?.wallet?.exportWallet());
      // const account = client.account as any;
      // console.log("balance :>> ", balance);
      // console.log("client.wallet.exportWallet() :>> ", client.wallet?.exportWallet());
      // console.log("logging in from localStorage");
      // console.log("selectedAccount.value :>> ", selectedAccount.value);
      // const [identityId] = await account.identities.getIdentityIds();
      // TODO TEMP this is a work around for slow testnet
      // const identityId = selectedAccount.value.accountDPNS.$ownerId;
      // console.log("identityId :>> ", identityId);

      await Dash.loadWalletFromMnemonic(mnemonic)
      const dpnsDoc = await Dash.dpnsDoc()
      if (dpnsDoc) {
        if (dpnsDoc) {
          store.commit("setAccountDPNS", dpnsDoc.toJSON());
          store.commit("setDPNS", dpnsDoc);
          store.commit("resetStateKeepAccountDPNS");

          store.dispatch("loadLastSeenChatTimestamps");
          store.dispatch("fetchDashpayProfiles", {ownerIds: [store.state.accountDPNS.$ownerId]});

          router.push("/home");
        } else {
          router.push("/finishregistration");
        }
      } else {
        const account = await Dash.account()
        const balance = account.getTotalBalance();
        if (balance > 0) {
          router.push("/finishregistration");
        } else {
          router.push("/redeeminvite");
        }
      }
      selectedAccount.value = undefined;
    };

    const decryptMnemonic = async function() {
      showLoader.value = true;
      // const account = await Dash.account()
      // const mnemonic = account.decrypt("aes", selectedAccount.value?.encMnemonic, password.value)
      const mnemonic = CryptoJS.AES.decrypt(selectedAccount.value?.encMnemonic, password.value).toString(CryptoJS.enc.Utf8)
      try {
        await recoverWallet(mnemonic)
      } catch(e) {
        console.error(e)
        throw 'Password invalid'
      } finally {
        showLoader.value = false;
      }
      showAccountModal(false)
    };

    const createAccount = async () => {
      store.commit("resetStateKeepDashpayProfiles");
      router.push("/choosename");
    };

    const addAccount = async () => {
      store.commit("resetStateKeepDashpayProfiles");
      router.push("/recoverwallet");
    };
    const logout = () => {
      store.commit("resetStateKeepDashpayProfiles");
      Dash.disconnect()
    };

    const isLoggedIn = computed(() => !!store.state.accountDPNS);

    return {
      isLoggedIn,
      logout,
      recoverWallet,
      router,
      accounts,
      selectedAccount,
      selectAccount,
      password,
      decryptMnemonic,
      arrowBack,
      createAccount,
      addAccount,
      isAccountOpen,
      showAccountModal,
      showLoader,
    };
  },
};
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-no-border">
        <ion-buttons slot="start" >
          <ion-icon
              v-if="isLoggedIn"
              class="back"
              :icon="arrowBack"
              @click="router.push('/home')"
          ></ion-icon>
        </ion-buttons>
        <ion-title class="headername">Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding-start">
      <AccountList @selectAccount="selectAccount"/>
      <ion-modal :is-open="isAccountOpen" @didDismiss="showAccountModal(false)">
        <PasswordPromptModal
            v-model="password"
            :account="selectedAccount"
            @decryptMnemonic="decryptMnemonic"
        />
      </ion-modal>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding-horizontal ion-padding-bottom">
      <div>
        <div class="newaccount" @click="createAccount">
          <ion-icon
              :src="NewaccountSvg"
              class="add"
          ></ion-icon>
          Create new account
        </div>
        <div class="newaccount" @click="addAccount">
          <ion-icon
              :src="AddwalletSvg"
              class="add"
          ></ion-icon>
          Add an existing wallet
        </div>
      </div>
      <ion-toolbar v-if="isLoggedIn">
        <div class="flex ion-nowrap ion-align-items-center" @click="logout">
          <ion-icon
              :src="LogoutSvg"
              class="logout"
          ></ion-icon>
          <div class="logout-text">Log out</div>
        </div>
      </ion-toolbar>
    </ion-footer>
    <ion-loading :is-open="showLoader" :message="'Initializing Wallet'">
    </ion-loading>
  </ion-page>
</template>

<style scoped>
ion-header {
  padding-left: 0px;
  background-color: #ffffff;
  border: none;
}

ion-toolbar {
  --background: primary;
}

.newaccount {
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.003em;
  color: #000000;
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.add {
  height: 25px;
  width: 25px;
  /* display: flex;
  align-items: center; */
  margin-right: 13px;
}

.logout {
  height: 29px;
  width: 29px;
  margin-left: 3px;
}

.logout-text {
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.003em;
  color: #6c69fc;
  margin-left: 10px;
}
</style>
