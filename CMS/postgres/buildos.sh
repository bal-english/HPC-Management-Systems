#!/bin/bash

sudo cp -r ../init/ ./init/ >&1
sudo docker build . -f migos --tag="th2/cms_mig" >&1
sudo rm -rf ./init/ >&1

exit 0
