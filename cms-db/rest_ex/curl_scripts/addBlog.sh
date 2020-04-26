if test $# -eq 1
then
	if test "$1" == "--help"
		then
			echo -e "Usage:\n\t source addBlog.sh <title> <author id> <body>"
			return 1;
	fi
fi

if test $# -lt 3
then
	echo "addBlog.sh: Not enough data"
	return 2;
fi

curl --data "title=$1&author=$2&body=$3" "http://localhost:3000/blogs"
