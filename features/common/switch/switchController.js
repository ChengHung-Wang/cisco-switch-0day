/**
 Description: Switch Controller. Can broadcast the event called as 'portSelected' on rootScope.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';

app.controller('switchCtrl', ['$scope', '$rootScope', '$filter', '$interval', 'switchDataService','dashletReloadTime','$timeout', 'requestRoutingService',
function($scope, $rootScope, $filter, $interval, switchDataService,dashletReloadTime,$timeout,requestRoutingService) {
	var translate = $filter("translate");
	$scope.showModeButtons = false;
	$scope.fetchDataUrl = ( runFromLocalhost ? "resources/data/switch.json" : "switch");
	$scope.fromWhere = "";
	var findPortConfigPage = (location.hash.indexOf("portsConf") != -1);
	//Function to fetch the data from the switch in the required JSON format
	var fetchData = function(){
		return switchDataService.getSwitchViewData();
	};
	//Fetch data to show the switch view
	$scope.switchData = fetchData();
	// Clear setInterval When URL location changes from one page to another
	var dereg = $scope.$on('$locationChangeSuccess', function() {
	    $interval.cancel($rootScope.switchViewFetchLoop);
	    dereg();
	});
	(function () {
		// Clear setInterval if already present
		if($rootScope.switchViewFetchLoop){
			$interval.cancel($rootScope.switchViewFetchLoop);
		}
		//Refresh the switch view every 60 seconds
		$rootScope.switchViewFetchLoop = $interval(function(){
			if(angular.element(".switchGraph").length > 0){
				$scope.switchData = fetchData();
			} else {
				$interval.cancel($rootScope.switchViewFetchLoop);
			}
	  	}, dashletReloadTime);
	}());
	//The following JSON is a sample for dashboard. In case of any doubt,
	// or debugging, this data can be used as test data instead of fetching it above
	/*{
		"hostname" : "switch123",
		"noOfSwitches" : 2,
		"masterSwitchId" : 1,
		"switches" : [{
			"id" : 1,
			"macAdd" : "aa:bb:cc:dd:ee:ef",
			"isPoECapable" : true,
			"isStackConfigurable" : false,
			"ports" : [[[{
				"portNo" : 1,
				"uniqueId" : "Gi1/0/1",
				"duplex" : true,
				"poe" : true,
				"power": 10,
				"status" : 1,
				"speed" : 10
			}, {
				"portNo" : 2,
				"uniqueId" : "Gi1/0/2",
				"duplex" : true,
				"poe" : true,
				"status" : 2,
				"speed" : 100
			}], [{
				"portNo" : 3,
				"uniqueId" : "Gi1/0/3",
				"duplex" : false,
				"poe" : true,
				"status" : 1,
				"speed" : 100
			}, {
				"portNo" : 4,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}], [{
				"portNo" : 5,
				"uniqueId" : "Gi1/0/3",
				"duplex" : false,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 6,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}], [{
				"portNo" : 7,
				"uniqueId" : "Gi1/0/3",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 8,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}]], [[{
				"portNo" : 9,
				"uniqueId" : "Gi1/0/5",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 10,
				"uniqueId" : "Gi1/0/6",
				"duplex" : true,
				"poe" : true,
				"status" : 0,
				"speed" : 1000
			}], [{
				"portNo" : 11,
				"uniqueId" : "Gi1/0/7",
				"duplex" : true,
				"poe" : false,
				"status" : 0,
				"speed" : 100
			}, {
				"portNo" : 12,
				"uniqueId" : "Gi1/0/1",
				"duplex" : true,
				"poe" : false,
				"status" : 0,
				"speed" : 100
			}], [{
				"portNo" : 13,
				"uniqueId" : "Gi1/0/3",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 14,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}], [{
				"portNo" : 15,
				"uniqueId" : "Gi1/0/3",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 16,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}]]],
			"uplinkports" : [{
				"portNo" : 15,
				"uniqueId" : "Gi1/0/15",
				"duplex" : true,
				"status" : 0,
				"speed" : 1000
			}, {
				"portNo" : 16,
				"uniqueId" : "Gi1/0/16",
				"duplex" : true,
				"status" : 0,
				"speed" : 1000
			}]
		},{
			"id" : 2,
			"macAdd" : "aa:bb:cc:dd:ee:ef",
			"isPoECapable" : true,
			"isStackConfigurable" : true,
			"ports" : [[[{
				"portNo" : 1,
				"uniqueId" : "Gi1/0/1",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 2,
				"uniqueId" : "Gi1/0/2",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}], [{
				"portNo" : 3,
				"uniqueId" : "Gi1/0/3",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 4,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}], [{
				"portNo" : 5,
				"uniqueId" : "Gi1/0/3",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 6,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}], [{
				"portNo" : 7,
				"uniqueId" : "Gi1/0/3",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 8,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}]], [[{
				"portNo" : 9,
				"uniqueId" : "Gi1/0/5",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 10,
				"uniqueId" : "Gi1/0/6",
				"duplex" : true,
				"poe" : true,
				"status" : 0,
				"speed" : 1000
			}], [{
				"portNo" : 11,
				"uniqueId" : "Gi1/0/7",
				"duplex" : false,
				"poe" : false,
				"status" : 0,
				"speed" : 100
			}, {
				"portNo" : 12,
				"uniqueId" : "Gi1/0/1",
				"duplex" : true,
				"poe" : false,
				"status" : 0,
				"speed" : 100
			}], [{
				"portNo" : 13,
				"uniqueId" : "Gi1/0/3",
				"duplex" : false,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 14,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}], [{
				"portNo" : 15,
				"uniqueId" : "Gi1/0/3",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}, {
				"portNo" : 16,
				"uniqueId" : "Gi1/0/4",
				"duplex" : true,
				"poe" : true,
				"status" : 1,
				"speed" : 1000
			}]]],
			"uplinkports" : [{
				"portNo" : 15,
				"uniqueId" : "Gi1/0/15",
				"duplex" : true,
				"status" : 0,
				"speed" : 1000
			}, {
				"portNo" : 16,
				"uniqueId" : "Gi1/0/16",
				"duplex" : true,
				"status" : 0,
				"speed" : 1000
			}]
		}]
	};*/
	$scope.showStatus = function(event, status){
		angular.element(".actionInput").removeClass("selected");
		angular.element(event.target).parents(".actionInput").addClass("selected");
		angular.element(event.target).parents(".switchContainer").removeClass("duplex stat stack poe speed").addClass(status)
	};
	$scope.setTitle = function(event, fromWhere){
		var elmt = angular.element(event.target),
		prnt = elmt.parents(".switchContainer"),
		prtData = elmt.parents(".portData"),
		allPortData = angular.fromJson(elmt.parents(".portData").attr("data-port"));
		fromWhere = fromWhere == undefined ? '' : fromWhere;
		$scope.fromWhere = fromWhere;
		var titleString="";
		if(fromWhere){
			var portData = angular.fromJson(elmt.attr("data-port"));
			allPortData = angular.fromJson(elmt.parents(".status").attr("data-port"));
			if(allPortData == undefined){
				allPortData = portData;
			}
			titleString = translate('tbl_column_portname') + ": " + allPortData.uniqueId + '\n' +
				   translate('switch_status_title').replace("{0}", $rootScope.portStatus[parseInt(allPortData.status)]) + '\n' +
                                   translate('switch_speed_title').replace("{0}", allPortData.speed) + '\n' +
                                   translate('switch_duplex_title').replace("{0}", allPortData.duplex) + '\n';
		}else{
			titleString = translate('tbl_column_portname') + ": " + allPortData.uniqueId + '\n' +
				   translate('switch_status_title').replace("{0}", $rootScope.portStatus[parseInt(prtData.attr("data-status"))]) + '\n' +
				   translate('switch_speed_title').replace("{0}", prtData.attr("data-speed")) + '\n' +
				   translate('switch_duplex_title').replace("{0}", prtData.attr("data-duplex")) + '\n' +
				   translate('switch_power_title').replace("{0}",(allPortData.power||0));
		}
		elmt.attr("title", titleString);
	};
       $scope.handleClickOnPort = function(event, portNum){
		/* Broadcast an event, 'portSelected'. This event can be captured in
		   any of the controllers, under root scope, and the corresponding row
    		   can be lighlighted or used in any other way.
                */
				if(angular.element(event.target).css("cursor") == "pointer"){
					$rootScope.portNumIdentity = portNum;
				}
                var args = {};
                args.event = event;
                args.fromWhere = $scope.fromWhere;
                args.object = this.portObj || this.uplinkObj; //Ethernet ports or Uplink ports, common event
				args.switch = this.switch;
				$rootScope.$broadcast('portSelected',args);
       };
    if(!findPortConfigPage){
       $rootScope.portNumIdentityMultiSelect = [];
    }
   	$scope.isMultiSelect = function($uniqueId){
   		if($rootScope.portNumIdentityMultiSelect){
   			var isMultiSelect = $rootScope.portNumIdentityMultiSelect.map(function(e) {
                return e.uniqueId;
            }).indexOf($uniqueId);
            if(isMultiSelect != -1){
	       		if($uniqueId === $rootScope.portNumIdentityMultiSelect[isMultiSelect].uniqueId){
	       			return true;
	       		}else{
	       			return false;
	       		}
       		}else{
       			return false;
       		}
   		}
   		return false;
   	};
}]);
