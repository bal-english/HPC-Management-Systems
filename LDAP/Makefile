all: .env
.env: .env.template
	cat .env.template | envsubst | tee .env
image: Dockerfile
	sudo docker build --no-cache . -t cosc425/openldap:1.0.1

