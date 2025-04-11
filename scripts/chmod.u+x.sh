#chmod executable files
missing_files=""

printf "\n\033[1;4;32m[+] starting chmod execution for executable files...\033[0m\n"

if [ -f "./bin/server.js" ]; then
  chmod u+x "./bin/server.js"
else
  missing_files="$missing_files ./bin/server.js"
fi

if [ -f "./lib/control/thread/worker.js" ]; then
  chmod u+x "./lib/control/thread/worker.js"
else
  missing_files="$missing_files ./lib/control/thread/worker.js"
fi

if [ -f "./lib/log/wrk.js" ]; then
  chmod u+x "./lib/log/wrk.js"
else
  missing_files="$missing_files ./lib/log/wrk.js"
fi

if [ -f "./lib/log/thread/worker.js" ]; then
  chmod u+x "./lib/log/thread/worker.js"
else
  missing_files="$missing_files ./lib/log/thread/worker.js"
fi

if [ -f "./lib/socket/thread/worker.js" ]; then
  chmod u+x "./lib/socket/thread/worker.js"
else
  missing_files="$missing_files ./lib/socket/thread/worker.js"
fi

if [ -n "$missing_files" ]; then
  printf "\033[1;4;31m[+] error: Missing files:%s\033[0m\n" "$missing_files"
  exit 1
else
  printf "\033[1;4;32m[+] chmod execution completed successfully.\033[0m\n"
fi
