
var w = 960;
var h = 960;
var rx = w / 2;
var ry = h / 2;
var splines = [];
var m0;

var bundle = d3.layout.bundle();

var cluster = d3.layout.cluster()
    .size([360, rx - 240])
    .sort(function(a, b) { return d3.ascending(a.key, b.key); });

var line = d3.svg.line.radial()
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; })
    .interpolate("bundle")
    .tension(1);

var svg = d3.select(".prereq-graph").append("svg:svg")
    .attr("width", w)
    .attr("height", w)
  .append("svg:g")
    .attr("transform", "translate(" + rx + "," + ry + ")");

//----------------------------------------------------------------------------

d3.json("prereqs.json", function(prereqs) {
  var data    = transform(prereqs)
  var nodes   = cluster.nodes(data);
  var links   = linkNodes(nodes);
  var splines = bundle(links);

  var path = svg.selectAll("path.link")
      .data(links)
    .enter().append("svg:path")
      .attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
      .attr("d", function(d, i) { return line(splines[i]); });

  svg.selectAll("g.node")
      .data(nodes.filter(function(n) { return !n.children; }))
    .enter().append("svg:g")
      .attr("class", "node")
      .attr("id", function(d) { return "node-" + d.key; })
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    .append("svg:text")
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(d) { return d.name; })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);
});

//----------------------------------------------------------------------------

function transform (prereqs) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find('');
        node.parent.children.push(node);

        // Literal '.' not allowed in selector,
        // so replace it with an underscore.
        node.key = name.replace(/\./g, "_"); 
      }
    }
    return node;
  }

  prereqs.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
};

//----------------------------------------------------------------------------

function linkNodes (nodes) {
  var map = {},
  links = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
      map[d.name] = d;
  });

  // For each prereq, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.prereqs) d.prereqs.forEach(function(i) {
      links.push({source: map[d.name], target: map[i]});
    });
  });

  return links;
};

//----------------------------------------------------------------------------

function mouseover(d) {
  svg.selectAll("path.link.target-" + d.key)
      .classed("target", true)
      .each(updateNodes("source", true));

  svg.selectAll("path.link.source-" + d.key)
      .classed("source", true)
      .each(updateNodes("target", true));
}

//----------------------------------------------------------------------------

function mouseout(d) {
  svg.selectAll("path.link.source-" + d.key)
      .classed("source", false)
      .each(updateNodes("target", false));

  svg.selectAll("path.link.target-" + d.key)
      .classed("target", false)
      .each(updateNodes("source", false));
}

//----------------------------------------------------------------------------

function updateNodes(name, value) {
  return function(d) {
    if (value) this.parentNode.appendChild(this);
    svg.select("#node-" + d[name].key).classed(name, value);
  };
}
