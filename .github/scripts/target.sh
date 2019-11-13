#!/bin/bash

## ターゲット環境上でソースの展開とビルド

git clone https://github.com/$GITHUB_REPOSITORY test/$GITHUB_REPOSITORY
cd test/$GITHUB_REPOSITORY
yarn install
yarn build:all
