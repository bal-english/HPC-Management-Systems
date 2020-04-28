#!/bin/bash

sudo docker run --network="cmsdb_default" --name="os" --rm -it benglish4/dbos >&1

exit 0
