#!/bin/bash

# CURL_OPTIONS="--verbose"
CURL_OPTIONS="--silent"

echo "POST http://localhost:1502/webhook with header 'x-token: wrongSecret'"
curl ${CURL_OPTIONS} \
      -H "x-token: wrongSecret" \
      -X POST http://localhost:1502/webhook
echo ""
echo ""
echo "POST http://localhost:1502/webhook with header 'x-token: customFlatSecret'"
curl ${CURL_OPTIONS} \
      -d "param1=value1&param2=value2" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -H "x-token: customFlatSecret" \
      -X POST http://localhost:1502/webhook
