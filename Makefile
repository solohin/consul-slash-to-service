VERSION=0.2.11

tag:	
	git add . && git commit -m "${VERSION}"; true
	git tag ${VERSION}
	git push --tags