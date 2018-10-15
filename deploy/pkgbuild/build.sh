#!/usr/bin/env bash

rm -rf kronos-cluster-node pkg src custom.db.tar.gz

makepkg -f

REPO=deploy@mfelten.dynv6.net:/data/binaries/arch-linux/packages

scp $REPO/custom.db.tar.gz .
repo-add custom.db.tar.gz *.xz
scp *.xz custom.db* $REPO
rm *.xz
