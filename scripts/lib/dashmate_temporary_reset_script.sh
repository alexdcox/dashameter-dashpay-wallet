#!/usr/bin/env bash

PATH_TO_SCRIPT=$(realpath $0)
PATH_TO_BIN_DIRECTORY=$(dirname $PATH_TO_SCRIPT)
PROJECT_ROOT=$(dirname $PATH_TO_BIN_DIRECTORY)
PROJECTS_DIRECTORY=$(dirname $PROJECT_ROOT)

set -e

#COLLATERAL_KEY=
#COLLATERAL_ADDRESS=

# PLEASE PUT YOUR FAUCET KEY HERE
FAUCET_PRIVATE_KEY=cSoFoRqFaA7ha2ovL4yeZPmog2CrKfq6WiDXF4CaV3RmCcTGJMGk
FAUCET_ADDRESS=ySPRMNDVBhZVZvDS4wGn4Ujuq2wP4AcwLK
MINING_INTERVAL_IN_SECONDS=20

# PLEASE SET THIS VARIABLES TO YOUR LOCAL DIRECTORIES WITH THE CODE IF YOU WISH TO COMPILE DAPI AND DRIVE
# Current value are assuming that dashmate and all other components are under that same parent dir
#DAPI_REPO_PATH=${PROJECTS_DIRECTORY}/dapi/
#DRIVE_REPO_PATH=${PROJECTS_DIRECTORY}/drive/

BUILD_DAPI_BEFORE_SETUP=false
BUILD_DAPI_AFTER_SETUP=false
BUILD_DRIVE=false

CONFIG_NAME="local"

MASTERNODES_COUNT=3

exit 1
echo "DANGER"

######################
echo "Removing all docker containers and volumes..."
docker rm -f -v $(docker ps -a -q) || true

docker system prune -f --volumes

echo "Remove dashmate configuration..."
rm -rf ~/.dashmate/

#####################

# echo "Reset Dashmate"
# dashmate group:reset --verbose --group=local --hard --force
####################

if [ $BUILD_DRIVE == true ]
then
  echo "Setting drive build directory"
  dashmate config:set --config=${CONFIG_NAME} platform.drive.abci.docker.build.path $DRIVE_REPO_PATH
fi

if [ $BUILD_DAPI_BEFORE_SETUP == true ]
then
  echo "Setting dapi build directory before the setup"
  dashmate config:set --config=${CONFIG_NAME} platform.dapi.api.docker.build.path $DAPI_REPO_PATH
fi

dashmate setup ${CONFIG_NAME} --verbose --debug-logs --miner-interval="${MINING_INTERVAL_IN_SECONDS}s" --node-count=${MASTERNODES_COUNT} | tee ${PROJECT_ROOT}/setup.log

echo "Sending 1000 tDash to the ${FAUCET_ADDRESS} for tests"
# dashmate wallet:mint 1000 --config=${CONFIG_NAME}_seed --address=${FAUCET_ADDRESS} --verbose

# if [ $BUILD_DAPI_AFTER_SETUP == true ]
# then
#   echo "Setting dapi build directory after the setup"
#   for (( NODE_INDEX=1; NODE_INDEX<=MASTERNODES_COUNT; NODE_INDEX++ ))
#   do
#     dashmate config:set --config=${CONFIG_NAME}_${NODE_INDEX} platform.dapi.api.docker.build.path $DAPI_REPO_PATH
#   done
# fi

# dashmate group:start --wait-for-readiness --verbose

echo "Funding key is ${FAUCET_PRIVATE_KEY}"
