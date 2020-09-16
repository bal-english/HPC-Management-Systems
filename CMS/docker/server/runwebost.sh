#!/bin/bash

sudo docker run --env-file=../postgres/.env --network="cms" --name=${SERVNAME_WS:-"web-cont"} --rm -p 3000:3000 -it th2/cms_web

exit 0
