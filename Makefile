clean:
	rm -rf build

install:
	bin/install

serve:
	bin/serve

build: clean
	bin/build

run: build
	python3 build/run.py
