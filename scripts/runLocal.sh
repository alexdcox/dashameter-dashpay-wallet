#!/usr/bin/env bash
source ~/.evoenv

export VUE_APP_ENV_RUN="local"

node ./scripts/registerContracts.js

source ./env/datacontracts_$VUE_APP_ENV_RUN.env

export VUE_APP_AUTOFAUCET="http://127.0.0.1:5050/drip/"
export VUE_APP_DASHPAY_CONTRACT_ID=$VUE_APP_DASHPAY_CONTRACT_ID_local

echo
echo "ENV VARS"
echo
printenv | grep VUE_APP
echo

ionic serve