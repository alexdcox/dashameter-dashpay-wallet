/* eslint-disable @typescript-eslint/no-var-requires */
import * as Dashcore from '@dashevo/dashcore-lib'
const dashpaycrypto = require("./dashpay-crypto");

const sendDashToContactRequest = async (client, contactRequest, satoshis) => {
  console.log("contactRequest :>> ", contactRequest);
  client.account = await client.getWalletAccount();

  const receiverIdentity = await client.platform.identities.get(
    contactRequest.ownerId.toString()
  );

  console.log("receiverIdentity.toJSON() :>> ", receiverIdentity.toJSON());

  // ECDH Shared Key / Diffie-Hellman Key Exchange

  const receiverPublicKey = receiverIdentity.toJSON().publicKeys[0].data;

  const senderPrivateKey = client.account.identities
    .getIdentityHDKeyByIndex(0, 0)
    .privateKey.toString();

  // ECDH Shared Key / Diffie-Hellman Key Exchange
  const sharedSecret = dashpaycrypto.ecdhSharedKey(
    senderPrivateKey,
    receiverPublicKey
  );

  // CBC-AES-256 decryption
  const { encryptedAccountLabel, encryptedPublicKey } = contactRequest.data;

  console.log("encryptedAccountLabel :>> ", encryptedAccountLabel.length);

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

  const recipient = dashcore.Address(xpubkey.publicKey, "testnet").toString();

  console.log("recipient :>> ", recipient);

  const transaction = client.account.createTransaction({
    recipient,
    satoshis,
  });

  const tx = await client.account.broadcastTransaction(transaction);
  console.log("tx :>> ", tx);
  return tx;
};

module.exports = { sendDashToContactRequest };
