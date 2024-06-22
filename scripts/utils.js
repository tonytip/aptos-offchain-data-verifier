const { Aptos, AptosConfig } = require("@aptos-labs/ts-sdk");
const chalk = require("chalk");

const aptosConfig = new AptosConfig({ network: process.env.NETWORK });
const aptos = new Aptos(aptosConfig);

/**
 * Send tx
 */
const sendTx = async (sender, func, args, typeArgs = []) => {
  const transaction = await aptos.transaction.build.simple({
    sender: sender.accountAddress,
    data: {
      function: func,
      typeArguments: typeArgs,
      functionArguments: args,
    },
    options: {
      maxGasAmount: 10000,
    },
  });

  const pendingTransaction = await aptos.signAndSubmitTransaction({
    signer: sender,
    transaction,
  });
  await aptos.waitForTransaction({ transactionHash: pendingTransaction.hash });

  console.log(chalk.green("[sendTx] txhash:"), pendingTransaction.hash);
};

const view = async (func, args) => {
  return await aptos.view({
    payload: {
      function: func,
      functionArguments: args,
    },
  });
};

/**
 * Get resource of account from module given by `resourceType`
 */
const getRes = async (account, resourceType) => {
  let resource;
  try {
    resource = await aptos.getAccountResource({
      accountAddress: account.accountAddress,
      resourceType,
    });
  } catch (err) {
    console.error(chalk.red("[getRes] ERR", err));
  }

  return resource;
};

module.exports = {
  sendTx,
  getRes,
  view,
};
