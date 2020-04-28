
cleansc="env_clean.sh"
pgsc="env_pg.sh"
pgadmin4sc="env_pgadmin4.sh"
adminersc="env_adminer.sh"

if [ ! -f $cleansc ]
then
	echo "./env_setup.sh: Clean file \'$cleansc\' not found."
	return 1
fi

if [ ! -f $pgsc ]
then
	echo "./env_setup.sh: Postgres environment file \'$pgsc\' not found."
	return 2
fi

if [ ! -f $pgadmin4sc ]
then
	echo "./env_setup.sh: pgadmin4 environment file \'$pgadmin4sc\' not found."
	return 3
fi

if [ ! -f $adminersc ]
then
	echo "./env_setup.sh: adminer environment file \'$adminer\' not found."
	return 4
fi

source $cleansc

source $pgsc
source $pgadmin4sc
source $adminersc

return 4
