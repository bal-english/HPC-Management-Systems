Build Ubuntu Database OS:
  sudo docker build . -f dbos --tag benglish4/dbos

Run Ubuntu Database OS:
  sudo docker run --network="cmsdb_default" --name="os" --rm -i -d benglish4/dbos


Create Database:
	cd init/env/
	source env_setup.sh
	cd ../..
	sudo docker-compose up -d
	./buildos.sh
	./runost.sh

	db-migrate up
	exit

RESTful API Example:
	cd init/env/
	source env_setup.sh
	cd ../../rest_ex/
	node index.js
