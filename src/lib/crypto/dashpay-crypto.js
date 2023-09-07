/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-bitwise */
const CryptoJS = require("crypto-js");
import * as Dashcore from '@dashevo/dashcore-lib'
const secp256k1 = require("secp256k1/elliptic");

const ecdhSharedKey = (senderPrivateKey, receiverPublicKey) => {
  const point = Buffer.from(receiverPublicKey, "base64");
  console.log("receiverPublicKey :>> ", receiverPublicKey);

  const scalar = Buffer.from(senderPrivateKey, "hex");
  console.log("senderPrivateKey :>> ", senderPrivateKey);

  // get X point of ecdh
  const sharedSecret = secp256k1.ecdh(point, scalar, {}, Buffer.alloc(32));

  console.log(
    'sharedSecret.toString("hex") :>> ',
    sharedSecret.toString("hex")
  );

  return sharedSecret;
};

const encryptCBCAES256 = (data, secret) => {
  const key = CryptoJS.enc.Hex.parse(secret.toString("hex"));

  const cipher = CryptoJS.AES.encrypt(data, key, {
    // iv: CryptoJS.enc.Hex.parse('a2b46306d0474332b28c0e247017bcc5'),
    iv: CryptoJS.lib.WordArray.random(16),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  return cipher;
};

const decryptCBCAES256 = (encrypted, secret, enc) => {
  const encodings = {
    hex: CryptoJS.enc.Hex,
    utf8: CryptoJS.enc.Utf8,
    base64: CryptoJS.enc.Base64,
  };

  const key = CryptoJS.enc.Hex.parse(secret.toString("hex"));

  const iv = CryptoJS.enc.Hex.parse(encrypted.slice(0, 16).toString("hex"));

  const ciphertext = CryptoJS.enc.Hex.parse(
    encrypted.slice(16, encrypted.length).toString("hex")
  );

  const encryptedCP = CryptoJS.lib.CipherParams.create({
    ciphertext,
    formatter: CryptoJS.format.OpenSSL, // Optional, but required for encryptedCP.toString()
  });

  const decryptedWA = CryptoJS.AES.decrypt(encryptedCP, key, { iv });

  const decrypted = decryptedWA.toString(encodings[enc]);

  return decrypted;
};

const encryptPublicKey = (publicKey, sharedSecrect) => {
  const data = CryptoJS.enc.Hex.parse(publicKey);

  const cipher = encryptCBCAES256(data, sharedSecrect);

  const ciphertext = cipher.ciphertext.toString(CryptoJS.enc.Hex);

  console.log(
    "ciphertext :>> ",
    ciphertext,
    Buffer.from(ciphertext, "hex").length
  );

  const iv = cipher.iv.toString(CryptoJS.enc.Hex);

  console.log("iv :>> ", iv);

  const ciphertextBuffer = Buffer.from(ciphertext, "hex");

  const ivBuffer = Buffer.from(iv, "hex");

  return Buffer.concat([ivBuffer, ciphertextBuffer]).toString("hex");
};

const decryptPublicKey = (encryptedPublicKey, sharedSecrect) =>
  decryptCBCAES256(
    Buffer.from(encryptedPublicKey, "hex"),
    sharedSecrect
  ).toString(CryptoJS.enc.Hex);

const encryptAccountLabel = (label, sharedSecrect) => {
  const labelBuffer = Buffer.from(label, "utf8");

  console.log("labelBuffer.length :>> ", labelBuffer.length);

  const paddingBuffer =
    31 - labelBuffer.length > 0
      ? Buffer.alloc(31 - labelBuffer.length)
      : Buffer.alloc(0);

  const paddedLabelBuffer = Buffer.concat([paddingBuffer, labelBuffer]);

  const cipher = encryptCBCAES256(
    paddedLabelBuffer.toString("utf8"),
    sharedSecrect
  );

  console.log(
    "paddedLabelBuffer.length :>> ",
    paddedLabelBuffer.length,
    "utf8",
    paddedLabelBuffer.toString("utf8")
  );

  const ciphertext = cipher.ciphertext.toString(CryptoJS.enc.Hex);

  console.log(
    "ciphertext :>> ",
    ciphertext,
    Buffer.from(ciphertext, "hex").length
  );

  const iv = cipher.iv.toString(CryptoJS.enc.Hex);

  console.log("iv :>> ", iv);

  const ciphertextBuffer = Buffer.from(ciphertext, "hex");

  const ivBuffer = Buffer.from(iv, "hex");

  return Buffer.concat([ivBuffer, ciphertextBuffer]).toString("base64");
};

const decryptAccountLabel = (encryptedAccountLabel, sharedSecrect) =>
  decryptCBCAES256(
    Buffer.from(encryptedAccountLabel, "base64"),
    sharedSecrect
  ).toString(CryptoJS.enc.Utf8);

const createAccountReference = (
  senderPrivateKey,
  extendedPublicKey,
  accountIndex = 0,
  version = 0
) => {
  const senderPrivateKeyBuffer = Buffer.from(senderPrivateKey, "hex");

  const extendedPublicKeyBuffer = Buffer.from(extendedPublicKey, "hex");

  const ASK = dashcore.crypto.Hash.sha256hmac(
    senderPrivateKeyBuffer,
    extendedPublicKeyBuffer
  );

  console.log("ASK :>> ", ASK);

  const ASK32 = ASK.slice(0, 4);

  console.log("ASK32 :>> ", ASK32.toString("hex"));

  const ASK28 = parseInt(ASK32.toString("hex"), 16) >> 4;

  console.log("ASK28 :>> ", ASK28);

  const shortenedAccountBits = accountIndex & 0x0fffffff;

  console.log("shortenedAccountBits :>> ", shortenedAccountBits);

  const versionBits = version << 28;

  console.log("versionBits :>> ", versionBits);

  const accountReference = versionBits | (ASK28 ^ shortenedAccountBits);

  console.log("accountReference :>> ", accountReference);

  return accountReference;
};

const deriveExtendedPublicKeyDIP15 = (
  senderHDPrivateKey,
  senderIdentityId,
  receiverIdentityId
) => {
  // TODO re enable 256bit derivation
  const senderIdentityIdHex = 1; //dashcore.encoding.Base58.decode(senderIdentityId).toString('hex');
  // const senderIdentityIdHex = dashcore.crypto.Hash.sha256(Buffer.from('01', 'hex')).toString('hex');

  const receiverIdentityIdHex = 1; //dashcore.encoding.Base58.decode(receiverIdentityId).toString('hex'); // receiverIdentity.id.toString('hex');
  // const receiverIdentityIdHex = dashcore.crypto.Hash.sha256(Buffer.from('02', 'hex')).toString('hex');

  const extendedPublicKey = senderHDPrivateKey.deriveChild(
    `m/9'/5'/15'/0'/0x${senderIdentityIdHex}/0x${receiverIdentityIdHex}`
  ).hdPublicKey;

  const receivingAddress = dashcore
    .Address(extendedPublicKey.publicKey, "testnet")
    .toString();

  console.log("receivingAddress :>> ", receivingAddress);

  const extendedPublicKeyDIP15Buffers = Buffer.concat([
    extendedPublicKey._buffers.parentFingerPrint,
    extendedPublicKey._buffers.chainCode,
    extendedPublicKey._buffers.publicKey,
  ]);

  console.log(
    "extendedPublicKeyDIP15Buffers.toString(hex) :>> ",
    extendedPublicKeyDIP15Buffers.toString("hex")
  );

  return extendedPublicKeyDIP15Buffers.toString("hex");
};

const createContactRequest = async (client, clientIdentity, toUserId) => {
  const senderIdentityId = clientIdentity.getId();

  const senderIdentity = clientIdentity;

  const senderHdPrivateKey = client.account.identities.getIdentityHDKeyByIndex(
    0,
    0
  );

  const senderPrivateKey = senderHdPrivateKey.privateKey.toString();

  const receiverIdentity = await client.platform.identities.get(toUserId);

  const receiverPublicKey = receiverIdentity.toJSON().publicKeys[0].data;

  // ECDH Shared Key / Diffie-Hellman Key Exchange
  // https://github.com/dashpay/dips/blob/feat/dashpay/dip-0015.md#ecdh-shared-key-senderkeyindex-and-recipientkeyindex
  const sharedSecret = ecdhSharedKey(senderPrivateKey, receiverPublicKey);

  // const sharedSecret = "0";

  // DashPay Incoming Funds Derivation Path
  // https://github.com/dashpay/dips/blob/feat/dashpay/dip-0015.md#dashpay-incoming-funds-derivation-path
  // console.log(
  //   senderHdPrivateKey,
  //   clientIdentity.getId().toString(),
  //   receiverIdentity.id.toString()
  // );
  const publicKeyDIP15 = deriveExtendedPublicKeyDIP15(
    senderHdPrivateKey,
    clientIdentity.getId().toString(),
    receiverIdentity.id.toString()
  );

  const contactRequest = {
    toUserId: receiverIdentity.id,
    senderKeyIndex: 0,
    accountReference: 1,
    //dashpaycrypto.createAccountReference( // TODO reenable this
    // senderPrivateKey,
    // publicKeyDIP15
    // ),
    recipientKeyIndex: 0,
    encryptedPublicKey: Buffer.from(
      encryptPublicKey(publicKeyDIP15, sharedSecret),
      "hex"
    ),
    encryptedAccountLabel: Buffer.from(
      encryptAccountLabel("Default Account", sharedSecret),
      "base64"
    ),
  };

  return await client.platform.documents.create(
    "dashpay.contactRequest",
    clientIdentity,
    contactRequest
  );
};
module.exports = {
  encryptCBCAES256,
  decryptCBCAES256,
  encryptPublicKey,
  decryptPublicKey,
  encryptAccountLabel,
  decryptAccountLabel,
  createAccountReference,
  deriveExtendedPublicKeyDIP15,
  createContactRequest,
  ecdhSharedKey,
};
