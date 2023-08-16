#!/usr/bin/env bash
source ~/.evoenv

# export VUE_APP_DAPIADDRESSES='["34.220.41.134", "18.236.216.191", "54.191.227.118"]'
unset VUE_APP_DPNS_CONTRACT_ID

export VUE_APP_ENV_RUN="testnet"

node ./scripts/registerContracts.js || exit

#  source ./env/datacontracts_$VUE_APP_ENV_RUN.env
# export VUE_APP_AUTOFAUCET="http://155.138.237.69:5050/drip/"
# export VUE_APP_DASHPAY_CONTRACT_ID=$VUE_APP_DASHPAY_CONTRACT_ID_testnet

echo
echo "ENV VARS"
echo
printenv | grep VUE_APP
echo


ionic serve