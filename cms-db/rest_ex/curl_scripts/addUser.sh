if test $# -eq 1
then
	if test "$0" == "--help"
		then
			echo -e "Usage:\n\t source addUser.sh <lastName> <firstName> <email>"
			return 1;
	fi
fi

if test $# -lt 3
then
	echo "addUser.sh: Not enough data"
	return 2;
fi

curl --data "lastName=$1&firstName=$2&email=$3" "http://localhost:3000/users"
