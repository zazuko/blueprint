#!/bin/sh

DOWNLOAD_URL="${DOWNLOAD_URL:-}"
DOWNLOAD_NAME="${DOWNLOAD_NAME:-}"

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

# Make sure the data directory exists
mkdir -p /app/data

# If DOWNLOAD_URL is set, download the data
if [ -n "${DOWNLOAD_URL}" ]; then
  if [ -z "${DOWNLOAD_NAME}" ]; then
    DOWNLOAD_NAME="data$(date -u +'%Y%m%d%H%M%S').ttl"
  fi

  echo "Downloading data from '${DOWNLOAD_URL}' as '${DOWNLOAD_NAME}'…"
  curl -vvv -L -o "/app/data/${DOWNLOAD_NAME}" "${DOWNLOAD_URL}"
  echo ""
fi

ls -alh /app/data/*

# Loop over all files in the data directory and load them
for f in /app/data/*; do
  filename=$(basename "${f}")
  ext="${filename##*.}"
  graph="${filename%.*}"
  if [ "${ext}" = "ttl" ]; then
    echo "Loading '${f}' in graph urn:graph:${graph}…"
    curl -s -X PUT --fail-with-body -u admin:admin "http://store:3030/blueprint/data?graph=urn:graph:${graph}" \
      --data-binary "@${f}" --header "Content-Type: text/turtle"
  elif [ "${ext}" = "nt" ]; then
    echo "Loading '${f}' in graph urn:graph:${graph}…"
    curl -s -X PUT --fail-with-body -u admin:admin "http://store:3030/blueprint/data?graph=urn:graph:${graph}" \
      --data-binary "@${f}" --header "Content-Type: application/n-triples"
  else
    echo "Skipping '${f}'…"
    continue
  fi
  echo ""
done

echo "Done!"

exit 0
