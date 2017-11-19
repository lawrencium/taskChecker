#!/usr/bin/env bash
echo "Beginning deployment process"

echo "Packaging app..."
gulp package

echo "Zipping dist/ ..."
zip -r dist.zip dist/

echo "Getting access token..."
ACCESS_TOKEN=$(curl "https://accounts.google.com/o/oauth2/token" -d "client_id=${WEB_STORE_CLIENT_ID}&client_secret=${WEB_STORE_CLIENT_SECRET}&refresh_token=${WEB_STORE_REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token)

echo "Uploading app to web store..."
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T dist.zip -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}"

echo "Publishing..."
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST -v "https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}/publish"

echo "Deployment process complete!"
