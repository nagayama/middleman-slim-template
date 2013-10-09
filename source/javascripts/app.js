var aspectRatio = 1 / 2

// Fill container wdith
containerWidth = $("#vis").width();
containerHeight = containerWidth * aspectRatio;


// Init SVG with margin convention
// TODO: Explore methods for updating margins relatively in repaint cycle
var margin = {top: 0, right: 0, bottom: 36, left: 0},  
  width = containerWidth - margin.left - margin.right,
  height = containerHeight - margin.top - margin.bottom;

var vis = d3.select("#vis");

var header = vis.append("h6").classed("title", true)
    .text("Chart Title Placeholder");

var legend = vis.append("ul").classed("legend", true);

var svg = vis.append("svg").classed("chart", true)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .attr("preserveAspectRatio", "xMinYMin meet")
    // .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Scales
var x = d3.time.scale().range([0, width])
    y = d3.scale.linear().range([height, 0])
    color = d3.scale.category20();

// Axis generators
var formatX = d3.time.format("%Y"),
    formatY = d3.format();

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickFormat(formatX)
  .tickPadding("10");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(formatY)
  .ticks(6) // TODO: Get smart about number of ticks
  .innerTickSize(-width);

// Mark generators
var area = d3.svg.area()  // Area generator accesses y and y0 properties attached from stack generator
  .x(function(d) { return x(new Date(d[0]) ); 
  })
  .y0(function(d) { return y(d.y0); })
  .y1(function(d) { return y(d.y0 + d.y) });

var stack = d3.layout.stack()  // Stack layout attaches y and y0 properties to each values pair array
  .values(function(d) { return d.values; })
  .offset("zero")
  .x(function(d) { return d[0] } )
  .y(function(d) { return d[1] } )


// Render
d3.json("datasets/stackedAreaData.json", function(error, data) {

  // Stack layout attaches y and y0 properties to value pair arrays
  stack(data);

  // Set Domains
  var yMax;
  data.forEach(function(d){
    d.values.forEach(function(d){
      if(yMax < d.y0 + d.y || yMax === undefined){ 
        yMax = d.y0 + d.y ;
      }
    });
  });
  y.domain([0,yMax]);
   
  x.domain(d3.extent(data[0].values, function(d) { return new Date(d[0]); }));

  var names = [];
  data.forEach(function(d){
    names.push(d.name);
  });
  color.domain(names);


  // Draw Axes
  gx = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  gx.selectAll("text")
    .attr("dx", ".25em")
    .style("text-anchor", "end");

  gy = svg.append("g")
    .attr("class", "y axis")
    .call(yAxis); 

  gy.selectAll("text")
    .attr("dx", "1em")
    .attr("dy", "1.25em")
    .style("text-anchor", "start");


  // Draw areas
  var series = svg.selectAll(".series")
    .data(data)
    .enter().append("g")
    .attr("class", "series");

  series.append("path")
    .attr("class", "area")
    .attr("d", function(d) { 
      return area(d.values); 
    })
    .style("fill", function(d) { return color(d.name); });

  // Draw legend
  var legendListItems = legend.selectAll("li")
    .data(data)
    .enter()
    .append("li");

  legendListItems.append("span").classed("circle", true)
    .style("background", function(d){
      return color(d.name);
    });

  legendListItems.append("span").classed("text", true).text(function(d){
    return d.name;
  });

});