#!/usr/bin/env bash

set -euo pipefail

BOLD=$(tput bold)
NORM=$(tput sgr0)

if ! [ -x "$(command -v mkcert)" ]; then
  echo -e "Error: ${BOLD}mkcert${NORM} is not found. Run ${BOLD}brew bundle install${NORM} to install it on macOS or follow the instructions for your OS https://github.com/FiloSottile/mkcert#installation"
  exit 1
fi

mkcert -install

KEY_FILE="$(pwd)/certs/localhost-key.pem"
CERT_FILE="$(pwd)/certs/localhost.pem"

if [[ -f $KEY_FILE ]] && [[ -f $CERT_FILE ]]; then
  echo "Locally-trusted certificate is already exists"
  exit 0
fi

mkdir -p ./certs
mkcert -key-file $KEY_FILE -cert-file $CERT_FILE localhost 127.0.0.1 ::1
