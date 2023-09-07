<script lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {IonList, IonListHeader} from "@ionic/vue";
import AccountStorage, {LocalAccount} from "@/lib/helpers/AccountStorage";
import AccountItem from "./AccountItem.vue";
import {useStore} from "vuex";

export default {
  name: "AccountList",
  components: {IonList, AccountItem, IonListHeader},
  setup() {
    const router = useRouter();
    const store = useStore();

    const isAccountItemOpen = ref(false);
    const accounts = ref<LocalAccount[]>();
    const areProfilesLoading = ref(true);

    onMounted(async () => {
      // TODO onMounted is not called after signing up a new account and open the the account switcher via the avatar menu
      console.log("AccountList onMounted");
      await refreshAccountList()
    })

    const showAccountItem = async (state = true) => {
      isAccountItemOpen.value = state;
    }

    const refreshAccountList = async () => {
      const accountList = await AccountStorage.list()
      if (!accountList.length) {
        return await router.replace("/welcome");
      }
      accounts.value = accountList
      console.log('accounts:', accountList)
      const ownerIds = accounts.value.map((x: LocalAccount) => x.identityId).filter(id => id !== undefined)
      console.log("account ownerIds", ownerIds);
      await store.dispatch("fetchDashpayProfiles", {ownerIds, forceRefresh: true});
      areProfilesLoading.value = false;
    }
    return {
      accounts,
      isAccountItemOpen,
      showAccountItem,
      areProfilesLoading,
    };
  },
};
</script>

<template>
  <ion-list class="ion-no-padding">
    <ion-list-header class="accounts ion-no-padding ion-align-items-center">
      Accounts
    </ion-list-header>
    <!-- <ion-modal
      :is-open="isAccountItemOpen"
      @didDismiss="showAccountItem(false)"
    > -->
    <AccountItem
        v-for="account in accounts"
        :key="account.encMnemonic"
        :account="account"
        :areProfilesLoading="areProfilesLoading"
        @click="$emit('selectAccount', account)"/>
    <!-- </ion-modal> -->
  </ion-list>
</template>

<style scoped>
.accounts {
  /* font-family: Inter; */
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 17px;
  color: #636363;
  display: flex;
  align-items: flex-end;
}
</style>
