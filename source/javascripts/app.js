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

  
  // Mark generators
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

  // Init range based on aspect ratio
  x.range([0, 1000]);
  y.range([1000 * aspectRatio, 0]);

  
  // DOM Scaffolding 
  var header = container.append("h6").classed("title", true)
      .text("Chart Title Placeholder");

  var legend = container.append("ul").classed("legend", true);

  var chart = container.append("svg").classed("chart", true);

  var axes = chart.append("svg")
    .attr("class", "axes");

  var gxAxis = axes.append("g")
    .attr("class", "x axis");

  var gyAxis = axes.append("g")
    .attr("class", "y axis");  

  var marks = chart.append("svg").classed("marks", true);

  
  // Render marks
  var marksView = marks.append("svg")
    .attr("class", "viewbox")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + 1000 + " " + 1000 * aspectRatio);

  var series = marksView.selectAll(".series")
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
    var margin = {top: -3, right: 0, bottom: 36, left: 0},  // TODO: set margins in EM space
        containerWidth = el.width(),
        width = containerWidth - margin.left - margin.right,
        height = width * aspectRatio,
        containerHeight = height + margin.top + margin.bottom;

    chart
      .style('height', containerHeight);
    
    // Update ranges and axis generators
    x.range([0, width]);
    y.range([height, 0]);
    xAxis.scale(x);
    yAxis
      .scale(y)
      .innerTickSize(-width);

    // Draw Axes
    axes
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width);
    marks
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width);

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

    console.timeEnd("render");
  }

  // Render and attach throttled resize handler 
  render.call();
  d3.select(window).on("resize", throttle(render, 10));

  // Via remy sharp
  function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
      var context = scope || this;

      var now = +new Date,
          args = arguments;
      if (last && now < last + threshhold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

};



$(function(){

  d3.json("datasets/stackedAreaData.json", function(error, data) {
    var vis = bs.stackedArea($("#vis"), data);
  });

});