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