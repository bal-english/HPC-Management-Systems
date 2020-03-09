FROM ubuntu
MAINTAINER TH2 Alex

WORKDIR /app/

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y npm

RUN npm update
ADD run.sh /

CMD ["/run.sh"]
