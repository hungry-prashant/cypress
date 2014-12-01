'use strict';

angular.module('cypress')
  .controller('ChartsCtrl', function ($scope, $http, $filter) {
    //gha - globals! dom manipulation! 
    $scope.model = {
      "data": {
        "url":"http://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Education_WebMercator/MapServer/5"
      },
      "style":"bf8b9ecffac54bda99b0b6f3058f160a",
      "styleObj":{},
      "styleJson":"{}",
      "canRender":false
    };

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
      $scope.$apply();
    };

    $scope.updateChart = function(model){
      var params ={
        "el": "#chart-area",
        "x": "CAPACITY",
        "y": "POPULATION_ENROLLED_2008",
        "color": "FACUSE"
      };

      params.url = model.data.url;

      var style = JSON.parse($scope.model.styleJson);
      Cedar.setStyle(style);
      

      Cedar.generate(params);  
    }
    
  });