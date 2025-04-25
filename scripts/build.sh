#!/bin/bash

printf "\033[1;4;32m[+] starting build process...\033[0m\n\n"

printf "[+] running TypeScript compiler...\n"
if ! npx tsc; then
  printf "\033[1;4;31m[+] TypeScript compilation failed\033[0m\n"
  exit 1
fi

printf "[+] running chmod script...\n"
if ! ./scripts/chmod.u+x.sh; then
  printf "\033[1;4;31m[+] chmod script failed\033[0m\n"
  exit 1
fi

printf "\n\033[1;4;32m[+] build process completed successfully.\033[0m\n"
