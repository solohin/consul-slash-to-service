VERSION=0.2.12

tag:	
	git add . && git commit -m "${VERSION}"; true
	git tag ${VERSION}
	git push --tags