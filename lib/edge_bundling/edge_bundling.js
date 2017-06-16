// Based on Mike Bostock's https://bl.ocks.org/mbostock/7607999
var ModestCanvas = typeof ModestCanvas != "undefined" ? ModestCanvas : {};
ModestCanvas.edgeBundling = function(container, jsonData){
  var elementContainer = d3.select(container);
  var diameter = elementContainer.node().getBoundingClientRect().width,
    radius = diameter / 2,
    innerRadius = radius - 100;

  var cluster = d3.cluster()
    .size([360, innerRadius]);

  const line = d3.radialLine()
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; })
    .curve(d3.curveBundle.beta(0.95));

  var svg = elementContainer
    .classed('d3_chart_container', true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + diameter + " " + diameter)
    .classed('d3_edge_bundling', true)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

  var link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node"),
    textPath = svg.append("g").selectAll(".textPath");

  var root = d3.hierarchy(packageHierarchy(jsonData), function(d){return d.children;});
  var links = packageEdges(root.descendants());

  cluster(root);

  var nodes = root.descendants();

  link = link
    .data(links)
    .enter().append('path')
    .attr('class', 'link')
    .attr('stroke-width', function(l){return Math.max(3, Math.min(l.weight, 20)) + "px"})
    .attr('d', function(d){return line(d.source.path(d.target))})
    .attr('id', function(l){return "path_" + l.source.data.name + "_" + l.target.data.name});

  textPath = textPath
    .data(links)
    .enter().append('text')
    .append('textPath')
    .attr('class', 'textpath')
    .attr("dy", 10)
    .style("text-anchor","end")
    .attr("startOffset","100%")
    .attr('xlink:href', function(l){return "#path_" + l.source.data.name + "_" + l.target.data.name})
    .text(function(l){return l.weight + " items"});

  node = node
    .data(nodes.filter(function(n) { return !n.children; }))
    .enter().append("text")
    .attr("class", "node")
    .attr("dy", ".31em")
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
    .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .text(function(d) { return d.data.key.trunc(10); })
    .on("mouseover", mouseovered)
    .on("mouseout", mouseouted);

  function mouseovered(d) {
    node
      .each(function(n) { n.target = n.source = false; });

    link
      .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
      .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
      .filter(function(l) { return l.target === d || l.source === d; })
      .each(function() { this.parentNode.appendChild(this); });

    link
      .classed("link--trivial", function(l){return l.target != d && l.source != d})

    textPath
      .classed("textpath--show", function(l) { if (l.source === d) return l.target.target = true; })
      .filter(function(l) { return l.source === d; });

    node
      .classed("node--target", function(n) { return n.target; })
      .classed("node--source", function(n) { return n.source; });

    node
      .classed("node--trivial", function(n) { return !n.target && !n.source });
  }

  function mouseouted(d) {
    link
      .classed("link--target", false)
      .classed("link--source", false)
      .classed("link--trivial", false);

    textPath
      .classed("textpath--show", false);

    node
      .classed("node--target", false)
      .classed("node--source", false)
      .classed("node--trivial", false);
  }

  d3.select(self.frameElement).style("height", diameter + "px");

  function packageHierarchy(inputData) {
    var map = {};

    function find(name, data) {
      var node = map[name], i;
      if (!node) {
        node = map[name] = data || {name: name, children: []};
        if (name.length) {
          node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
          node.parent.children.push(node);
          node.key = name.substring(i + 1);
        }
      }
      return node;
    }

    inputData.forEach(function(d) {
      find(d.name, d);
    });

    return map[""];
  }

  function packageEdges(nodes) {
    var map = {},
      edges = [];

    // Compute a map from name to node.
    nodes.forEach(function(d) {
      map[d.data.name] = d;
    });

    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
      if (d.data.edges) d.data.edges.forEach(function(i) {
        edges.push({source: map[d.data.name], target: map[i.name], weight: i.weight});
      });
    });
    return edges;
  }
}
