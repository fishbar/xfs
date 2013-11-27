MOCHA = ./node_modules/.bin/mocha

init: install test

install:
	@npm install

test: install
	@$(MOCHA) ./test --coverage
	
.PHONY: instal test
