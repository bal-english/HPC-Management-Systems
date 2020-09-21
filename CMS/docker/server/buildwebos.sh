#!/bin/bash

sudo mkdir tmp
sudo cp -r ../../views/ ./tmp/views/ >&1
sudo docker build . -f webos --tag="th2/cms_web" >&1
sudo rm -rf ./tmp/ >&1

exit 0
