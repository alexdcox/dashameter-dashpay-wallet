#!/usr/bin/env bash
source ~/.evoenv

export VUE_APP_ENV_RUN="local"

# export VUE_APP_USERMNEMONIC='now tourist leopard scorpion inside nation bitter click wide razor say drastic'
export VUE_APP_USERMNEMONIC='vibrant couple breeze someone input march sample fix oblige enact humor main'

node ./scripts/registerContracts.js

source ./env/datacontracts_$VUE_APP_ENV_RUN.env

export VUE_APP_DASHPAY_CONTRACT_ID=$VUE_APP_DASHPAY_CONTRACT_ID_local

echo
echo "ENV VARS"
echo
printenv | grep VUE_APP
echo

ionic serve