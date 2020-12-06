#!/bin/bash
 curl -d "param1=value1&param2=value2" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -H "x-token: simpleFlatSecret" \
      -X POST http://localhost:1502/webhook