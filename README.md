# Aptos Offchain Data Verifier

Verify offchain data by using a signature on contract. Data will be signed offchain using a private key. The contract will verify the signature using the corresponding public key.

### Create a default profile
```
aptos init
aptos init --profile player
aptos init --profile server
```

### Compiles
```
aptos move compile --named-addresses deployer=default
```

### Deploy
```
aptos move publish --named-addresses deployer=default
```

### Run scripts to test
You need to deploy the contract first, then run the following scripts:
```
npm i
cd scripts/
# Copy the .env fiel
cp .env.example .env
# set the public key to the contract
node set-pk.js
# test verify the signature
node verify-data.js
```