$(document).ready(function() {
  var dt;
  var hours; 
  var mins;
  var meridiem;
  var nIntervId;
  
  //set up date and time
  function updateClock() {
    dt = new Date();
    hours = dt.getHours();
    mins = dt.getMinutes();
    
    mins = ( mins < 10 ? "0" : "" ) + mins;
    var time = hours + ":" + mins;
    var date = (dt.getMonth()+1) + "/" +  dt.getDate() + "/" + dt.getFullYear();
    $("#date").html(date);
    $("#time").html(time);
  }
  
  function updateTime() {
    nIntervId = setInterval(updateClock, 1000*60); //<---prints the time 
  }    
  
  updateClock();
  updateTime();
  
  //set up scales for degree and radians
  var deg = d3.scaleLinear().domain([0, 360]).range([0, 2 * Math.PI]);
  var rad = d3.scaleLinear().domain([0, 2 * Math.PI]).range([0, 360]);

  function fromCCToD3(val) {
      return (360 - val + 90) % 360;
  };

  function toCCFromD3(val) {
      return 360 - (val - 90);
  };

  var data = [
      [-80, 10, "#CCCCCC"],
      [10, 100, "#00FF00"],
      [100, 130, "#AA8888"],
      [130, 180, "#88BB88"],
      [180, 210, "#FF0000"],
      [210, 280, "#8888CC"]
  ];

  var START = 0,
      END = 1;
  var arcLen = 75;
  var handles = [{
      from: [0, END],
      to: [1, START],
      x: arcLen * Math.cos(deg(toCCFromD3(data[0][1]))),
      y: -(arcLen * Math.sin(deg(toCCFromD3(data[1][0])))),
      at: data[0][1]
  }, {
      from: [1, END],
      to: [2, START],
      x: arcLen * Math.cos(deg(toCCFromD3(data[1][1]))),
      y: -(arcLen * Math.sin(deg(toCCFromD3(data[2][0])))),
      at: data[1][1]
  }, {
      from: [2, END],
      to: [3, START],
      x: arcLen * Math.cos(deg(toCCFromD3(data[2][1]))),
      y: -(arcLen * Math.sin(deg(toCCFromD3(data[3][0])))),
      at: data[2][1]
  },
  {
      from: [3, END],
      to: [4, START],
      x: arcLen * Math.cos(deg(toCCFromD3(data[3][1]))),
      y: -(arcLen * Math.sin(deg(toCCFromD3(data[4][0])))),
      at: data[3][1]
  },
  {
      from: [4, END],
      to: [5, START],
      x: arcLen * Math.cos(deg(toCCFromD3(data[4][1]))),
      y: -(arcLen * Math.sin(deg(toCCFromD3(data[5][0])))),
      at: data[4][1]
  },
  {
      from: [5, END],
      to: [0, START],
      x: arcLen * Math.cos(deg(toCCFromD3(data[5][1]))),
      y: -(arcLen * Math.sin(deg(toCCFromD3(data[0][0])))),
      at: data[5][1]
  }];

  var handleWidth = 3;
  var color = d3.scaleOrdinal(d3.schemeCategory20c);

  var vis = d3.select("#donut");

  // Draw base donut graph
  var arc = d3.arc()
      .innerRadius(100)
      .outerRadius(150)
      .startAngle(function (d) { return deg(d[0]); })
      .endAngle(function (d) { return deg(d[1]); });

  vis.selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("class", "arcseg")
      .style("fill", function (d, i) { return color(i) }) // or use color func
      .attr("transform", "translate(150, 150)");


  // Setup Handles
  var arcHandle = d3.arc()
      .innerRadius(100)
      .outerRadius(150)
      .startAngle(function (d) {
          var from = data[d.from[0]][d.from[1]];
          var to = data[d.to[0]][d.to[1]];
          var degree = Math.min(from, to) - (handleWidth/2);
          return deg(degree);
      })
      .endAngle(function (d) {
          var from = data[d.from[0]][d.from[1]];
          var to = data[d.to[0]][d.to[1]];
          var degree = Math.min(from, to) + handleWidth / 2;
          return deg(degree);
       });

  // Drag Handler
  function dragmove(d, i) {
      var inRad = Math.atan2(-d3.event.y, d3.event.x);
      var degree = fromCCToD3(rad(inRad));
      var next = (i=== handles.length-1) ? 0 : i+1,
          prev = (i=== 0) ? handles.length-1 : i-1;

      var nextDeg = handles[next].at, prevDeg = handles[prev].at;

      d.lastAt = d.at;

      if (prevDeg > nextDeg) { prevDeg -= 360; }

      if (prevDeg < 0 && nextDeg < 0) {
          prevDeg += 360;
          nextDeg += 360;
      }

      if (prevDeg < 0 && nextDeg > 0 && degree > 180) {
          degree -= 360;
      }

      if (degree < prevDeg || degree > nextDeg) {
          return;
      }

      d.x = d3.event.x;
      d.y = d3.event.y;
      d.at = degree;
      data[d.from[0]][d.from[1]] = degree;
      data[d.to[0]][d.to[1]] = degree;


      data.forEach(function(arcdata) {
          if (arcdata[0] > arcdata[1]) {
              arcdata[0] -= 360;
          }

          if (arcdata[0] < 0 && arcdata[1] < 0) {
              arcdata[0] += 360;
              arcdata[1] += 360;
          }
      });

      d3.select(this).attr("d", arcHandle);
      d3.selectAll(".arcseg").attr("d", arc);

  }
  var handledrag = d3.drag()
      .on("drag", dragmove);

  vis.selectAll("g")
      .data(handles)
      .enter()
      .append("g")
      .append("path")
      .attr("d", arcHandle)
      .attr("class", "handle")
      .attr("transform", "translate(150,150)")
      .call(handledrag);
});
