# Graphs are hard to understand, but they are a powerful tool for understanding data

A friend told me once we as humans work in a linear way, we can only understand things that are linear. It was a funny statement for me. Because our Brain is not linear at all. It is a highly complex network of neurons that work in a non-linear way. We are able to learn and develop pattern recognition, which is a non-linear process. Our brain is able to filter information, recognize patterns, associate ideas, and create new ones. Connect things to to things we already know, and create new knowledge. Humans are not working in a linear way. The first part of the statement, work in a linear way, is wrong . But the second part has a point. It's easier to understand things that are linear.

- "The human brain is a pattern recognition machine" - Jeff Hawkins

## A knowledge graph is not knowledge

One of the first things I have learned in knowledge management was that there is a difference between knowledge and information. We can say that information is data in a certain context. If you see the number "178". You know it's a number. But you don't know what it means. If you see the number "178" in a context, for example, "178 cm". Now you know it is probably a distance. If you see the number "178" in the context "178 cm" and "height". Now you know it's a height. If you see the number "178" in the context "178 cm", "height" and "person". Now you know it's a person's height. If you see the number "178" in the context "178 cm", "height", "person" and "John". Now you know it's John's height. You see that data with context becomes information. The context is important to understand the data. 

And what is knowledge then? Knowledge is always bound to a Person. Now you know now John is 178cm tall. I know it too but we don't know who this John is but we know there is a John. And my experience tells me that John height is very average and John is probably male. And male has something todo with an Y chromosome. But then my knowledge gets blurry. What are chromosomes again? 

It's important to understand that we can provide Data and Context becoming information. When people get in contact with information they can create knowledge. The created knowledge is based on the Person's experience and all what he lived through. 

This was a very short introduction to the difference between data, information and knowledge.

## The problem: Graphs are hard to understand

 Apart from tree structures like company hierarchies, there are several other graph patterns that can exist in a highly connected graph. Here are some common ones:

## Star Pattern
 In this pattern, one central node is connected to several peripheral nodes, resembling a star. This is common in scenarios like social networks, where a user (central node) is connected to multiple friends (peripheral nodes), but the friends might not be directly connected to each other.

## Chain Pattern
This pattern forms a linear sequence of nodes where each node is connected to the next one, but there are no connections between non-consecutive nodes. It can represent sequences or processes in various domains.

## Clique Pattern
A clique is a subset of nodes where every node is directly connected to every other node in the subset. This pattern is common in social networks where a group of people all know each other.

## Cycle Pattern
In a cycle, nodes are connected in a circular manner, forming a loop. This pattern can represent feedback loops or recurring processes.

## Mesh Pattern
In a mesh, nodes are interconnected in a non-hierarchical, interconnected network. This pattern is common in complex systems where entities have multiple connections with each other.

## Hierarchical Pattern
Apart from the typical tree structure, hierarchical patterns can also involve multiple layers of nested trees or hierarchies. This is common in organizational structures or taxonomies.

## Bridge Pattern
In this pattern, certain nodes act as bridges between different clusters or components of the graph. They facilitate connections between otherwise disconnected parts of the graph.

## Hub-and-Spoke Pattern
Similar to the star pattern, but with multiple central nodes (hubs) connected to peripheral nodes (spokes), and possibly connected to each other as well. This pattern is common in transportation or distribution networks.

## Community Structure
This pattern involves the identification of densely connected subgraphs or communities within the larger graph. Nodes within a community tend to have more connections with each other compared to nodes outside the community.

## Bi-Partite or N-Partite Pattern
In this pattern, nodes are divided into two or more disjoint sets, and edges only connect nodes from different sets. This pattern is common in recommendation systems where one set represents users and another set represents items.

# Aggregation or inside the box or outside the box
 In the context of graph theory or network analysis, a similar concept might be called "graph abstraction" or "graph summarization."

Graph abstraction involves representing complex or detailed structures within a graph in a simplified or higher-level manner, focusing only on the essential characteristics or relationships while omitting internal details. This allows users to work with a more manageable and understandable representation of the graph without being overwhelmed by its intricacies.

In some cases, this abstraction process may involve collapsing or summarizing certain nodes or edges into higher-level entities, effectively hiding the internal details while preserving the overall structure and connectivity of the graph. This is akin to viewing an integrated circuit at a higher level of abstraction, where you only see the inputs, outputs, and high-level functionality without needing to know the specific details of the internal components.

Graph summarization techniques vary depending on the specific requirements and characteristics of the graph, and they can range from simple aggregation methods to more sophisticated algorithms that identify and preserve important structural properties or patterns within the graph while discarding less relevant details.


# Pattern in Blueprint

There are some patterns interesting for Blueprint.


## Hierarchical Pattern

This pattern is implemented in the Blueprint. The Blueprint is a hierarchical structure. It is used to show Tree Information.

### Interesting patterns

#### Chain Pattern



# Aggregations 

An aggregation are things that belong together. A business object consists of several attributes. The attributes are aggregated to the business object, or a Project consists of several elements like git repositories. 
The two examples are different. In the business Object case the attributes are part of the business object (the aggregation acts like a Composite. A business object is composed by several Attributes).

The project example is different. The git repositories are not part of the project. They are just related to the project. The difference is that the aggregation is a logical connection that groups things together. The instances can exists without the aggregation.

## Composite
Elements that are part of a composite can not exist without the composite. The composite is the parent of the elements. The elements are the children of the composite. The composite is responsible for the elements. If the composite is deleted, the elements are deleted too.


## Container
Elements that are part of a container can exist without the container. The container is the parent of the elements. The elements are the children of the container. The container is responsible for the elements. If the container is deleted, the elements are not deleted.





