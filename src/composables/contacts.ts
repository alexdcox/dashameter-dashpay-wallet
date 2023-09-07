import {computed} from "vue";
import Dash from "@/lib/Dash";
import {useStore} from "vuex";

let isRefreshLoopActive = false;

export default function useContacts() {
  const store = useStore();

  const getUserPublicMessage = computed(
    () => store.getters.getUserPublicMessage
  );

  const getUserDisplayName = computed(() => store.getters.getUserDisplayName);
  const getUserLabel = computed(() => store.getters.getUserLabel);
  const getUserAvatar = computed(() => store.getters.getUserAvatar);
  const getMyFriends = computed(() => store.getters.getMyFriends);
  const getSuggestedFriends = computed(() => store.getters.getSuggestedFriends);
  const myLabel = computed(() => store.getters.myLabel);
  const myAvatar = computed(() => store.getters.myAvatar);
  const myDisplayName = computed(() => store.getters.myDisplayName);
  const myPublicMessage = computed(() => store.getters.myPublicMessage);
  const myOwnerId = computed(() => store.getters.myOwnerId);

  const storeDashpayProfile = async (profile: any) => {
    const client = await Dash.client()
    const identity = await Dash.identity()

    const existingProfile = store.state.dashpayProfiles[myOwnerId.value];

    interface DocumentBatch {
      create: any[];
      replace: any[];
      delete: any[];
    }

    const documentBatch: DocumentBatch = {
      create: [],
      replace: [],
      delete: [],
    };

    if (existingProfile) {
      existingProfile.data = {...existingProfile.data, ...profile};
      documentBatch.replace.push(existingProfile);
    } else {
      const document = await client.platform?.documents.create("dashpay.profile", identity, profile);
      documentBatch.create.push(document);
    }

    const result = await client.platform?.documents.broadcast(documentBatch, identity);
    const ownerId = result.ownerId;
    const resultProfileDocument = {...result.transitions[0], ownerId};

// store.commit("setDashpayProfiles", [resultProfileDocument]);
    store.dispatch("fetchDashpayProfiles", {
      ownerIds: [ownerId.toString()],
      forceRefresh: true,
    });
    return result;
  };

  async function syncContactRequestsLoop() {
    if (!isRefreshLoopActive) return;
// console.log("syncContactRequestsLoop");

    await store.dispatch("syncContactRequests");

    Object.entries(store.state.contactRequests.sent).map(async ([myOwnerId, contactRequest]) => {
        return await store.dispatch(
          "fetchContactRequestsSent",
          (contactRequest as any).data.toUserId.toString()
        )
      }
    )

    // await sleep(10000);
    // await syncContactRequestsLoop();
  }

  async function startSyncContactRequests() {
    if (isRefreshLoopActive) return
    isRefreshLoopActive = true;
    // await syncContactRequestsLoop();
  }

  function stopSyncContactRequestsLoop() {
    isRefreshLoopActive = false;
  }

  return {
    startSyncContactRequests,
    stopSyncContactRequestsLoop,
    getMyFriends,
    getSuggestedFriends,
    getUserLabel,
    getUserAvatar,
    getUserDisplayName,
    getUserPublicMessage,
    myLabel,
    myAvatar,
    myOwnerId,
    myDisplayName,
    myPublicMessage,
    storeDashpayProfile,
  };
}
