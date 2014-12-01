
var Cedar = Cedar || {}


Cedar.query = function(params) {
  options = {
    where: "1=1",
    returnGeometry: false,
    returnDistinctValues: false,
    returnIdsOnly: false,
    returnCountOnly: false,
    outFields: "*",
    f: "json"
  }
  if(params.group) {
    options.groupByFieldsForStatistics = params.group;
  }
  if(params.count) {
    options.orderByFields = params.count + "_SUM";
    options.outStatistics = JSON.stringify([
      {"statisticType": "sum", "onStatisticField": params.count, "outStatisticFieldName": params.count + "_SUM"}]);
  }
  return params.url + "/query?" + Cedar.serialize(options);
}
Cedar._agolData = "http://arcgis.com/sharing/rest/content/items/{item}/data?f=json"

Cedar.chart = function(params) {
  var self = this;

  //parse style
  var style;
  if(params.style.indexOf("http") > -1) {
    style = params.style;
  } else if(params.style.match(/^[a-f0-9]{32}$/)) {
    style = Cedar._agolData.supplant({item: params.style});
  } else {
    style = params.style + ".json"
  }

  //fetch style
  d3.json(style, function(spec) {
    self.styleJson = spec;
    self.generate(params);
  });
}



Cedar.generate = function(params){
  //check if we have data or use a query w/ the params
  params.data = params.data || Cedar.query(params);
  var chart = JSON.stringify(this.styleJson).supplant(params);
  Cedar.parse(params.el, JSON.parse(chart));
};


Cedar.fetchStyle = function(styleParam, cb){
  var self = this;
   //parse style
  var style;
  if(styleParam.indexOf("http") > -1) {
    style = styleParam;
  } else if(styleParam.match(/^[a-f0-9]{32}$/)) {
    style = Cedar._agolData.supplant({item: styleParam});
  } else {
    //look for a file
    style = styleParam + ".json"
  }

  //fetch style
  d3.json(style, function(spec) {
    self.styleJson = spec;
    cb(spec);
  });
}

/**
 * Allow json to be passed in
 */
Cedar.setStyle = function(json){
 this.styleJson = json;
}

/**
 * Parse the vega spec
 */
Cedar.parse = function(el, spec) {
  vg.parse.spec(spec, function(chart) { 
    console.log(el, spec); 
    chart({el: el}).update(); 
  });
}


String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

Cedar.serialize = function(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}