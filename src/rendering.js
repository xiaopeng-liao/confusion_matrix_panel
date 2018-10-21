import _ from 'lodash';
import $ from 'jquery';
import 'jquery.flot';
import 'jquery.flot.pie';
import * as d3 from "d3";

export default function link(scope, elem, attrs, ctrl) {
  var data, panel;
  elem = elem.find('.piechart-panel__chart');
  var $tooltip = $('<div id="tooltip">');

  ctrl.events.on('render', function () {
    render(false);
    if (panel.legendType === 'Right side') {
      setTimeout(function () { render(true); }, 50);
    }
  });

  function getLegendHeight(panelHeight) {
    if (!ctrl.panel.legend.show || ctrl.panel.legendType === 'Right side' || ctrl.panel.legendType === 'On graph') {
      return 20;
    }

    if (ctrl.panel.legendType == 'Under graph' && ctrl.panel.legend.percentage || ctrl.panel.legend.values) {
      let breakPoint = parseInt(ctrl.panel.breakPoint) / 100;
      var total = 23 + 20 * data.length;
      return Math.min(total, Math.floor(panelHeight * breakPoint));
    }
  }

  function formatter(label, slice) {
    var slice_data = slice.data[0][slice.data[0].length - 1];
    var decimal = 2;
    var start = "<div style='font-size:" + ctrl.panel.fontSize + ";text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>";

    if (ctrl.panel.legend.percentageDecimals) {
      decimal = ctrl.panel.legend.percentageDecimals;
    }
    if (ctrl.panel.legend.values && ctrl.panel.legend.percentage) {
      return start + ctrl.formatValue(slice_data) + "<br/>" + slice.percent.toFixed(decimal) + "%</div>";
    } else if (ctrl.panel.legend.values) {
      return start + ctrl.formatValue(slice_data) + "</div>";
    } else if (ctrl.panel.legend.percentage) {
      return start + slice.percent.toFixed(decimal) + "%</div>";
    } else {
      return start + '</div>';
    }
  }

  function noDataPoints() {
    var html = '<div class="datapoints-warning"><span class="small">No data points</span></div>';
    elem.html(html);
  }

  function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }

  function updateHeatmap() {
    console.warn("heat map enter...");
    d3.select("svg").remove();
    var svgContainer = d3.select(".confusion-matrix").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 500");

    var cwidth = parseFloat(ctrl.panel.classWidth)
    console.info('cwidth',cwidth);

    var colorScale = d3.scaleLinear()
    .domain([0.1, 1])
    .range([d3.rgb("#004080"), d3.rgb('#F08000')]);

    var theData = ctrl.data;
    const targets = theData.map(x => x.label).filter(onlyUnique).sort();
    var labelDict = {}
    targets.forEach((el, index) => labelDict[el] = index);
    console.info('targets',labelDict,theData);
    var cm = [];

    for(var i=0;i<targets.length;i++){
      for(var j=0;j<targets.length;j++){
        cm[i*targets.length + j] = {'p':i,'t':j,'v':0}
      }
    }

    theData.map(x=> cm[labelDict[x.label]*targets.length + labelDict[x.label]].v=x.data)
    svgContainer.selectAll('rect').data(cm).enter().append('rect')
    .attr('x',function(d){return d.p*(cwidth+2);})
    .attr('y',function(d){return d.t*(cwidth+2);})
    .attr('width',cwidth)
    .attr('height',cwidth)
    .style('fill',function(d) {return colorScale(d.v/100.)})
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);
  }

  // Create Event Handlers for mouse
  function handleMouseOver(d, i) {  // Add interactivity
    // Use D3 to select element, change color and size
    d3.select(this).style('fill','green');
  }

  function handleMouseOut(d, i) {  // Add interactivity
    var colorScale = d3.scaleLinear()
    .domain([0.1, 1])
    .range([d3.rgb("#004080"), d3.rgb('#F08000')]);
    // Use D3 to select element, change color and size
    d3.select(this).style('fill',colorScale(d.v/100.));
  }

  function render(incrementRenderCounter) {
    if (!ctrl.data) { return; }

    data = ctrl.data;
    panel = ctrl.panel;

      if (0 == ctrl.data.length) {
        noDataPoints();
      } else {
        updateHeatmap();
      }

    if (incrementRenderCounter) {
      ctrl.renderingCompleted();
    }
  }
}

