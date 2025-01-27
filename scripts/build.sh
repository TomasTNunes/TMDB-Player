# Delete dist and Create new build
rm -rf dist
rm -rf build
mkdir build

# Build chromium
mkdir build/chromium
CHROMIUM_DIR="build/chromium"

# Copy chromium manifest
cp -r src/chromium/* $CHROMIUM_DIR

# Copy assets to chromium dir
cp -r src/assets/* $CHROMIUM_DIR

# Build firefox
mkdir build/firefox
FIREFOX_DIR="build/firefox"

# Copy firefox manifest
cp -r src/firefox/* $FIREFOX_DIR

# Copy assets to firefox dir
cp -r src/assets/* $FIREFOX_DIR