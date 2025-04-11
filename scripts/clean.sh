#!/bin/bash

printf "\033[1;4;32m[+] starting clean process...\033[0m\n\n"

echo "[+] checking for npm-check-updates..."
if ! command -v ncu >/dev/null 2>&1; then
  printf "\033[1;4;33m[+] ncu not found, installing...\033[0m\n"
  npm install || { printf "\033[1;4;31m[+] failed to run npm\033[0m\n"; exit 1; }
fi

echo "[+] running ncu..."
ncu || { printf "\033[1;4;31m[+] ncu failed\033[0m\n"; exit 1; }

errors=""

remove_path() {
  if [ -e "$1" ]; then
    if rm -rf "$1"; then
      printf "\033[1;4;32m[+] removed $1\033[0m\n"
    else
      errors="$errors $1"
    fi
  else
    printf "\033[1;4;33m[+] skipped $1 (not found)\033[0m\n"
  fi
}

remove_path "./bin"
remove_path "./lib"
remove_path "./node_modules"
remove_path "./types"
remove_path "./index.js"
remove_path "./package-lock.json"

if [ -n "$errors" ]; then
  printf "\n\033[1;4;31m[+] clean process completed with errors in:$errors\033[0m\n"
  exit 1
else
  printf "\n\033[1;4;32m[+] clean process completed successfully.\033[0m\n"
fi

echo "[+] installing dependencies again..."
npm install || { printf "\033[1;4;31m[+] npm install failed\033[0m\n"; exit 1; }

echo "[+] running scripts/build.sh..."
./scripts/build.sh || { printf "\033[1;4;31m[+] build script failed\033[0m\n"; exit 1; }
