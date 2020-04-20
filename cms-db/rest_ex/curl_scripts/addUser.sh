if test $# -eq 1
then
	if test "$0" == "--help"
		then
			echo -e "Usage:\n\t source addUser.sh <lastName> <firstName> <email>"
			return 0;
	fi
fi

if test $# -lt 3
then
	echo "addUser.sh: Not enough data"
	return 1;
fi

curl --data "lastName=$0&firstName=$1&email=$2" "http://localhost:3000/users"
