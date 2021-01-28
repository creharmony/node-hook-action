#!/bin/bash

# CURL_OPTIONS="--verbose"
CURL_OPTIONS="--silent"

function startActions() {
  echo "POST http://localhost:1502/webhook with header 'x-token: customFlatSecret' and 'x-try: asyncSample"
  curl ${CURL_OPTIONS} \
      -H "x-token: customFlatSecret" \
      -H "x-try: asyncSample" \
      -X POST http://localhost:1502/webhook
  echo ""
}

function getActions() {
  echo "GET http://localhost:1502/webhook/actions"
  curl ${CURL_OPTIONS} \
       -H "x-token: customFlatSecret" \
       -X GET http://localhost:1502/webhook/actions
  echo ""
}

startActions

for run in {1..2}; do
    sleep 5
    getActions;
done