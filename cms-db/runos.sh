#!/bin/bash

if test $* -gt 1:
then
	if [ $1 = "-it" ] || [ $1 = "-id" ]
	then
		flag = $1
	fi
	sudo docker run --network="cmsdb_default" --name="os" --rm $flag benglish4/dbos >&1
else
	sudo docker run --network="cmsdb_default" --name="os" --rm benglish4/dbos >&1
fi


exit 0 
