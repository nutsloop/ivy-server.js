npx tsc
chmod u+x ./bin/server.js
chmod u+x ./bin/server.js
chmod u+x ./lib/socket/thread/worker.js
chmod u+x ./lib/log/thread/worker.js
#check if logConfig.js exists
[ -f ./logConfig.js ] && mv -f ./logConfig.js ./example/logConfig.js || true
