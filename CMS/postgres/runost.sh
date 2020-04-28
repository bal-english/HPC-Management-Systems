#!/bin/bash

sudo docker run --network="cms_default" --name=${SERVNAME_MIG:-"mig-cont"} --rm -it TH2/CMS-migration >&1

exit 0
