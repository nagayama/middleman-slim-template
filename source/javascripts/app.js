var bs = {};

bs.stackedArea = function(el, data){

  // Constants
  var aspectRatio = 1 / 2,
      container = d3.select(el.get(0));

  
  // Axis generators
  var formatX = d3.time.format("%Y"),
      formatY = d3.format();

  var xAxis = d3.svg.axis()
    .orient("bottom")
    .tickFormat(formatX)
    .tickPadding("10"); // TODO: set padding in EM space

  var yAxis = d3.svg.axis()
    .orient("left")
    .tickFormat(formatY)
    .ticks(6) // TODO: Get smart about number of ticks  

  
  // Init mark generators
  var area = d3.svg.area()  // Area generator accesses y and y0 properties attached from stack generator
    .x(function(d) { return x(new Date(d[0]) ); 
    })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y) });

  var stack = d3.layout.stack()  // Stack layout attaches y and y0 properties to value pairs
    .values(function(d) { return d.values; })
    .offset("zero")
    .x(function(d) { return d[0] } )
    .y(function(d) { return d[1] } )

  stack(data); // Attach y, y0 to value pairs

  
  // Init scales
  var x = d3.time.scale()
      y = d3.scale.linear()
      color = d3.scale.category20();

  
  // Calculate domains
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

  
  // DOM Scaffolding 
  var header = container.append("h6").classed("title", true)
      .text("Chart Title Placeholder");

  var legend = container.append("ul").classed("legend", true);

  var chart = container.append("div").classed("chart", true);

  var marks = chart.append("svg").classed("marks", true);

  var axes = chart.append("svg").classed("axes", true);

  var gMarks = marks.append("g")
    .attr("class", "canvas");

  var gAxes = axes.append("g")
    .attr("class", "canvas");

  var gxAxis = gAxes.append("g")
    .attr("class", "x axis");

  var gyAxis = gAxes.append("g")
    .attr("class", "y axis");

  var series = gMarks.selectAll(".series")
    .data(data)
    .enter().append("g")
    .attr("class", "series");

  var areas = series.append("path")
    .attr("class", "area")
    .attr("d", function(d) { 
      return area(d.values); 
    })
    .style("fill", function(d) { return color(d.name); });



  // Render legend
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

  var render = function(){

    console.time("render");

    // Calculate current dimensions
    var containerWidth = el.width(),
        containerHeight = containerWidth * aspectRatio,
        margin = {top: 0, right: 0, bottom: 36, left: 0},  // TODO: set margins in EM space
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    
    // Update ranges and axis generators
    x.range([0, width]);
    y.range([height, 0]);
    xAxis.scale(x);
    yAxis
      .scale(y)
      .innerTickSize(-width);


    // Draw Axes
    chart
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom) 
    gAxes
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    gxAxis
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    gxAxis.selectAll("text")
      .attr("dx", ".25em")
      .style("text-anchor", "end");      

    gyAxis
      .call(yAxis); 

    gyAxis.selectAll("text")
      .attr("dx", "1em")
      .attr("dy", "1.25em")
      .style("text-anchor", "start");  


    // Update marks  TODO: only apply viewbox properties once. Split getting window props into seperate function
    marks
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    gMarks
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    console.timeEnd("render");

  }

  // Render and attach resize handler   TODO: debounce
  render.call();
  // d3.select(window).on("resize", render);

};



$(function(){

  d3.json("datasets/stackedAreaData.json", function(error, data) {
    var vis = bs.stackedArea($("#vis"), data);
  });

});