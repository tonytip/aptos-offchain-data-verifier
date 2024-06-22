const secp256k1 = require("secp256k1");
const { Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const dayjs = require("dayjs");
const { bcs } = require("@mysten/bcs");
const { sendTx } = require("./utils");
const { createHash } = require("node:crypto");
const { readConfig } = require("./config");

const sign = async () => {
  const config = await readConfig();
  const ts = dayjs().unix();
  console.log(ts);

  const Message = bcs.struct("Message", {
    func: bcs.string(),
    addr: bcs.bytes(32),
    data: bcs.u64(),
    ts: bcs.u64(),
  });

  let data = 123;

  let msg = {
    func: "verify_data",
    addr: config.player.accountAddress.toUint8Array(),
    data,
    ts,
  };

  const message = Message.serialize(msg).toBytes();

  console.log("Message: ", Buffer.from(message).toString("hex"));

  const hash = createHash("sha256").update(message).digest();
  console.log("Hash: ", Buffer.from(hash).toString("hex"));

  const serverPrivKey = new Ed25519PrivateKey(config.SERVER_PRIV_KEY);
  let { signature, recid } = secp256k1.ecdsaSign(Uint8Array.from(hash), serverPrivKey.toUint8Array());
  let signatureString = Buffer.from(signature).toString("hex");

  console.log({ signature: signatureString, recid: recid });

  await sendTx(config.player, `${config.CONTRACT_ADDR}::signature_verifier::verify_data`, [data, ts, recid, signature]);
};

sign();
