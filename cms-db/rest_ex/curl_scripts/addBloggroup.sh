if test $# -eq 1
then
	if test "$1" == "--help"
		then
			echo -e "Usage:\n\t source addBloggroup.sh <group name>"
			return 1;
	fi
fi

if test $# -lt 1
then
	echo "addBloggroup.sh: Not enough data"
	return 2;
fi

curl --data "name=$1" "http://localhost:3000/groups/blog"
