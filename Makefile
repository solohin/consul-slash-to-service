VERSION=0.2.13

tag:	
	git add . && git commit -m "${VERSION}"; true
	git tag ${VERSION}
	git push --tags