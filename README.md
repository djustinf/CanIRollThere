# CanIRollThere

## Setup
* Install MongoDB Community Edition: https://docs.mongodb.com/manual/administration/install-community/
* Install Docker: https://docs.docker.com/get-docker/
* Create an OpenTopography account, download elevation data, load into `data/`: https://opentopography.org/
  * SRTM 30m data: https://portal.opentopography.org/raster?opentopoID=OTSRTM.082015.4326.1
  * SRTM 90m data: https://portal.opentopography.org/raster?opentopoID=OTSRTM.042013.4326.1

## Commands
* ```source bin/init``` to setup virtualenv and a few other goodies
* ```make setup``` to pull Open-Elevation docker image and run it in the background
* ```make build``` to build the application
* ```make clean``` to clean up the build dir
* ```make run``` to run the application
* ```make serve``` to launch a front end dev server which rebuilds on file changes
* ```make install``` to install front end libraries
