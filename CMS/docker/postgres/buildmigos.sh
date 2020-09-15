#!/bin/bash

sudo mkdir tmp
sudo cp -r ../../init/ ./tmp/init/ >&1
sudo docker build . -f migos --tag="th2/cms_mig" >&1
sudo rm -rf ./tmp/init/ >&1

exit 0
