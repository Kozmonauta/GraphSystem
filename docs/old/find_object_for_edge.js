Find Event objects by connection
This object refers to $connections.$item

{
    "classId": 1,
    "label": "Event",
    "edgeLabel": "REPORTED",
    "edgeDirection": "in",
    "connected.classId": 2
    "connected.label": "Profile"
}

{
    "label": "REPORTED",
    "direction": "in",
    "connected.classId": 2
    "connected.label": "Profile"
}

------
query: 
MATCH ($this.label:n)<-[e:REPORTED]-(c) WHERE ID(n) = $this.id AND n.classId = $this.class.id

