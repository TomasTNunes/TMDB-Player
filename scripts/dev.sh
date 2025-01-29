# Run the build script
source ./scripts/build.sh

# Zip the contents inside the CHROMIUM_DIR
cd $CHROMIUM_DIR
zip -r ../chromium-dev-$CHROMIUM_VERSION.zip *

# Zip the contents inside the FIREFOX_DIR
cd ../../$FIREFOX_DIR
zip -r ../firefox-dev-$FIREFOX_VERSION.zip *