'use strict';

angular.
	module('AlpGatewayApp').
		controller('BleController', function($rootScope, $scope,  $http) {

			$rootScope.addSwitch = function(){
				console.log("add switch");
		    $scope.addMessage = "Scanning...";
				$http({
				  method: 'GET',
				  url: '/add/switchBle'
				}).then(function successCallback(response) {
					console.log(response.data.id);
					if (response.data.id == -1)
						$rootScope.addMessage = "No new switch found";
					else
						$rootScope.addMessage = "New switch added. Id - " + response.data.id;
				}, function errorCallback(response){
					console.log("error message : " + response.data);
				});
			};

		});
