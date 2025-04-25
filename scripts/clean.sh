#!/bin/bash

printf "\033[1;4;32m[+] starting clean process...\033[0m\n\n"

printf "[+] checking for npm-check-updates...\n"
if ! command -v ncu >/dev/null 2>&1; then
  printf "\033[1;4;33m[+] ncu not found, installing...\033[0m\n"
  npm install || { printf "\033[1;4;31m[+] failed to run npm\033[0m\n"; exit 1; }
fi

printf "[+] running ncu...\n"
ncu || { printf "\033[1;4;31m[+] ncu failed\033[0m\n"; exit 1; }

errors=""

remove_path() {
  if [ -e "$1" ]; then
    if rm -rf "$1"; then
      printf "\033[1;4;32m[+] removed %s\033[0m\n" "$1"
    else
      errors="$errors $1"
    fi
  else
    printf "\033[1;4;33m[+] skipped %s (not found)\033[0m\n" "$1"
  fi
}

remove_path "./bin"
remove_path "./lib"
remove_path "./index.js"
remove_path "./index.js.map"
remove_path "./node_modules"
remove_path "./package-lock.json"
remove_path "./types"
remove_path "./.tsbuildinfo"

if [ -n "$errors" ]; then
  printf "\n\033[1;4;31m[+] clean process completed with errors in: %s\033[0m\n" "$errors"
  exit 1
else
  printf "\n\033[1;4;32m[+] clean process completed successfully.\033[0m\n"
fi

printf "[+] installing dependencies again...\n"
npm install || { printf "\033[1;4;31m[+] npm install failed\033[0m\n"; exit 1; }

printf "[+] running scripts/build.sh...\n"
./scripts/build.sh || { printf "\033[1;4;31m[+] build script failed\033[0m\n"; exit 1; }
