'use strict';

angular.
  module('AlpGatewayApp').
    controller('XbeeController', function($rootScope, $scope,  $http) {

      $scope.addPlug = function() {
        console.log("add plug");
        $rootScope.addMessage = "Scanning...";
        $http({
          method: 'GET',
          url: '/add/plug'
        }).then(function successCallback(response) {
            console.log(response.data.id);
            if (response.data.id == -1)
              $rootScope.addMessage = "No new plug found";
            else
              $rootScope.addMessage = "New plug added. Id - " + response.data.id;
          }, function errorCallback(response) {
            console.log( "failure message: " + response.data);
          });
      };

    });


angular.
  module('AlpGatewayApp').
    controller('ctrlXbeePlugHome', function($rootScope, $scope,  $http) {
      $rootScope.activeDev = {id : -1};

      $scope.delDev = function(devID, event){
        console.log("del xbee plug - " + devID);
        event.stopPropagation();
        var idJson = {id: devID};
        console.log(idJson);
        var request = $http.post("/plug/del", idJson).then(function successCallback(res) {
          console.log(res.data);
        }, function errorCallback(res) {
          console.log( "failure message: " + res.data);
        });
        $scope.refreshDevices();
      };

      $scope.showDev = function(devID){
        console.log("show xbee plug - " + devID);
        location.href="#/showXbeePlug";
        $rootScope.activeDev.id = devID;
        $rootScope.waitStatus = true;
        $rootScope.timeoutID = setTimeout($scope.getDevStatus,2000);
      };

      $scope.getDevStatus = function(){
        if($rootScope.activeDev.id != -1)
        {
          var idJson = {id: $rootScope.activeDev.id};
          var request = $http.post("/plug/status", idJson).then(function successCallback(res) {
            if ($rootScope.waitStatus){
              $rootScope.waitStatus = false;
              $rootScope.loading = false;
            }

            if (res.data.status == -1){
              $rootScope.activeDev.status = false;
              $rootScope.activeDev.noConnection = true;
            }
            else{
              $rootScope.activeDev.noConnection = false;
              $rootScope.activeDev.status = res.data.status;
            }

            console.log($rootScope.activeDev.status);
          }, function errorCallback(res) {
            console.log( "failure message: " + res.data);
          });
          $rootScope.timeoutID = setTimeout($scope.getDevStatus,2000);
        }
      };

    });


angular.
  module('AlpGatewayApp').
    controller('ctrlXbeePlugShow', function($rootScope, $scope,  $http) {

      $scope.plugOn= function(){
        //clearTimeout($rootScope.timeoutID);
        //$rootScope.timeoutID = setTimeout($scope.getDevStatus,3000);
        var idJson = {id: $rootScope.activeDev.id};
        console.log(idJson);
        var request = $http.post("/plug/turnOn", idJson).then(function successCallback(res) {
          console.log(res.data);
        }, function errorCallback(res) {
          console.log( "failure message: " + res.data);
        });
      };

      $scope.plugOff= function(){
        //clearTimeout($rootScope.timeoutID);
        //$rootScope.timeoutID = setTimeout($scope.getDevStatus,3000);
        var idJson = {id: $rootScope.activeDev.id};
        var request = $http.post("/plug/turnOff", idJson).then(function successCallback(res) {
          console.log(res.data);
        }, function errorCallback(res) {
          console.log( "failure message: " + res.data);
        });
      };

    });