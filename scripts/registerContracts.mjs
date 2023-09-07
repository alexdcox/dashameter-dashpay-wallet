/* eslint-disable @typescript-eslint/no-var-requires */
import path from "path";
import crypto from "crypto";
import fs from "fs";
import Dash from "dash";
import glob from "glob";

!async function () {
  const envRun = import.meta.env.VUE_APP_ENV_RUN;
  console.log("Running registeredContracts.js ...");

  let clientOpts = {
    network: "testnet",
    wallet: {
      mnemonic: import.meta.env.VUE_APP_MNEMONIC,
      unsafeOptions: {
        skipSynchronizationBeforeHeight: 874000,
      }
    },
  };

  console.log("clientOpts :>> ", clientOpts);

  const client = new Dash.Client(clientOpts);

  let registeredContracts = {};
  const registeredContractsPath = `./env/registeredContracts_${envRun}.json`
  try {
    registeredContracts = JSON.parse(fs.readFileSync(registeredContractsPath).toString())
  } catch (e) {
    console.log(`./env/registeredContracts_${envRun}.json not found, will create file ..`);
  }

  try {
    const contractUrls = glob.sync("./schema/*CONTRACT.json");
    const contractUrlsWithHash = contractUrls.map((x) => [
      x,
      crypto
        .createHash("sha256")
        .update(fs.readFileSync(x).toString())
        .digest("hex"),
    ]).filter(x => x[0].match(`DASHPAY_CONTRACT`) != null)

    contractUrlsWithHash.forEach(([path, hash]) => {
      console.log(`Loaded contract from ${path} with hash ${hash}`)
    })

    // // Check if there is a new contract, otherwise skip slow wallet initialization
    // let walletInit = false
    // for (let idx = 0; idx < contractUrlsWithHash.length; idx++) {
    //   const hash = contractUrlsWithHash[idx][1];
    //   if (!(hash in registeredContracts)) {
    //     walletInit = true
    //     break;
    //   }
    // }
    //
    // if (walletInit) {
    //   console.log("Found new contracts to register...");
    //   if (!client.account) {
    //     const startWalletSync = Date.now();
    //     console.log("Initializing wallet... (this may take a few minutes)");
    //     client.account = await client.getWalletAccount();
    //     const walletTime = Math.floor((Date.now() - startWalletSync) / 1000);
    //     const receivingAddress = client.account.getAddress(0).address
    //     console.log(`Finished wallet sync in ${walletTime}s`);
    //     console.log(`Receiving address for wallet: ${receivingAddress}`);
    //     console.log("Waiting for address to show positive balance...")
    //     // eslint-disable-next-line no-constant-condition
    //     const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    //     while (client.account.getConfirmedBalance() === 0) {
    //       await sleep(2000)
    //       await client.getWalletAccount()
    //       console.log('--> ', client.account.getConfirmedBalance())
    //     }
    //     console.log('Confirmed balance is:', client.account.getConfirmedBalance() / 1e8)
    //   } else {
    //     console.log("Using existing client account")
    //   }
    // }
    //
    // if (!client.account) {
    //   throw 'account missing damnit'
    // }
    //
    // let identity, identityId
    // const accountIdentities = client.account.identities.getIdentityIds()
    // if (accountIdentities.length) {
    //   console.log(`Client has ${accountIdentities.length} existing identities`)
    //   console.log(`Using identity ${accountIdentities[0]}`)
    //   identityId = accountIdentities[0]
    // } else {
    //   console.log('Registering new identity')
    //   const registerResponse = await client.platform.identities.register()
    //   identityId = registerResponse.id.toString()
    // }
    //
    // console.log(`Fetching identity ${identityId}`)
    // identity = await client.platform.identities.get(identityId);

    // Register new contracts in parallel, if now new contracts exists returns old contracts
    const newRegisteredContractIdsPromises = contractUrlsWithHash.map(async ([url, hash]) => {
      if (hash in registeredContracts) {
        return registeredContracts[hash].id;
      } else {
        const contractDocuments = JSON.parse(fs.readFileSync(url).toString())

        const apps = client.getApps()
        console.log(`Found ${apps.getNames().length} existing apps:`)
        apps.getNames().forEach(appName => {
          console.log(`- ${appName} ${apps.get(appName).contractId}`)
        })
        const dashpayApp = client.getApps().get("dashpay")
        if (!dashpayApp) {
          throw 'darn it to heck'
        }
        console.log(`Found dashpay app with contractId: ${dashpayApp.contractId.toString()}`)

        console.log(dashpayApp.contract)
        process.exit(1)


        const contract = await client.platform.contracts.create(contractDocuments, identity);
        console.log(`Contract: ${contract.hash.toString()}`)

        const existing = await client.platform.contracts.get(contract)
        console.log(existing.toString())
        process.exit(1)

        const ret = await client.platform.contracts.publish(contract, identity);
        console.log('ok')
        return ret
        // return client.platform.contracts.broadcast(contract, identity);
      }
    });

    console.log('HERE')
    const newRegisteredContractIdsResults = await Promise.all(newRegisteredContractIdsPromises);
    console.log('HERE2')

    const newRegisteredContractIds = newRegisteredContractIdsResults.map(
      (id, idx) => {
        if (typeof id === "string") {
          return id;
        } else {
          const newId = id.dataContract.id.toString();
          const contractName = path.basename(contractUrlsWithHash[idx][0], ".json");
          console.log("Registered new contract: ", `${contractName}_${envRun}`, newId);

          // if (contractName === "JEMBE_CONTRACT") {
          //   try {
          //     fs.appendFileSync(
          //       `/home/${import.meta.env.USER}/.evoenv`,
          //       `\nexport VUE_APP_${contractName}_ID_${envRun}=${newId}\n`
          //     );
          //
          //     console.log(
          //       "-> Appended",
          //       `${contractName}_${envRun}`,
          //       "to ~/.evoenv"
          //     );
          //   } catch (e) {
          //     console.log(e);
          //     console.log(
          //       `Add the ${contractName} to your environment variables manually to share it with other dApps..`
          //     );
          //   }
          // }

          return newId;
        }
      }
    );

    const newRegisteredContracts = {};
    newRegisteredContractIds.forEach((id, idx) => {
      const [url, hash] = contractUrlsWithHash[idx];
      newRegisteredContracts[hash] = {url, id};
    });

    console.log("Caching registered contracts in: ", registeredContractsPath)
    fs.writeFileSync(registeredContractsPath, JSON.stringify(newRegisteredContracts));

    console.log(`\nContractIds for '${envRun}':\n`);

    let envVarString = "";
    Object.keys(newRegisteredContracts).forEach((hash) => {
      const {url, id} = newRegisteredContracts[hash];
      envVarString += `export VUE_APP_${path.basename(url, ".json")}_ID_${envRun}=${id}\n`;
      console.log(`export VUE_APP_${path.basename(url, ".json")}_ID_${envRun}=${id}`);
    });

    fs.writeFileSync(`./env/datacontracts_${envRun}.env`, envVarString);

  } catch (e) {
    console.dir(e);
  } finally {
    if (client) client.disconnect();
  }
}()

