Build Ubuntu Database OS:
  sudo docker build . -f ubuntu benglish4/dbos

Run Ubuntu Database OS:
  sudo docker run --network="benglish4cosc425_default" --name="os" -rm -i -d benglish4/dbos
