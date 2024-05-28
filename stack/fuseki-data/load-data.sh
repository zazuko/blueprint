#!/bin/sh

set -eu

echo "=========================="
echo "Wait for the triple store…"
echo "=========================="
echo ""
curl -s --retry 10 --retry-all-errors 'http://store:3030/$/ping'
sleep 2

echo "============================="
echo "Loading data to triple store…"
echo "============================="
echo ""

# loop over all .ttl files
for f in /app/data/*.ttl; do
  graph=$(basename -s .ttl "${f}")
  echo "Loading '${f}' in graph urn:graph:${graph}…"
  curl -s --fail-with-body -u admin:admin "http://store:3030/blueprint/data?graph=urn:graph:${graph}" --data-binary "@${f}" --header "Content-Type: text/turtle"
  echo ""
done

echo "Done!"

exit 0
