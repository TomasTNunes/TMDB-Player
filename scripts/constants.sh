CHROMIUM_DIR="build/chromium"
FIREFOX_DIR="build/firefox"
CHROMIUM_VERSION=$(grep -oP '"version":\s*"\K[^\"]+' "src/chromium/manifest.json")
FIREFOX_VERSION=$(grep -oP '"version":\s*"\K[^\"]+' "src/firefox/manifest.json")