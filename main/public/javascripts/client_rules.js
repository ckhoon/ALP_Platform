'use strict';

angular.
  module('AlpGatewayApp').
    controller('ctrlRules', function($rootScope, $scope,  $http) {

			$scope.showRule = function(id) {
			  console.log("show rule - ",id);

				$http({
				  method: 'GET',
				  url: '/get/configuration'
				}).then(function successCallback(response) {
				    console.log(response.data);
				  }, function errorCallback(response) {
				    console.log( "failure message: " + response.data);
				  });

			  location.href="#/showRule"
			  
			};

    });
