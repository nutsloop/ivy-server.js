chmod u+x "./bin/server.js"
chmod u+x "./lib/control/thread/worker.js"
chmod u+x "./lib/log/wrk.js"
chmod u+x "./lib/log/thread/worker.js"
chmod u+x "./bin/server.js"
chmod u+x "./lib/socket/thread/worker.js"

# Check if controlRoomConfig.js exists
if [ -f "./example/controlRoomConfig.js" ]; then
    mv "./example/controlRoomConfig.js" "./controlRoomConfig.js"
fi

# Check if logConfig.js exists
if [ -f "./example/logConfig.js" ]; then
    mv "./example/logConfig.js" "./logConfig.js"
fi

# Check if multiDomainConfig.js exists
if [ -f "./example/multiDomainConfig.js" ]; then
    mv "./example/multiDomainConfig.js" "./multiDomainConfig.js"
fi

# Check if socketClient.js exists
if [ -f "./example/socketClient.js" ]; then
    mv "./example/socketClient.js" "./socketClient.js"
fi

# Check if socketConfig.js exists
if [ -f "./example/socketConfig.js" ]; then
    mv "./example/socketConfig.js" "./socketConfig.js"
fi

# Check if directory public exists, if not, create it
[ -d "./public" ] || mkdir "./public"

# Check if directory routes exists, if not, create it
[ -d "./routes" ] || mkdir "./routes"

# Check if directory vroutes exists, if not, create it
[ -d "./vroutes" ] || mkdir "./vroutes"
