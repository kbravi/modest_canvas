var ModestCanvas = typeof ModestCanvas != "undefined" ? ModestCanvas : {};
ModestCanvas.scatterPlot = function(container, scatterData, args){
  var elementContainer = d3.select(container);
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = elementContainer.node().getBoundingClientRect().width - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var svg = elementContainer
      .classed('d3_scatterplot', true)
    .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var minCircleFillColor = args.minCircleFillColor || "#000000";
  var maxCircleFillColor = args.maxCircleFillColor || "#BBBBBB";

  var color = d3.scaleLinear().domain(scatterData.colors.domain).range([minCircleFillColor, maxCircleFillColor]);

  var xValue = function(d) { return d.coordinates.x;},
    xScale = d3.scaleLinear().range([0, width]),
    xMap = function(d) { return xScale(xValue(d));},
    xAxis = d3.axisBottom(xScale);

  var yValue = function(d) { return d.coordinates.y;},
    yScale = d3.scaleLinear().range([height, 0]),
    yMap = function(d) { return yScale(yValue(d));},
    yAxis = d3.axisLeft(yScale);

  if(scatterData.axes.enabled == true){
    xScale.domain([d3.min(scatterData.values, xValue) - 0.2, d3.max(scatterData.values, xValue) + 0.2]);
    yScale.domain([d3.min(scatterData.values, yValue) - 1, d3.max(scatterData.values, yValue) + 1]);

    if(scatterData.axes.x.customTicks != undefined){
      xAxis.tickFormat(function(d){return (scatterData.axes.x.customTicks[d] != undefined) ? scatterData.axes.x.customTicks[d] : "";});
    }

    if(scatterData.axes.y.customTicks != undefined){
      yAxis.tickFormat(function(d){return (scatterData.axes.y.customTicks[d] != undefined) ? scatterData.axes.y.customTicks[d] : "";});
    }

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(scatterData.axes.x.label);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(scatterData.axes.y.label);
  }

  var circles = svg.selectAll(".dot")
      .data(scatterData.values)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 5.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .attr("onclick", function(d) {return (d.point.attributes.onclick != undefined) ? d.point.attributes.onclick : "";})
      .style("fill", function(d) { return (scatterData.colors.x_based == true) ? color(d.coordinates.x) : color(d.coordinates.y);});

  if(scatterData.tooltip.enabled == true){
    var tooltip = elementContainer.append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    circles.on("mouseover", function(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(d.tooltip.text)
        .style("left", (d3.event.pageX - elementContainer.node().getBoundingClientRect().left - margin.left + 45) + "px")
        .style("top", (d3.event.pageY - elementContainer.node().getBoundingClientRect().top + margin.top - 28) + "px");
    });
    circles.on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
  }

  if(scatterData.legend.enabled == true){
    var legend = svg.selectAll(".legend")
        .data(scatterData.legend.domain)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 18)
      .attr("rx", 18)
      .attr("ry", 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d){return color(d.for);});

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d.label;})
  }
}
