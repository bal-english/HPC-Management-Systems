#!/bin/bash

sudo docker run --network="cms" --name=${SERVNAME_WS:-"web-cont"} --rm -p 3000:3000 -it th2/cms_web >&1

exit 0
