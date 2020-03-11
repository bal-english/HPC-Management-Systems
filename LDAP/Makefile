all: .env
.env: .env.template
	cat .env.template | envsubst | tee .env
image: Dockerfile
	sudo docker build --no-cache . -t cosc425/openldap:1.0.1
node: node/Dockerfile 
	sudo docker build --no-cache ./node -t cosc425/node:1.0.1
