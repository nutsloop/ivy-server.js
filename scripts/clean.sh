# clean build
rm -rf "./bin" || true
rm -rf "./example" || true
rm -rf "./lib" || true
rm -rf "./log" || true
rm -rf "./node_modules" || true
rm -rf "./public" || true
rm -rf "./routes" || true
rm -rf "./types" || true
rm -rf "./vroutes" || true
rm -rf "./target" || true
if [ -f "./Cargo.lock" ]; then rm "./Cargo.lock"; fi
if [ -f "./controlRoomConfig.js" ]; then rm "./controlRoomConfig.js"; fi
if [ -f "./index.js" ]; then rm "./index.js"; fi
if [ -f "./logConfig.js" ]; then rm "./logConfig.js"; fi
if [ -f "./multiDomainConfig.js" ]; then rm "./multiDomainConfig.js"; fi
if [ -f "./package-lock.json" ]; then rm "./package-lock.json"; fi
if [ -f "./socketClient.js" ]; then rm "./socketClient.js"; fi
if [ -f "./socketConfig.js" ]; then rm "./socketConfig.js"; fi
