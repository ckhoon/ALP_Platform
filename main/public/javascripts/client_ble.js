'use strict';

angular.
	module('AlpGatewayApp').
		controller('BleController', function($rootScope, $scope) {
			$scope.addSwitch = function(){
				console.log("add switch");
		    $scope.addMessage = "Scanning...";
				$http({
				  method: 'GET',
				  url: '/add/switchBle'
				}).then(function successCallback(response) {
					console.log(response.data.id);
					if (response.data.id == -1)
						$scope.addMessage = "No new switch found";
					else
						$scope.addMessage = "New switch added. Id - " + response.data.id;
				}, function errorCallback(response){
					console.log("error message : " + response.data);
				}
			};
		});
