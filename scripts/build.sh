# Create new build
rm -rf build
mkdir build

# Create new dist
rm -rf dist
mkdir dist

# Load constants
source ./scripts/constants.sh

# Build chromium
mkdir $CHROMIUM_DIR

# Copy chromium manifest
cp -r src/chromium/* $CHROMIUM_DIR

# Copy assets to chromium dir
cp -r src/assets/* $CHROMIUM_DIR

# Build firefox
mkdir $FIREFOX_DIR

# Copy firefox manifest
cp -r src/firefox/* $FIREFOX_DIR

# Copy assets to firefox dir
cp -r src/assets/* $FIREFOX_DIR

# Zip chromium
cd $CHROMIUM_DIR
zip -r ../../dist/tmdb_player-chromium-$CHROMIUM_VERSION.zip .
cd ../..

# Zip firefox
cd $FIREFOX_DIR
zip -r ../../dist/tmdb_player-firefox-$FIREFOX_VERSION.zip .