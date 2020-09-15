#!/bin/bash

sudo docker run --network="postgres_default" --name=${SERVNAME_MIG:-"mig-cont"} --rm -it th2/cms_mig >&1

exit 0
