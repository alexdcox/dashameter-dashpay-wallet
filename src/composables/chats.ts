import {computed} from "vue";
import Dash from "@/lib/Dash";
import {useStore} from "vuex";
import useRates from "@/composables/rates";

// import { createContactRequest } from "@dashevo/dashcore-lib"
// const {
//   sendDashToContactRequest,
// } = require("../lib/crypto/dashpay-send-to-contactrequest");

const createContactRequest = async (a: any, b: any, c: any) => {
  console.error("THIS NEEDS TO BE UPDATED TO WORK WITH THE NEW DASHCORE LIBS")
  return Promise.resolve({
    toJSON: () => {
    },
  })
}

const sendDashToContactRequest = async (a: any, b: any, c: any) => {
  console.error("THIS NEEDS TO BE UPDATED TO WORK WITH THE NEW DASHCORE LIBS")
  return Promise.resolve('bad txid')
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let client: any;

let isRefreshLoopActive = false;

export default function useChats() {
  const store = useStore();
  const {dashInDuffs, getFiatSymbol, duffsInFiatNumber} = useRates();

  const sentContactRequest = computed(() => store.getters.getSentContactRequest);
  const receivedContactRequest = computed(() => store.getters.getReceivedContactRequest);
  const getChatMsgs = computed(() => store.getters.getChatMsgs);
  const getChatMsgById = computed(() => store.getters.getChatMsgById);
  const getRequestByReplyToId = computed(() => store.getters.getRequestByReplyToId);

  async function syncChatsLoop() {
    if (!isRefreshLoopActive) return;
    console.log("syncChatsLoop");
    store.dispatch("syncChats");
    // await sleep(5000);
    // syncChatsLoop();
  }

  function startSyncChats() {
    if (isRefreshLoopActive) return
    console.log("startSyncChats");
    isRefreshLoopActive = true;
    // syncChatsLoop();
  }

  function stopSyncChats() {
    isRefreshLoopActive = false;
  }

  function contactRequestExistsFor(friendOwnerId: any) {
    return !!store.getters.getSentContactRequest(friendOwnerId);
  }

  const sendChat = async (
    chatText: string,
    friendOwnerId: string,
    amount = 0,
    request = "", // TODO type as enum
    replyToChatId = ""
  ) => {
    console.log("sendChat", {chatText, friendOwnerId, amount, request});

    const client = await Dash.client()
    const identity = await Dash.identity()
    const duffs = dashInDuffs.value(amount);
    // don't send L1 transaction on request 'open' | 'decline'
    let txId = "";
    if (duffs > 0 && ["", "accept"].includes(request)) {
      txId = await sendDashToContactRequest(client, store.getters.getReceivedContactRequest(friendOwnerId), duffs);
    }

    const docProperties = {
      text: chatText,
      txId,
      replyToChatId,
      toOwnerId: friendOwnerId,
      amount: amount ? duffs : undefined,
      request: request || undefined,
      fiatSymbol: getFiatSymbol.value || undefined,
      fiatAmount: duffsInFiatNumber.value(duffs) || undefined,
    };

    console.log("sendChat docProperties :>> ", docProperties);
    const document = await client.platform?.documents.create("dashpayWallet.chat", identity, docProperties);
    console.log("sendChat document :>> ", document);
    store.commit("setChatMsgs", [{...document, _state: "sending"}]);
    const documentBatchMsgOnly = {create: [document], replace: [], delete: []};
    let documentBatchToSend;

    // Attach contact request if we haven't sent one before
    if (!contactRequestExistsFor(friendOwnerId)) {
      const contactRequest = await createContactRequest(client, identity, friendOwnerId);

      // TODO: adc: REWORK THIS
      // if (contactRequest.toJSON().$ownerId == contactRequest.toJSON.toUserId)
      //   debugger;
      debugger

      documentBatchToSend = {
        create: [document, contactRequest],
        replace: [],
        delete: [],
      };
    } else documentBatchToSend = documentBatchMsgOnly;

    console.log("sendChat broadcasting", {documentBatchToSend, clientIdenity: identity});

    // Broadcast document with potentially attached contactRequest
    // Catch duplicate contactRequest error and only broadcast chatMsg
    let result;
    try {
      result = await client.platform?.documents.broadcast(documentBatchToSend, identity);
      console.log("sendChat documentBatchToSend result :>> ", result);

      if (result.transitions[1]?.type === "contactRequest") {
        const newContactRequestSent = {...result.transitions[1], ownerId: result.ownerId,};
        console.log("newContactRequestSent :>> ", newContactRequestSent.toJSON());
        store.commit("setContactRequestSent", newContactRequestSent);
      }

      const chatSent = result.transitions[0];
      chatSent.ownerId = result.ownerId;
      chatSent._state = "sent";
      store.commit("setChatMsgs", [chatSent]);
    } catch (e) {
      const b: any = e
      if (b.data?.errors[0]?.name === "DuplicateDocumentError") {
        try {
          result = await client.platform?.documents.broadcast(documentBatchMsgOnly, identity);
          const chatSent = result.transitions[0];
          chatSent.ownerId = result.ownerId;
          chatSent._state = "sent";
          store.commit("setChatMsgs", [chatSent]);
          console.log("sendChat documentBatchMsgOnly result :>> ", result);
        } catch (e) {
          store.commit("setChatMsgs", [{...document, _state: "error"}]);
          throw e;
        }
      } else {
        throw e;
      }
    }
  };

  return {
    startSyncChats,
    stopSyncChats,
    sendChat,
    getChatMsgs,
    getChatMsgById,
    getRequestByReplyToId,
    sentContactRequest,
    receivedContactRequest,
  };
}
