var ModestCanvas = typeof ModestCanvas != "undefined" ? ModestCanvas : {};
ModestCanvas.donutChart = function(container, cloudData, args){
  if(args == undefined){args = {}}
  var elementContainer = d3.select(container);
  var minCategoryFillColor = args.minCategoryFillColor || "red";
  var maxCategoryFillColor = args.maxCategoryFillColor || "blue";
  var maxCenterSubtextFontSize = args.maxCenterSubtextFontSize || 18;
  var maxCenterTextFontSize = args.maxCenterTextFontSize || 18;

  var categories = d3.nest().key(function(d) { return d.category; }).map(cloudData.values).keys();
  var diameter = elementContainer.node().getBoundingClientRect().width,
      radius = diameter / 2;

  var restingOuterRadiusFactor = 0.95,
      restingInnerRadiusFactor = 0.65,
      focusOuterRadiusFactor = 1.0,
      focusInnerRadiusFactor = 0.65,
      restingCircleRadiusFactor = 0.6,
      focusCircleRadiusFactor = 0.65;

  var color = d3.scaleOrdinal().domain(categories).range(d3.range(categories.length).map(d3.scaleLinear().domain([0, categories.length - 1]).range([minCategoryFillColor, maxCategoryFillColor]).interpolate(d3.interpolateLab)));

  var arc = function(outerRadiusFactor, innerRadiusFactor){
      return d3.arc()
        .outerRadius(outerRadiusFactor * radius)
        .innerRadius(innerRadiusFactor * radius);
    }

  var pie = d3.pie()
      .sort(null)
      .value(function(d) { return d.value; });

  var svg = elementContainer.append("svg")
      .classed('d3_donut_svg', true)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + (diameter) + " " + (diameter))
    .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

  var paths = svg.selectAll('.donut')
      .data(pie(cloudData.values))
      .enter()
    .append("g")
      .attr("class", "donut")
    .append("path")
      .attr("class", "donut_segment")
      .attr("d", arc(restingOuterRadiusFactor, restingInnerRadiusFactor))
      .style("fill", function(d) { return d.data.color || color(d.data.category);})
      .attr("onclick", function(d){return (d.data.onclick != undefined) ? d.data.onclick : ""})
      .on("mouseover", arcMouseovered)
      .on("mouseout", arcMouseouted);

  function arcMouseovered(d){
    paths
      .filter(function(p){return d.data.category == p.data.category})
      .classed('donut_segment_select', true)
      .transition()
      .attr('d', arc(focusOuterRadiusFactor, focusInnerRadiusFactor));
    if(centerSubText != undefined){
      centerSubText
        .style('font-size', '1px')
        .style('fill', d.data.color || color(d.data.category))
        .text(d.data.center_subtext)
        .style("font-size", function(d) { return Math.min((0.8 * restingCircleRadiusFactor * diameter)/this.getBBox().width, (0.8 * restingCircleRadiusFactor * diameter)/this.getBBox().height, maxCenterSubtextFontSize) + "px"; });
    }
  }

  function arcMouseouted(d){
    paths
      .filter(function(p){return d.data.category == p.data.category})
      .classed('donut_segment_select', false)
      .transition()
      .duration(750)
      .ease(d3.easeBounceOut)
      .attr('d', arc(restingOuterRadiusFactor, restingInnerRadiusFactor));
    if(centerSubText != undefined){
      centerSubText
        .style('font-size', '1px')
        .style('fill', cloudData.center_subtext.color)
        .text(cloudData.center_subtext.text)
        .style("font-size", function(d) { return Math.min((0.8 * restingCircleRadiusFactor * diameter)/this.getBBox().width, (0.8 * restingCircleRadiusFactor * diameter)/this.getBBox().height, maxCenterTextFontSize) + "px"; });
    }
  }

  if(cloudData.center_circle.enabled){
    var centerCircle = svg
    .append("svg:circle")
      .classed("center_circle", true)
      .attr("r", radius * restingCircleRadiusFactor)
      .style('fill', cloudData.center_circle.color || "#E7E7E7")
      .on("mouseover", circleMouseovered)
      .on("mouseout", circleMouseouted)

    function circleMouseovered(d){
      centerCircle
        .transition()
        .attr('r', radius * focusCircleRadiusFactor);
    }

    function circleMouseouted(d){
      centerCircle
        .transition()
        .duration(750)
        .ease(d3.easeBounceOut)
        .attr('r', radius * restingCircleRadiusFactor);
    }
  }

  if(cloudData.center_text.enabled){
    var centerText = svg
      .append('text')
        .classed("center_text", true)
        .attr('y', radius * -0.16)
        .attr('text-anchor', 'middle')
        .style('font-size', '1px')
        .style('fill', cloudData.center_text.color)
        .text(cloudData.center_text.text)
        .style("font-size", function(d) { return Math.min((0.8 * restingCircleRadiusFactor * diameter)/this.getBBox().width, (0.8 * restingCircleRadiusFactor * diameter)/this.getBBox().height, maxCenterTextFontSize) + "px"; });
  }

  if(cloudData.center_subtext.enabled){
    var centerSubText = svg
      .append('text')
        .classed("center_subtext", true)
        .attr('y', radius * 0.16)
        .attr('text-anchor', 'middle')
        .style('font-size', '1px')
        .style('fill', cloudData.center_subtext.color)
        .text(cloudData.center_subtext.text)
        .style("font-size", function(d) { return Math.min((0.8 * restingCircleRadiusFactor * diameter)/this.getBBox().width, (0.8 * restingCircleRadiusFactor * diameter)/this.getBBox().height, maxCenterSubtextFontSize) + "px"; });
  }
}
