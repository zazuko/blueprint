#!/bin/sh

##################################################################
# Check for required environment variables                       #
# In case they are not set, use default config.json file instead #
##################################################################

if [ -z "${ENDPOINT_URL}" ]; then
  echo "ENDPOINT_URL is not set, let's keep the current config.json file."
  exit 0
fi

if [ -z "${SPARQL_CONSOLE_URL}" ]; then
  echo "SPARQL_CONSOLE_URL is not set, let's keep the current config.json file."
  exit 0
fi

if [ -z "${GRAPH_EXPLORER_URL}" ]; then
  echo "GRAPH_EXPLORER_URL is not set, let's keep the current config.json file."
  exit 0
fi

#########################################################
# Set default values for optional environment variables #
#########################################################

if [ -z "${FULL_TEXT_SEARCH_DIALECT}" ]; then
  echo "FULL_TEXT_SEARCH_DIALECT is not set, let's use 'fuseki' as default value."
  FULL_TEXT_SEARCH_DIALECT="fuseki"
fi

if [ -z "${NEPTUNE_FTS_ENDPOINT}" ]; then
  # Check if the full-text search endpoint is set to "neptune", and only display the warning message in this case
  if [ "${FULL_TEXT_SEARCH_DIALECT}" = "neptune" ]; then
    echo "NEPTUNE_FTS_ENDPOINT is not set, let's use 'http://example.com/' as default value."
  fi
  NEPTUNE_FTS_ENDPOINT="http://example.com/"
fi

########################################################
# Generate config.json file from environment variables #
########################################################

jq -n \
  --arg endpointUrl "${ENDPOINT_URL}" \
  --arg sparqlConsoleUrl "${SPARQL_CONSOLE_URL}" \
  --arg graphExplorerUrl "${GRAPH_EXPLORER_URL}" \
  --arg fullTextSearchDialect "${FULL_TEXT_SEARCH_DIALECT}" \
  --arg ftsEndpoint "${NEPTUNE_FTS_ENDPOINT}" \
  '{
    "endpointUrl": $endpointUrl,
    "sparqlConsoleUrl": $sparqlConsoleUrl,
    "graphExplorerUrl": $graphExplorerUrl,
    "fullTextSearchDialect": $fullTextSearchDialect,
    "neptune": {
      "ftsEndpoint": $ftsEndpoint
    }
  }' > /app/dist/blueprint/browser/config.json

exit 0
