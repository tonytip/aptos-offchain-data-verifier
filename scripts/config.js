const YAML = require("yaml");
const fs = require("fs");
const { Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");

const readConfig = async () => {
  const file = fs.readFileSync("../.aptos/config.yaml", "utf8");
  const config = YAML.parse(file);

  const CONTRACT_ADDR = config.profiles.default.account;
  const ADMIN_PRIV_KEY = config.profiles.default.private_key;
  const adminPrivKey = new Ed25519PrivateKey(ADMIN_PRIV_KEY);
  const admin = Account.fromPrivateKey({ privateKey: adminPrivKey });
  const PLAYER_PRIV_KEY = config.profiles.player.private_key;
  const playerPrivKey = new Ed25519PrivateKey(PLAYER_PRIV_KEY);
  const player = Account.fromPrivateKey({ privateKey: playerPrivKey });
  const SERVER_PRIV_KEY = config.profiles.server.private_key;

  return {
    CONTRACT_ADDR,
    admin,
    player,
    SERVER_PRIV_KEY
  }
};

module.exports = {
  readConfig,
};
