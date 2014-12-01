'use strict';

angular.module('cypress')
  .controller('ChartsCtrl', function ($scope, $http, $filter, $q) {

    //gha - globals! dom manipulation! breaking so many ng-ruleses
    $scope.model = {
      "data": {
        "url":"http://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Education_WebMercator/MapServer/5",
       
      },
      "style":"scatter",
      "styleObj":{},
      "styleJson":"{}",
      "canRender":false

    };

    //immediately fetch the fields and the style
    // $scope.getFields();
    // $scope.fetchStyle();

    $scope.canRender = function(){
      return $scope.model.canRender;
    };

    $scope.fetchStyle = function(model){
      //GAH! Horror! Averty your eyes!
      Cedar.fetchStyle(model.style, $scope.fetchStyleCallback);
    };

    $scope.fetchStyleCallback = function(styleJson){
      
      $scope.model.styleObj = styleJson;
      $scope.model.styleJson = $filter('json')(styleJson);
      $scope.model.canRender = true;
      $scope.model.data.inputs = styleJson.inputs;
      $scope.$apply();
    };

    /**
     * Clean promisified way to get json
     */
    $scope.fetchJson = function(url){
      var dfd = $q.defer();

     $http({method:'GET', url: url})
      .success(function(json,status,headers){
        dfd.resolve(json);
      })
      .error(function(json,status,headers){
        console.error('Error featching feature layer json! Url ' + url);
        dfd.reject('Error fetching ' + url);
      });

      return dfd.promise;
    }

    $scope.updateChart = function(model){
      //roll over the model params and rip out name
      var params = {}
      angular.forEach(model.params, function(val, key){
        params[key] = val.name;
      });
      //var params = model.params;
      params.url = model.data.url;
      params.el = "#chart-area";

      var style = JSON.parse($scope.model.styleJson);
      Cedar.setStyle(style);
      

      Cedar.generate(params);  
    };

    $scope.setupEditor = function(model){
      var fieldsUrl =  model.data.url + "?f=json";
      var styleUrl = Cedar.getStyleUrl(model.style);
      
      var fieldsPromise = $scope.fetchJson(fieldsUrl);
      var stylePromise = $scope.fetchJson(styleUrl);

      $q.all([fieldsPromise, stylePromise])
      .then(function(data){
        $scope.model.data.fields = data[0].fields;

        $scope.model.styleObj = data[1];
        $scope.model.styleJson = $filter('json')(data[1]);
        $scope.model.canRender = true;
        $scope.model.data.inputs = data[1].inputs;
        //ensure we don't push old params
        delete $scope.model.params;


      })
      .catch(function(err){
        console.error('Error setting up the editor');
      });
      
    };

    $scope.fetchFields = function(model){
      var url = model.data.url + "?f=json";

      $scope.fetchJson(url)
      .then(function(json){
        $scope.model.data.fields = json.fields;
      })
      .catch(function(err){
        console.error('Error featching feature layer json! Url ' + url);
      });
    }
    
  });