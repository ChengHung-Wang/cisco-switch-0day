/**
 *Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 This controller is responsible for customizing the Polaris UI
 dashboard
 */
app.register.controller("DashletCtrl", ['$scope', 'DashletService',
function($scope, $dashletService) {

	$scope.dashletList = $dashletService.getDashletList();
	$scope.removedDashletList = $dashletService.getRemovedDashletList();
	/**
	 * This reads all the dashlets required to display
	 * The visible parameter of each dashlet determines if its default or not.
	 * Only 9 dashlets will be displayed at a time. The rest will be displayed at the top.
	 */
	$scope.init = function() {
		if ($dashletService.isPersistedDashboard()) {
			$dashletService.setDashletList().then(function() {
				$scope.dashletList = $dashletService.getDashletList();
			});
		}
	};
	$scope.placeholder = function(element) {
		return $dashletService.getPlaceHolder(element);
	};
	$scope.hint = function(element) {
		return $dashletService.getHint(element);
	};
	$scope.positionTooltip = function(e){
		var position=e.sender.options.position;
		if (position=="left"){
			e.sender.popup.element.css("margin-left", "-10px");
		}
	}
	$scope.onDropEnd=function(e){
		$scope.$broadcast('removeHint', e.item); //Added as a fix for dashboard sorting with kendo UI
		e.preventDefault();
		if (e.action === 'sort') {
			$scope.dashletList=$dashletService.updateDashboardPosition(e.oldIndex,e.newIndex);
		}
	}
	$scope.$on('draggable:start',function(){
		$scope.openSwipeMenu();
	});
	$scope.openSwipeMenu=function(dashletName){
			_.forEach($scope.customizeDashletList, function(n) {
				if (dashletName!=undefined && dashletName==n.dataTitle) {
					if (n.openSwipeMenu){
						n.openSwipeMenu=false;
					}
					else{
						n.openSwipeMenu=true;
					}
				}else{
					n.openSwipeMenu=false;
				}
			});
	}
	$scope.dropDashlet=function(movedDashlet,event,droppedOnDashlet){
		var movedDashletPos=movedDashlet.pos;
		var droppedOnDashletPos=droppedOnDashlet.pos
		_.forEach($scope.customizeDashletList, function(n) {
			if (n.dataTitle==movedDashlet.dataTitle){
				n.pos=droppedOnDashletPos;
			}
			if (n.dataTitle==droppedOnDashlet.dataTitle){
				n.pos=movedDashletPos;
			}
		});
		$scope.customizeDashletList=_.sortBy($scope.customizeDashletList,'pos');
		$scope.openSwipeMenu();
		$scope.checkChangesForDashboardOptions();
	}
	$scope.getSecs = function(miliSecs){
		if (miliSecs=="-1"){
			return -1;
		}
		else{
			return parseInt(miliSecs/1000);
		}
	}

	/**
	 * When a dashlet is removed, the dashlet directive removes the dashlet and
	 * notifies this controller. The controller removes the concerned dashlet from the
	 * list. The "Title" of the dashlet is used to do the identification
	 */
	$scope.$on('dashletRemoved', function(event, dashlet) {
		var dashletRemoved = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === dashlet.title));
		});
		var index = _.indexOf($scope.dashletList, dashletRemoved);
		$dashletService.addToRemovedDashlets(dashletRemoved);
		$dashletService.updateDashletList(index);
		$scope.dashletList = $dashletService.getDashletList();
	});

	// Dynamically resize the front panel dashlet when it is more than 24 ports
	$scope.$on('frontpanel:resize', function(event, data) {
		var frontPanelDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "Device Port Status"));
		});
		if (data != null || data != undefined) {
			if (data.switch != null || data.switch != undefined) {
				if (data.switch.nrOfPorts > 24) {
					frontPanelDashlet.dataSize = 2;
				}
			}
		}
	});

	$scope.restoreDashlet = function(title) {
		var dashletAdded = _.find($scope.removedDashletList, function(arg) {
			return ((arg.dataTitle === title));
		});
		var index = _.indexOf($scope.removedDashletList, dashletAdded);
		$scope.dashletList=$dashletService.addToDashletList(dashletAdded);
		$dashletService.updateRemovedDashletList(index);
		$scope.removedDashletList = $dashletService.getRemovedDashletList();
	};
	$scope.addToRemovedCustomList=function(dashlet){
		$scope.removedCustomDashletList.push(dashlet);
		var index = _.indexOf($scope.customizeDashletList, dashlet);
		$scope.customizeDashletList.splice(index, 1);
		$scope.customizeDashletList=$dashletService.setPositions($scope.customizeDashletList,true)
		$scope.checkChangesForDashboardOptions();
	};
	$scope.removeFromRemovedCustomList=function(dashlet){
		var pos=1;
		if ($scope.customizeDashletList.length>0){
			pos=parseInt($scope.customizeDashletList[$scope.customizeDashletList.length-1].pos)+1;
		}
		dashlet.pos=pos.toString();
		$scope.customizeDashletList.push(dashlet);
		var index = _.indexOf($scope.removedCustomDashletList, dashlet);
		$scope.removedCustomDashletList.splice(index, 1);
		$scope.checkChangesForDashboardOptions();
	};
	$scope.openCustomiseDialog=function(){
		$scope.removedCustomDashletList = angular.copy($scope.removedDashletList);
		$scope.customizeDashletList = angular.copy($scope.dashletList);
		$scope.customDashboard.center().open();
		$scope.checkChangesForDashboardOptions();
	};
	$scope.setDefaults=function(){
		$scope.customizeDashletList = angular.copy($scope.defaults);
		$scope.removedCustomDashletList=[];
		$scope.checkChangesForDashboardOptions();
	};
	$scope.setOptions = function(list){
		var options=[];
		_.forEach(list,function(entry){
			options.push({
				dataTitle:entry.dataTitle,
				pos:entry.pos,
				pollingInterval: entry.pollingInterval,
				disabled: false
			})
		});
		_.forEach($scope.removedCustomDashletList,function(entry){
			options.push({
				dataTitle:entry.dataTitle,
				pollingInterval: entry.pollingInterval,
				disabled: true
			})
		});
		return options
	}
	$scope.checkChangesForDashboardOptions=function(){
		$scope.customOptionsJson=[];
		$scope.customOptionsJson=$scope.setOptions($scope.customizeDashletList);
		$scope.changeOptions=$dashletService.checkChangedOptions($scope.customOptionsJson,$scope.customOptions);
	};
	$scope.changePoll = function(poll,dashlet){
		_.forEach($scope.customizeDashletList, function(arg) {
			if (arg.dataTitle === dashlet.dataTitle){
				if (poll=="" || poll==undefined) {
					arg.pollingInterval="0";
				}else if (arg.pollingInterval!="-1") {
					arg.pollingInterval=(parseInt(poll)*1000).toString();
				}
			}
		});
		$scope.checkChangesForDashboardOptions();
	};
	$scope.saveCustomSettings=function(){
		var postJson={};
		postJson.fileName="dashboardOptions.json";
		postJson.content=JSON.stringify($scope.customOptionsJson);
		if ($scope.changeOptions) {
			$dashletService.saveOptions(postJson).then(function(data){
				if (data.data=="SUCCESS") {
						var message={
							"isSuccessful" : true,
							"message" : {
								"title" : "<i class='fa fa-check toasterStatus'></i><h4>Settings saved</h4>",
								"message" : "Dashboard settings have been successfully saved"
							}
						};
						$scope.$emit("toaster:configurationSuccessErrorMessage",message);
						$dashletService.applyOptions($scope.customOptionsJson);
						$scope.dashletList=$dashletService.getDashletList();
						$scope.removedDashletList = $dashletService.getRemovedDashletList();
						$scope.customOptions=$scope.customOptionsJson;
						var changedPoll=$dashletService.getChangedPoll();
						_.forEach(changedPoll,function(entry){
							$scope.$broadcast(entry.dataTitle+":changedPoll",entry.pollingInterval);
						});
				}else{
						var message1={
							"isSuccessful" : false,
							"message" : {
								"title" : "<i class='fa fa-times toasterStatus'></i><h4>Settings not saved</h4>",
								"message" : "Dashboard settings have not been saved"
							}
						};
						$scope.$emit("toaster:configurationSuccessErrorMessage",message1);
				}
			});
			$scope.customDashboard.close();
		}
	};
	/**
	 * The below event shall update the UpTime of the device
	 */
	$scope.$on('dashlet:upTimeEmitted', function(event, data) {
		var targetDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "Device Port Status"));
		});
		if (targetDashlet != null) {
			targetDashlet.dataDescription = "System Uptime: " + data.upTime;
		}
	});

	/**
	 * The below event shall update the last updated time of the AP Dashlet
	 */
	$scope.$on('APDashlet::lastUpdatedTime', function(event, data) {
		var targetDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "Access Points"));
		});
		if (targetDashlet != null) {
			targetDashlet.dataDescription = data;
		}
	});
	/**
	 * The below event shall update the last updated time of the CPUMemory Utilization Dashlet
	 */
	$scope.$on('CPUMemoryUtilizationDashlet::lastUpdatedTime', function(event, data) {
		var targetDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "CPU & Memory Pressure Graph"));
		});
		if (targetDashlet != null) {
			targetDashlet.dataDescription = data;
		}
	});
	/**
	 * The below event shall update the last updated time of the CL Dashlet
	 */
	$scope.$on('CLDashlet::lastUpdatedTime', function(event, data) {
		var targetDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "System Messages - Critial Events Logs (Sev1 & Sev2 only)"));
		});
		if (targetDashlet != null) {
			targetDashlet.dataDescription = data;
		}
	});
	/**
	 * The below event shall update the last updated time of the Port Utilization Dashlet
	 */
	$scope.$on('PortUtilizationDashlet::lastUpdatedTime', function(event, data) {
		var targetDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "Port Utilization"));
		});
		if (targetDashlet != null) {
			targetDashlet.dataDescription = data;
		}
	});
	/**
	 * The below event shall update the last updated time of the Memory Utilization Dashlet
	 */
	$scope.$on('MemoryUtilizationDashlet::lastUpdatedTime', function(event, data) {
		var targetDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "Memory Utilization"));
		});
		if (targetDashlet != null) {
			targetDashlet.dataDescription = data;
		}
	});
	/**
	* The below event shall update the last updated time of the Flash Utilization Dashlet
	*/
	$scope.$on('FlashUtilizationDashlet::lastUpdatedTime',function(event,data){
		var targetDashlet = _.find($scope.dashletList,function(arg){
			return ((arg.dataTitle === "FlashMemory"));
	});
		if(targetDashlet != null){
			targetDashlet.dataDescription = data;
		}
	});
	/**
	* The below event shall update the last updated time of the System Information Dashlet
	*/
	$scope.$on('SystemInformation::lastUpdatedTime',function(event,data){
		var targetDashlet = _.find($scope.dashletList,function(arg){
			return ((arg.dataTitle === "System Information"));
	});
		if(targetDashlet != null){
			targetDashlet.dataDescription = data;
		}
	});
	/**
	* The below event shall update the last updated time of the Top Application Dashlet
	*/
	$scope.$on('TopApplcationDashlet::lastUpdatedTime',function(event,data){
		var targetDashlet = _.find($scope.dashletList,function(arg){
			return ((arg.dataTitle === "Top Applications"));
	});
		if(targetDashlet != null){
			targetDashlet.dataDescription = data;
		}
	});
	/**
	 * The below event shall update the last updated time of the Wireless Network Overview Dashlet
	 */
	$scope.$on('WirelessOverviewDashlet::lastUpdatedTime', function(event, data) {
		var targetDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "Wireless Networks Overview"));
		});
		if (targetDashlet != null) {
			targetDashlet.dataDescription = data;
		}
	});
	/**
	 * The below event shall update the last updated time of the Client Device Types Dashlet
	 */
	$scope.$on('clientDeviceTypesDashlet::lastUpdatedTime', function(event, data) {
		var targetDashlet = _.find($scope.dashletList, function(arg) {
			return ((arg.dataTitle === "Client Device Types"));
		});
		if (targetDashlet != null) {
			targetDashlet.dataDescription = data;
		}
	});
}]);
