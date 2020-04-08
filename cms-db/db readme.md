Build Ubuntu Database OS:
  sudo docker build . -f dbos --tag benglish4/dbos

Run Ubuntu Database OS:
  sudo docker run --network="cmsdb_default" --name="os" --rm -i -d benglish4/dbos


Create Database:
	sudo docker-compose up -d
	./buildos.sh
	./runost.sh

	db-migrate up
