#!/usr/bin/env bash

makepkg

REPO=mfelten_de@mfelten.de:/home/mfelten_de/docroot/arch-linux/packages

scp $REPO/custom.db.tar.gz . 
repo-add custom.db.tar.gz *.xz
scp *.xz custom.db.tar.gz $REPO 

