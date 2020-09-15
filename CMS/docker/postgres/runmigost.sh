#!/bin/bash

sudo docker run --env-file=".env" --network="cms" --name=${SERVNAME_MIG:-"mig-cont"} --rm -it th2/cms_mig >&1

exit 0
