/**
 Description: Switch Controller. Can broadcast the event called as 'portSelected' on rootScope.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
 
'use strict';

app.controller('switchCtrl4Stack', ['$scope', '$rootScope', 'executeCliCmdService', '$filter', '$interval', 'notificationService','requestRoutingService','dialogService','switchDataService4Stack','dashletReloadTime','$timeout','deviceInfoService','$q',
function($scope, $rootScope, executeCliCmdService, $filter, $interval, notificationService, requestRoutingService, dialogService, switchDataService4Stack,dashletReloadTime,$timeout,deviceInfoService,$q) {
	var translate = $filter("translate");
	$scope.showModeButtons = false;
	$scope.collapsableIcon = true;
	$scope.selfRestart = true;
	$scope.partialPoe = false;
	$scope.fetchDataUrl = ( runFromLocalhost ? "resources/data/switch.json" : "switch");
	$scope.memberToDel = "";
	$scope.memberToAdd = "";
	$scope.switchId = "";
	$scope.isDashboard = location.hash.indexOf("#/dashboard") == 0 ? true : false;
	$scope.isportsMonitor = location.hash.indexOf("#/portsMonitor") == 0 ? true : false;
	$timeout(function(){
		if($rootScope.deviceInfo.stackingInfo.type === "STACK"){
			angular.element(".stackSwitchBlock").show();
		}else{
			angular.element(".stackSwitchBlock").hide();
		}
	},100);
	$rootScope.switchfinder = false;
    if (location.hash.indexOf("#/switch") == 0) {
        $rootScope.showApplyBtn = true;
        $rootScope.showDeleteBtn = true;
    }    
    $scope.storeMembers = ["0"];
    $scope.$on('memberSelected', function(event, msData){
        var $index = $scope.storeMembers.indexOf(msData.object.id);
        if($index !== -1){
            $scope.storeMembers.splice($index,1);
        }else{
            $scope.storeMembers.push(msData.object.id);
        }   
        $scope.switchData=fetchData($scope.storeMembers);
    });    
    //Function to fetch the data from the switch in the required JSON format
	var fetchData = function(currentMembers){			
		if(currentMembers == undefined) currentMembers = ["0"];		
		return switchDataService4Stack.getSwitchViewData($scope,currentMembers);
	};
	//Fetch data to show the switch view
	$scope.switchData = fetchData($scope.storeMembers);	
	$scope.switchesLength = $scope.switchData.switches.length;
	var resetCandidateMemberBlocks = function(){
		$scope.storeMembers = ["0"];
		$scope.block = {};
		for(var s in $scope.switchData.switches){
			if(s > 0){
				var hostOrModel = $scope.switchData.switches[s].modelName == undefined ? $scope.switchData.switches[s].hostname : $scope.switchData.switches[s].modelName;
				$scope["block"][hostOrModel] = false;
			}
		}
	}
	var allowIn = false;
	$scope.$watch('switchData.switches', function(nData, oData){
		var len = $scope.switchesLength - 1;
		if( allowIn && (len === (nData.length - 1))){
			allowIn = false;
			$timeout(function(){
				angular.element("div[name]").next().hide();
			},100)
			resetCandidateMemberBlocks();			
		}
	});
	resetCandidateMemberBlocks();
	if(window.location.href.indexOf("#/portsConf")== -1){
		$timeout(function(){
			angular.element(".status.blink").removeClass("selectSwitch1");
			angular.element(".status.blink").removeClass("selectSwitch");
		})
	}
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
				$scope.switchData = fetchData($scope.storeMembers);
			} else {
				$interval.cancel($rootScope.switchViewFetchLoop);
			}
	  	}, dashletReloadTime);
	}());
	$scope.findProperty = function(obj, objProp){
		if(obj.hasOwnProperty(objProp)){
			return true;
		}
		return false;
	}
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

	$scope.$on("addMemberToCluster", function() {
                $scope.dlg.data("kendoWindow").close();
				var result ="";
                if(document.getElementById("password").value != ""){
		 	result = requestRoutingService.getConfigCmdOutput("cluster member mac-address " + $scope.memberToAdd
								+ " password " + document.getElementById("password").value);
                } else{
		 	result = requestRoutingService.getConfigCmdOutput("cluster member mac-address " + $scope.memberToAdd );
                }
		if(result == ""){
			notificationService.showNotification(translate('cluster_add_success'),translate('com_config_success_title'),'success');
			//Update the view data
			$timeout(function(){
                deviceInfoService.setDeviceInfo();
				$scope.switchData = fetchData();
				angular.element("div[name]").next().hide();
				resetCandidateMemberBlocks();
			},1000);
		} else {
			notificationService.showNotification(result.errorResponse,translate('com_config_fail_title'),'error');
			$scope.showPasswordDialog($scope.memberToAdd);
		}
        });
	$scope.$on("deleteMemberFromCluster", function() {
                $scope.dlg.data("kendoWindow").close();
                var result = requestRoutingService.getConfigCmdOutput("no cluster member " + $scope.memberToDel );
                if(result == ""){
                        notificationService.showNotification(translate('cluster_del_success'),translate('com_config_success_title'),'success');
                        //Update the view data
                        $timeout(function(){
                            deviceInfoService.setDeviceInfo();
              				$scope.switchData = fetchData();
							angular.element("div[name]").next().hide();
							resetCandidateMemberBlocks();
							allowIn = true;
            			},1000);
                } else {
                        notificationService.showNotification(result.errorResponse,translate('com_config_fail_title'),'error');
                }
        });
	$scope.showStatus = function(event, status){
		angular.element(".actionInput").removeClass("selected");
		angular.element(event.target).parents(".actionInput").addClass("selected");
		angular.element(event.target).parents(".switchContainer").removeClass("duplex stat stack poe speed").addClass(status)
	};

	//Function to RESTART a specific switch in the cluster
	$scope.showRestartConfirmDialog = function(switchId,macAdd){
		if(macAdd === $rootScope.deviceInfo.baseMacAdd){
			$scope.selfRestart = true;
		}else{
			$scope.selfRestart = false;
		}
		$scope.switchId = switchId;
                $scope.dlg = dialogService.dialog({
                        content : translate('restart_confirm') + "<br/>"+ "<div class=\"col-sm-9 col-sm-offset-1 webui-centerpanel-label\"><div class=\"col-sm-4 custom-checkbox\"><span class=\"label\">"+translate('save_configuration')+"</span></div><div class=\"col-sm-1 custom-checkbox\"><input type=\"checkbox\" name=\"saveconfig\" id=\"saveconfig\" class=\"k-checkbox form-control\" ng-model=\"saveconfig\"><label class=\"k-checkbox-label\" for=\"saveconfig\"></label></div></div>" + "<br/>",
                        title : translate('software_update_restart_title'),
                        messageType : "confirm",
                        actionButtons : [{
                                text : translate("com_ok"),
                                callback : "restartSwitch"
                        }, {
                                text : translate("com_cancel")
                        }]
                });
        };
	$scope.$on("restartSwitch", function() {
        $scope.dlg.data("kendoWindow").close();
		var cli = "";
		var clusterMember = false;
		var stackMemberDetails = "";
		var switchInRestart = $scope.switchData.switches.filter(function(member){
                   return member.id == $scope.switchId;});
		if($scope.switchId != "" || $scope.switchId == 0){
			if($scope.switchId == 0){
				$scope.switchId = $rootScope.deviceInfo.masterId;
			}
			if($rootScope.deviceInfo.stackingInfo.type == "CLUSTER" && !$scope.selfRestart){
				clusterMember = true;
			}else if($rootScope.deviceInfo.stackingInfo.type == "STACK"){
				stackMemberDetails = " slot " + $scope.switchId;
			}
		}
		if(angular.element("#saveconfig").is(":checked")){
			cli+="write memory\n reload" + stackMemberDetails + "\n";
		}else{
			cli+="reload"+ stackMemberDetails + "\n";
		}
		notificationService.showNotification(translate('restart_success'),translate('software_update_restart_title'),'success');
		switchInRestart[0].restartInProgress = true;
        switchInRestart[0].software_update_restart_title = translate("software_update_restarted_title");
		if(switchInRestart[0].type == "Master"){
			for(var s=0;s<$scope.switchData.switches.length;s++){
				if($scope.switchData.switches[s].hasOwnProperty("restartInProgress")){
					$scope.switchData.switches[s].restartInProgress = true;
				}
			}
		}
		$timeout(function () {
			var result = "";
			if(!clusterMember) {
				result = requestRoutingService.getShowCmdOutput(cli);
			}else{
				var saveConfig = angular.element("#saveconfig").is(":checked");
				result = switchDataService4Stack.doReloadCluster($scope.switchId,saveConfig);
			}
			if(result != ""){
				notificationService.showNotification(result.errorResponse,translate('restart_fail'),'error');
			}
		},100);
    });

	//Function to ADD a specific switch to the cluster
	$scope.showPasswordDialog = function(macAddress){
		$scope.memberToAdd = macAddress;
                $scope.dlg = dialogService.dialog({
content : translate('stack_virtual_member_confirm') + "<br/>"+"<div class=\"col-sm-4 \"><input type=\"password\" name=\"enablesecret\" id=\"password\" class=\"k-textbox form-control\" ng-model=\"enablesecret\"></div>" + "<br/>"+ "<div class=\" margin-top-20 \">" + "&#9432;&nbsp"+translate('switch_cluster_add_info')+"<ul class=\"cluster-info-content\">"+"<li>"+translate('switch_cluster_restriction1')+"</li>"+"<li>"+translate('switch_cluster_restriction2')+"</li></ul>"+"</div>",
                        title : translate('day0_wizard_basic_config_password'),
                        messageType : "confirm",
                        actionButtons : [{
                                text : translate("com_ok"),
                                callback : "addMemberToCluster"
                        }, {
                                text : translate("com_cancel")
                        }]
                });
	};

	//Function to DELETE a specific switch from the cluster
	$scope.deleteMemberConfirm = function(switchId){
		$scope.memberToDel = switchId;
		$scope.dlg = dialogService.dialog({
                        content : translate('help_stacking_delete_member'),
                        title : translate('com_delete'),
                        messageType : "confirm",
                        actionButtons : [{
                                text : translate("com_ok"),
                                callback : "deleteMemberFromCluster"
                        }, {
                                text : translate("com_cancel")
                        }]
                });
	};
	$scope.setTitle = function(event, fromWhere){
		var elmt = angular.element(event.target),
		prnt = elmt.parents(".switchContainer"),
		prtData = elmt.parents(".portData"),
		allPortData = angular.fromJson(elmt.parents(".portData").attr("data-port"));
		var titleString="";
		if(fromWhere){
			allPortData = angular.fromJson(elmt.attr("data-port"));
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
       $scope.handleClickOnPort = function(event, portObj){
		/* Broadcast an event, 'portSelected'. This event can be captured in
		   any of the controllers, under root scope, and the corresponding row
    		   can be lighlighted or used in any other way.
                */
				if(angular.element(event.target).css("cursor") == "pointer"){
					$rootScope.portNumIdentity = portObj.uniqueId;
					$rootScope.switchNumIdentity = portObj.switchId;
				}
                var args = {};
                args.event = event;
                args.object = this.portObj || this.uplinkObj; //Ethernet ports or Uplink ports, common event
				args.switch = this.switch;
				$rootScope.$broadcast('portSelected',args);
       };
       $scope.$on('portRowSelected', function(event, args) {
            var selectedPort = args;
			if(selectedPort!=null) {
				var switchPortArray = []
				for(var s=0;s<$scope.switchData.switches.length;s++){
					var sitchPortData = $scope.switchData.switches[s].ports;
					var sitchUplinkPortData = $scope.switchData.switches[s].uplinkports;
					for(var i=0;i<sitchPortData.length;i++){
						
						for(var j=0;j<sitchPortData[i].length;j++)
						{
							for (var k=0;k<sitchPortData[i][j].length;k++){
								
								switchPortArray.push(sitchPortData[i][j][k]);
							}
						}
					}
					for(var i=0;i<sitchUplinkPortData.length;i++){
						switchPortArray.push(sitchUplinkPortData[i]);
					}
					
				}
					
				var index_elem;
				switchPortArray.forEach(function(ports, index){
					
					if(ports.uniqueId === args.Port){
						
						index_elem=index;
					}	
					
				});
				var currentElemet = angular.element(".status");
				currentElemet[index_elem].click();
            }
        });
       $scope.isMultiSelect = function(portObj){
           if($rootScope.portNumIdentityMultiSelect){
               var isMultiSelect = $rootScope.portNumIdentityMultiSelect.map(function(e) {
                       return e.uniqueId;
                       }).indexOf(portObj.uniqueId);
               if(isMultiSelect != -1){
                   if(portObj.uniqueId === $rootScope.portNumIdentityMultiSelect[isMultiSelect].uniqueId && portObj.switchId == $rootScope.portSwitchIdentityMultiSelect){
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

       $scope.isPortSelect = function(portObj){
       	 if($rootScope.portNumIdentity == portObj.uniqueId && $rootScope.switchNumIdentity == portObj.switchId){
       	 	return true;
		 } else{
       	 	return false;
		 }
	   };
		$scope.addIcon = function(name){
			if($rootScope.deviceInfo.stackingInfo.type === "CLUSTER"){			
				if($scope["block"][name]){
					return 'fa fa-minus';
				}else{
					return 'fa fa-plus';
				}
			}else{
				if(angular.element(".cLegSpan ").hasClass("custCrs")){
					angular.element(".cLegSpan").removeClass('custCrs');
				}
			}
		}
	   	$scope.collapsableBlock = function(event, _name,type){
	   		if($rootScope.deviceInfo.stackingInfo.type === "CLUSTER"){			
				$scope["block"][_name] = !$scope["block"][_name];
				angular.element("[name='"+_name+"']").next().slideToggle();									
				if(type == translate("switch_cluster_candidate")){
					return;
				}
				angular.element(".subSwitch").hide();	
				angular.element("#SwitchLoad_"+_name).show();
				var msData = {
					event: event,
					object: this.switch,
					name:_name
				};						
				if($scope.isportsMonitor){
					$rootScope.$broadcast('memberSelected', msData);
				}else{
					$timeout(function(){
						$rootScope.$broadcast('memberSelected', msData);
						angular.element("#SwitchLoad_"+_name).hide();
					},500);
				}	
	   	   }	
	   }
	   var switchViewCLI="";
	   switchViewCLI="show power inline\n";
	   var switchViewCLIOP = deviceCommunicatorCLI.getExecCmdOutput(switchViewCLI);
	   var powerStatus = [];
	   if($rootScope.deviceInfo.isPoECapable){
			var portsMonPower =switchViewCLIOP[0];
			var arrPortsMonPower=portsMonPower.split("Interface")
			var arrPower=arrPortsMonPower[1].split("\n");
			for (var i=3; i < arrPower.length; i++) {
				var portsObj = {};
				var arrInnerWords = arrPower[i].split(" ");
				for (var k=0,j=1; k < arrInnerWords.length; k++) {
					if(arrInnerWords[k] == "") {
			 			continue;
					}
					if (j == 1) {
			 			portsObj["Interface"]=arrInnerWords[k].trim();
					}
					j++;
				}
				powerStatus.push(portsObj)
			}
	   }	   
	   if(powerStatus.length != 0 && (parseInt($rootScope.deviceInfo.numberOfPorts) == powerStatus.length)){
		   $scope.partialPoe = false;
	   }else if(powerStatus.length != 0){
		   $scope.partialPoe = true;   
	   }
	   
}]);
