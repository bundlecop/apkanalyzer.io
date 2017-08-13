#!/bin/sh

docker build -t build . -f Dockerfile.build

docker create --name extract build
docker cp extract:/repo/public ./public
docker rm -f extract
