if test $# -eq 1
then
	if test "$0" == "--help"
		then
			echo -e "Usage:\n\t source addUsergroup.sh <group name>"
			return 1;
	fi
fi

if test $# -lt 1
then
	echo "addUsergroup.sh: Not enough data"
	return 2;
fi

curl --data "name=$1" "http://localhost:3000/groups/user"
