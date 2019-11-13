#!/bin/bash

## GitHub Actions からSSH接続する処理

echo -e "$SSH_KEY" > ssh_key;chmod 0400 ssh_key
ssh ${SSH_HOST} -l ${SSH_USER} -oStrictHostKeyChecking=no -i ssh_key "\
export GITHUB_REPOSITORY=$GITHUB_REPOSITORY;\
bash" < .github/scripts/target.sh
