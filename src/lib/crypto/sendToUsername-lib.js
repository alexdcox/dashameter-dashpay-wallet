const Dash = require("dash");
const secp256k1 = require("secp256k1/elliptic");
import * as Dashcore from '@dashevo/dashcore-lib'
const dashpaycrypto = require("./dashpay-crypto");

const senderMnemonic =
  "soap minor liberty divert scrub comic mail stable crouch naive mouse fringe"; // high
const receiverUsername = "lowhangingfruit";

const clientOpts = {
  network: "testnet",
  wallet: {
    mnemonic: senderMnemonic,
    unsafeOptions: {
      skipSynchronizationBeforeHeight: 485512,
    },
  },
};

const client = new Dash.Client(clientOpts);

const main = async () => {
  client.account = await client.getWalletAccount();

  const senderIdentityId = client.account.identities.getIdentityIds()[0];

  const receiverDPNS = await client.platform.names.resolve(
    `${receiverUsername}.dash`
  );

  const receiverIdentity = await client.platform.identities.get(
    receiverDPNS.ownerId.toString()
  );

  console.log("receiverIdentity.toJSON() :>> ", receiverIdentity.toJSON());
  const contactRequests = await client.platform.documents.get(
    "dashpay.contactRequest",
    {
      limit: 1,
      where: [
        ["$ownerId", "==", receiverIdentity.getId()],
        ["toUserId", "==", senderIdentityId],
      ],
    }
  );

  console.log("contactRequests :>> ", contactRequests[0].toJSON());

  const receiverPublicKey = receiverIdentity.toJSON().publicKeys[0].data;

  const senderPrivateKey = client.account.identities
    .getIdentityHDKeyByIndex(0, 0)
    .privateKey.toString();

  // ECDH Shared Key / Diffie-Hellman Key Exchange
  const sharedSecret = dashpaycrypto.ecdhSharedKey(
    senderPrivateKey,
    receiverPublicKey
  );

  console.log(
    'sharedSecret.toString("hex") :>> ',
    sharedSecret.toString("hex")
  );

  // CBC-AES-256 decryption
  const { encryptedAccountLabel, encryptedPublicKey } = contactRequests[0].data;

  console.log("encryptedAccountLabel :>> ", encryptedAccountLabel.length);
  console.log("encryptedAccountLabel :>> ", encryptedAccountLabel.toString());

  // Decrypt accountLabel
  const decryptedAccountLabel = dashpaycrypto.decryptCBCAES256(
    encryptedAccountLabel,
    sharedSecret,
    "utf8"
  );
  console.log("decryptedAccountLabel :>> ", decryptedAccountLabel);

  // Decrypt publicKey
  const decryptedPublicKey = dashpaycrypto.decryptCBCAES256(
    encryptedPublicKey,
    sharedSecret,
    "hex"
  );
  console.log("decryptedPublicKey :>> ", decryptedPublicKey);

  // Derive receiving address
  const xpubkeyBuffers = Buffer.from(decryptedPublicKey, "hex");

  const parentFingerPrint = xpubkeyBuffers.slice(0, 4);

  const chainCode = xpubkeyBuffers.slice(4, 36);

  const publicKey = xpubkeyBuffers.slice(36, 69);

  const depth = Buffer.alloc(1);

  const childIndex = Buffer.alloc(4);

  const xpubkey = dashcore.HDPublicKey.fromObject({
    parentFingerPrint,
    chainCode,
    publicKey,
    network: "testnet",
    depth,
    childIndex,
  });

  const receivingAddress = dashcore
    .Address(xpubkey.publicKey, "testnet")
    .toString();

  console.log("receivingAddress :>> ", receivingAddress);

  const transaction = client.account.createTransaction({
    recipient: receivingAddress,
    satoshis: 10000000, // 0.1 Dash
  });

  const tx = await client.account.broadcastTransaction(transaction);
  console.log("tx :>> ", tx);
};

main()
  .then(() => console.log("Success!"))
  .catch((e) => console.error("Something went wrong:\n", e))
  .finally(() => client.disconnect());
