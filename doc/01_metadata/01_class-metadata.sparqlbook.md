# Nilea UI Configuration

Nilea utilizes the data and relationships within your Knowledge Graph to improve visibility and provide valuable insights.

With Nilea, you have the ability to configure which objects within your Knowledge Graph are visible in the user interface. This allows you to tailor the presentation of your graph to your specific needs and preferences, ensuring that you're able to easily access and analyze the information that matters most to you.
## Configure Visible Classes

Nilea Class metadata, also known as 'ui class meta data,' is used to configure the display label, description, color, search priority, and icon for each visible class in Nilea.

Let's say it with an example. This is the UI class metadata for a Kubernets Cluster. 

```turtle
flux:ClusterFluxClassInstance
        rdf:type               nileaMetaShapes:ClassMetadataShape ;
        rdfs:comment           "K8S Cluster" ;
        rdfs:label             "Cluster" ;
        fluxSchema:faIcon      "fas fa-microchip" ;
        fluxSchema:colorIndex  6 ;
        fluxSchema:searchPrio  3 ;
        sh:targetNode          k8s:Cluster ;
.
```

| Syntax                | Value              | UI Impact |
| --------------------- | ------------------ | ----------|
| rdfs:label            | "Cluster"          | Display Label         |
| rdfs:comment          | "K8S Cluster"      | Display Comment         |
| fluxSchema:faIcon     | "fas fa-microchip" | Font Awesome Icon string you find them [here](https://fontawesome.com/search?o=r&m=free) |
| fluxSchema:colorIndex | 6                  | The color palette index (0 - 9 is valid)      |
| fluxSchema:searchPrio | 3                  | This is a multiplier for the search score (higher = better)         |
| sh:targetNode         | k8s:Cluster        | Apply this configuration to the k8s:Cluster class        |



### See the current configuration

The class metadata is stored in your database and can be queried to retrieve and modify attributes for each class within Nilea. Here some example queries. 

```sparql
#
# Get all ClassMetadataShape with the label
# 
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX nileaMetaShapes: <https://ld.flux.zazuko.com/shapes/metadata/>

SELECT ?meta ?label
WHERE {
  ?meta a nileaMetaShapes:ClassMetadataShape .
  ?meta rdfs:label ?label . 
}

```

```sparql
#
# Get all the properties of one ClassMetadataShape
#
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX nileaMetaShapes: <https://ld.flux.zazuko.com/shapes/metadata/>

SELECT ?metaInstance ?p ?o WHERE {
    {
        SELECT ?metaInstance WHERE {
            ?metaInstance a nileaMetaShapes:ClassMetadataShape .
        } LIMIT 1
    }
    ?metaInstance ?p ?o .
}

```
