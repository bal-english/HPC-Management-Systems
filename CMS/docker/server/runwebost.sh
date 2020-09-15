#!/bin/bash

sudo docker run --network="postgres_default" --name=${SERVNAME_WS:-"web-cont"} --rm -p 3000:8080 -d th2/cms_web >&1

exit 0
