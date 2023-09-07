import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

import Welcome from "@/views/Welcome.vue";
import CreateWallet from "@/views/CreateWallet.vue";
import RecoverWallet from "@/views/RecoverWallet.vue";
import FinishRegistration from "@/views/FinishRegistration.vue";
import RedeemInvite from "@/views/RedeemInvite.vue";
import Home from "@/views/HomeView.vue";
import SendDash from "@/views/SendDash.vue";
import ReceiveDash from "@/views/ReceiveDash.vue";
import ChooseName from "@/views/ChooseName.vue";
import ChoosePassword from "@/views/ChoosePassword.vue";
import BackupMnemonic from "@/views/BackupMnemonic.vue";
import ContactSearch from "@/views/ContactSearch.vue";
import ContactProfile from "@/views/ContactProfile.vue";
import Conversation from "@/views/Conversation.vue";
import ChatLegacyPayment from "@/components/Chat/LegacyPayments/ChatLegacyPayment.vue";
import Settings from "@/views/Settings.vue";
import ChooseAccount from "@/views/ChooseAccount.vue";
import EditProfile from "@/views/EditProfile.vue";
import Device from "@/views/Device.vue";

import Autologin from "@/views/Autologin.vue";
import {useStore} from "vuex"; // TODO deploy: remove, this is for dev only

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/welcome",
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/welcome",
  },
  // {
  //   path: "/device",
  //   component: Device,
  // },
  {
    path: "/:catchAll(.*)",
    redirect: "/welcome",
  },
  {
    path: "/welcome",
    component: Welcome,
  },
  {
    path: "/createwallet",
    component: CreateWallet,
  },
  {
    path: "/recoverwallet",
    component: RecoverWallet,
  },
  {
    path: "/finishregistration",
    component: FinishRegistration,
  },
  {
    path: "/redeeminvite",
    component: RedeemInvite,
  },
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/senddash",
    component: SendDash,
  },
  {
    path: "/receivedash",
    component: ReceiveDash,
  },
  {
    path: "/choosename",
    component: ChooseName,
  },
  {
    path: "/choosepassword",
    component: ChoosePassword,
  },
  {
    path: "/backupmnemonic",
    component: BackupMnemonic,
  },
  {
    path: "/contactsearch",
    component: ContactSearch,
  },
  {
    path: "/profile/:friendOwnerId",
    component: ContactProfile,
    name: "ContactProfile",
    props: true,
    children: [
      {
        path: "",
        component: () => import("@/views/friends.vue"),
        props: true,
      },
      {
        path: "friends",
        component: () => import("@/views/friends.vue"),
        props: true,
      },
      {
        path: "sharedFriends",
        component: () => import("@/views/sharedFriends.vue"),
        props: true,
      },
    ],
  },
  {
    path: "/profile/:friendOwnerId/friends",
    component: ContactProfile,
    props: {
      filteredUserFriends: "filteredUserFriends",
    },
  },
  {
    path: "/conversation/:friendOwnerId",
    component: Conversation,
    name: "Conversation",
    props: true,
  },
  {
    path: "/legacy",
    component: ChatLegacyPayment,
  },
  {
    path: "/settings",
    component: Settings,
  },
  {
    path: "/chooseaccount",
    component: ChooseAccount,
  },
  {
    path: "/editprofile",
    component: EditProfile,
  },
  {
    // TODO remove for production
    path: "/autologin",
    component: Autologin,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _, next) => {
  const dontRedirect = [
    '/',
    '/welcome',
    '/chooseaccount',
  ]
  if (dontRedirect.includes(to.path)) {
    return next()
  }
  if (!useStore().state.accountDPNS) {
    return next({path: "/chooseaccount"});
  }
  return next()
})

export default router;
