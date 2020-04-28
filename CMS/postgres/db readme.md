Build Ubuntu Database OS:
  sudo docker build . -f migos --tag TH2/CMS-migration

Run Ubuntu Database OS:
  sudo docker run --network="cms_default" --name="os" --rm -i -d benglish4/dbos


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
