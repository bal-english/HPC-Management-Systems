docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pg-cont
