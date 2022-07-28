/**
 Description: HTTP and SNMP Controller
 Copyright (c) 2016-2019 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller('ManagementCtrl', ['$scope','$timeout', '$filter', 'gridCrudService','dialogService','requestRoutingService','notificationService','validationService','getStringLineService','executeCliCmdService','$rootScope',
function($scope,$timeout, $filter, gridCrudService,dialogService, requestRoutingService,notificationService,validationService,getStringLineService,executeCliCmdService,$rootScope) {
		var translate = $filter("translate");
		//Hide HTTP option only show HTTPS for SM devices
		$scope.smDeviceStatus=false;
		if($rootScope.deviceInfo.type.indexOf("C2960L-SM") !=-1 || $rootScope.deviceInfo.type.indexOf("C1000SM") !=-1){
			$scope.smDeviceStatus=true;
			$scope.smDeviceStatus1=false;
		}else{
			$scope.smDeviceStatus=false;
			$scope.smDeviceStatus1=true;
		}
		$scope.snmpCommunity = {
			"Name":"",
			"AccessMode":null
		};
		$scope.snmpUser = {
			"userName":"",
			"groupName":"",
			"authProtocol":null,
			"authPassword":"",
			"privProtocol":null,
			"Version":null,
			"privPassword":""
		};
		$scope.snmpHost = {
			"ipAddress":"",
			"udpPort":"",
			"version":null,
			"type":null,
			"communityName":"",
			"securityLevel":null
		};
		$scope.snmpV3GroupUser = {
			"groupName":"",
			"securityLevel":null
		};
		 $scope.communityAccessModeOptions = [{
					modeValue : 'Read Only',
					modeName : translate('management_snmp_readonly')
				}, {
					modeValue : 'Read/Write',
					modeName : translate('management_snmp_readwrite')
				}];
		//HTTP CODE
		var http = {};
		loadHttp();
		function loadHttp(){
			$scope.disableApplyhttpBtn = true;
			$scope.disableCancelhttpBtn = true;
			$scope.trustPoints = new kendo.data.ObservableArray([]);
			var httpCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show crypto pki trustpoints status\n show ip http server status\n ");
			var trustpointsList =[];
			var strLinesTrustPoint = getStringLineService.getLines(httpCLIOP[0],["Trustpoint"]);
			for(var i = 0; i < strLinesTrustPoint.length; i++){
				var portsObj = {};
				portsObj["TrustPoint"] = executeCliCmdService.getNextString(strLinesTrustPoint[i],["Trustpoint"],[":"]).trim();
				trustpointsList.push(portsObj);
			}
			for (var trustpoint in trustpointsList) {
				 if (trustpointsList.hasOwnProperty(trustpoint)) {
					var trustPoint = trustpointsList[trustpoint];
					$scope.trustPoints.push(trustPoint.TrustPoint);
				 }
			}
			$scope.http = {};
			$scope.https = {};
			$scope.timeoutPolicy = {};
			$scope.trustpoint = {};
			$scope.trustpoint.trustPoint = null;
			http["httpaccess"]=executeCliCmdService.getNextString(httpCLIOP[1],["HTTP server status:"],["\n"]).trim();
			http["httpport"]=executeCliCmdService.getNextString(httpCLIOP[1],["HTTP server port:"],["\n"]).trim();
			http["httpsaccess"]=executeCliCmdService.getNextString(httpCLIOP[1],["HTTP secure server status:"],["\n"]).trim();
			http["httpsport"]=executeCliCmdService.getNextString(httpCLIOP[1],["HTTP secure server port:"],["\n"]).trim();
			http["httpTimeout"]=executeCliCmdService.getNextString(httpCLIOP[1],["Server idle time-out:"],["seconds"]).trim();
			http["serverLifeTime"]=executeCliCmdService.getNextString(httpCLIOP[1],["Server life time-out:"],["seconds"]).trim();
			http["maxRequest"]=executeCliCmdService.getNextString(httpCLIOP[1],["Maximum number of requests allowed on a connection:"],["\n"]).trim();
			http["trustpoint"]=executeCliCmdService.getNextString(httpCLIOP[1],["HTTP secure server trustpoint:"],["\n"]).trim();
			if(http){
				$scope.http.access = (http.httpaccess == 'Enabled') ? translate('com_enable'):translate('com_disable');
				$scope.http.port = http.httpport;
				$scope.http.existingport = $scope.http.port;
				$scope.https.access = (http.httpsaccess == 'Enabled') ? translate('com_enable'):translate('com_disable');
				$scope.https.port = http.httpsport;
				$scope.https.existingport = $scope.https.port;
				$scope.timeoutPolicy.httpTimeout = http.httpTimeout;
				$scope.timeoutPolicy.serverLifeTime = http.serverLifeTime;
				$scope.timeoutPolicy.maxRequest = http.maxRequest;
				$scope.trustpoint.status = translate('com_enable');
				if (http.trustpoint != "") {
					$scope.trustpoint.status = translate('com_enable');
					$scope.trustpoint.trustPoint = http.trustpoint;
					$scope.trustpoint.existingtrustPoint = $scope.trustpoint.trustPoint;
				}else{
					$scope.trustpoint.status = translate('com_disable');
					$scope.trustpoint.trustPoint = "";
					$scope.trustpoint.existingtrustPoint ="";
				}
			}
		}
		$scope.resethttpFunction = function(){
			angular.element("#httpConfig  span.k-tooltip-validation").hide();
			loadHttp();
		}
		$scope.enableApplyhttpBtn = function(){
			$scope.disableApplyhttpBtn = false;
			$scope.disableCancelhttpBtn = false;
		}
		var httpValidations = $("#httpConfig").kendoValidator({
				rules : {
					maximum : function(input) {
						var minValue = input.data('maximum');
						if (minValue){
							return input.val() <= Number(minValue);
						}
						return true;
					},
					minimum : function(input) {
						var maxValue = input.data('minimum');
						if (maxValue){
							return input.val() >= Number(maxValue);
						}
						return true;
					},
					httpvalidports : function(input) {
						var minValue = input.data('httpvalidports');
						if (!minValue){
							return true;
						}
						if (input.val() == 80) {
							return true;
						} else {
							if (minValue) {
								return input.val() <= Number(minValue) && input.val() >= 1024;
							}
							return true;
						}
					},
					httpsvalidports : function(input) {
						var minValue = input.data('httpsvalidports');
						if (!minValue){
							return true;
						}
						if (input.val() == 443) {
							return true;
						} else {
							if (minValue) {
								return input.val() <= Number(minValue) && input.val() >= 1025;
							}
							return true;
						}
					}
				}
		}).data("kendoValidator");
		$scope.tabTog = function(){
			$('#myTabStrip').find('li').removeClass('k-state-default');
		}
		$scope.oneTimeSnmp = true;
		$scope.loadSnmp = function(){
			if($scope.oneTimeSnmp == true){
				$scope.loadGridData();
				$scope.oneTimeSnmp = false;
			}
		}
		$scope.httpApply = function(){
			if (httpValidations.validate()) {
			var httpCli = "";
			if ($scope.http.access == translate('com_enable')){
				httpCli = httpCli + "ip http server \n ip http port " + $scope.http.port + "\n";
			} else{
				httpCli = httpCli + "no ip http server \n";
			}
			if ($scope.timeoutPolicy.httpTimeout != ""){
				httpCli = httpCli + "ip http timeout-policy idle " + $scope.timeoutPolicy.httpTimeout + " life " + $scope.timeoutPolicy.serverLifeTime + " requests " + $scope.timeoutPolicy.maxRequest + "\n";
			}
			if ($scope.https.access == translate('com_enable')){
				httpCli = httpCli + "ip http secure-server \n ip http secure-port " + $scope.https.port + "\n"
			} else {
				httpCli = httpCli + "no ip http secure-server \n"
			}
			if ($scope.trustpoint.status == translate('com_enable') && $scope.trustpoint.trustPoint != "" && $scope.trustpoint.trustPoint !=undefined){
				httpCli = httpCli + "ip http secure-trustpoint " + $scope.trustpoint.trustPoint + "\n"
			}
			if ($scope.trustpoint.status == translate('com_disable') && $scope.trustpoint.existingtrustPoint != "" && $scope.trustpoint.existingtrustPoint !=undefined){
				httpCli = httpCli + "no ip http secure-trustpoint " + $scope.trustpoint.existingtrustPoint + "\n";
			}
			var result = requestRoutingService.getConfigCmdOutput(httpCli);
			if(result==""){
				notificationService.showNotification(translate('http_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
		  }
		  loadHttp();
		}
//SNMP CODE
		$scope.countCommunity = 0;
        $scope.selectedCommunityArray = [];
        $scope.countUser = 0;
        $scope.selectedUserArray = [];
        $scope.countHost = 0;
        $scope.countV3GroupUser = 0;
        $scope.selectedHostArray = [];
        $scope.selectedV3GroupUserArray = [];
        $scope.snmpHostPristineData = {};
        $scope.snmpCommunityPristineData = {};
        $scope.snmpUserPristineData = {};
    	$scope.snmpV3GroupUserPristineData = {};
        $scope.disableApplyButton = false;
        $scope.communityChanges = false;
        $scope.snmpUserChanges = false;
        $scope.snmpHostChanges = false;
    	$scope.snmpV3GroupUserChanges = false;
        $scope.cancelOtherTabs = false;
        $scope.version = 'V1';
        $scope.communityGridData = new kendo.data.ObservableArray([]);
        $scope.hostGridData = new kendo.data.ObservableArray([]);
        $scope.userGridData = new kendo.data.ObservableArray([]);
    	$scope.v3UserGroupGridData = new kendo.data.ObservableArray([]);
        $scope.snmpHostValidaiton = {
			rules: {
				duplicate: function (input) {
					if (input.filter("[data-duplicate]")) {
						for(var i=0;i<$scope.hostGridData.length;i++){
								if(input.val()== $scope.hostGridData[i].ipAddress){
									if($scope.EditHostChanges == false){
									 return false;
									} 
								}
						}
					}
					return true;
				},
				ip : function(input) {
					if (input.filter("[data-ipvalidation]" ) && input.attr("name") == 'ipAddress') {
						var value = input.val();
						if (validationService.validateIpAddress(value) == false && validationService.validateIpv6Address(value) == false) {
							return false;
						} 
					}
					return true;
                },
				reservedIp : function(input) {
                    return input.data('reservedipMsg') ? validationService.validateReservedIpAddress(input.val()) : true;
                },
				udpportvalidation: function (input) {
                    if (input.is("[name='udpPort']")) {
                        if (input.val() != "") {
                            var val = input.val().trim().toLowerCase();
                            if (input.val().match(/^[0-9]+$/)) {
                                var range = "0-65535";
                                return validationService.validateNumericRange(input.val(), range);
                            }
                            return true;
                        }
                    }
                    else  {
                        return true;
                    }
                },
				namevalidation: function (input) {
					if (input.filter("[data-namevalidation]")) {
						return true;
					}
					return true;
				}
            }
        };
    	$scope.snmpV3UserGroupValidation = {
            rules: {
                groupnamevalidation: function (input) {
                    if (input.filter("[data-groupnamevalidation]")) {
                        return true;
                    }
                    return true;
                },
                duplicate: function (input) {
                    if (input.filter("[data-duplicate]")) {
                        for(var i=0;i<$scope.v3UserGroupGridData.length;i++){
                            if(input.val()== $scope.v3UserGroupGridData[i].groupName){
                                if($scope.EditV3GroupUserChanges == false){
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                }
            }
        };
        $scope.snmpV3UsersValidations = {
			rules: {
				duplicate: function (input) {
					if (input.filter("[data-duplicate]")) {
						for(var i=0;i<$scope.userGridData.length;i++){
								if(input.val()== $scope.userGridData[i].userName){
									if($scope.EditUserChanges == false){
									 return false;
									} 
								}
						}
					}
					return true;
				},
				namevalidation: function (input) {
					if (input.filter("[data-namevalidation]")) {
						return true;
					}
					return true;
				},
				maximum : function(input) {
						var minValue = input.data('maximum');
						if(!isNaN(input.val())){
							if($scope.snmpUser.acessNumber){
								if (minValue){
									return input.val() <= Number(minValue);
								}
							}
						}
						return true;
					},
				minimum : function(input) {
					var maxValue = input.data('minimum');
					if($scope.snmpUser.acessNumber){
						if(!isNaN(input.val())){	
							if (maxValue){
								return input.val() >= Number(maxValue);
							}
						}
					}
					return true;
				},
				groupnamevalidation: function (input) {
					if (input.filter("[data-groupnamevalidation]")) {
						return true;
					}
					return true;
				},
				privprotocolpasswordvalidation: function (input) {
					if (input.is("[name=privPassword]") && input.filter("[data-privprotocolpasswordvalidation]")) {
						return true;
					}
					return true;
				},
				authprotocolpasswordvalidation: function (input) {
					if (input.is("[name=authPassword]") && input.filter("[data-authprotocolpasswordvalidation]")) {
						return true;
					}
					return true;
				}
            }
        };
        $scope.snmpCommunityValidation = {
			rules: {
				namevalidation: function (input) {
					if (input.filter("[data-namevalidation]")) {
						for(var i=0;i<$scope.communityGridData.length;i++){
								if(input.val()== $scope.communityGridData[i].Name){
									if($scope.EditcommunityChanges == false){
									 return false;
									} 
								}
						}
					}
					return true;
				},maximum : function(input) {
						var minValue = input.data('maximum');
						if(!isNaN(input.val())){
							if($scope.snmpCommunity.accessValue){
								if (minValue){
									return input.val() <= Number(minValue);
								}
							}
						}
						return true;
					},
					minimum : function(input) {
						var maxValue = input.data('minimum');
						if(!isNaN(input.val())){
						if($scope.snmpCommunity.accessValue){
							if (maxValue){
								return input.val() >= Number(maxValue);
							}
						}
						}
						return true;
					},
                range: function (input) {
                    if(input.val()){
                        if(input.val() != ""){
                            var valMsg = input.data('rangeMsg');
                            if ((valMsg==undefined)) {
                                return true;
                            }
                            if((input.val()>=1 && input.val()<=99)||(input.val()>=1300 && input.val()<=1999)) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                        else {return true;}
                    }else{
                        return true;
                    }
                }
            }
        };
        $scope.isChecked = function (checked, dataItem, grid) {
            if (!grid || grid == ''){
                grid = 'Community';
			}
            switch (grid) {
                case 'Community' :
                    if (checked == false) {
                        $scope.countCommunity = $scope.countCommunity - 1;
                        var index = $scope.selectedCommunityArray.indexOf(dataItem);
                        if (index > -1) {
                            $scope.selectedCommunityArray.splice(index, 1);
                        }
                    } else {
                        $scope.countCommunity = $scope.countCommunity + 1;
                        $scope.selectedCommunityArray.push(dataItem);
                    }
                    break;
                case 'User':
                    if (checked == false) {
                        $scope.countUser = $scope.countUser - 1;
                        index = $scope.selectedUserArray.indexOf(dataItem);
                        if (index > -1) {
                            $scope.selectedUserArray.splice(index, 1);
                        }
                    } else {
                        $scope.countUser = $scope.countUser + 1;
                        $scope.selectedUserArray.push(dataItem);
                    }
                    break;
                case 'Host':
                    if (checked == false) {
                        $scope.countHost = $scope.countHost - 1;
                        index = $scope.selectedHostArray.indexOf(dataItem);
                        if (index > -1) {
                            $scope.selectedHostArray.splice(index, 1);
                        }
                    } else {
                        $scope.countHost = $scope.countHost + 1;
                        $scope.selectedHostArray.push(dataItem);
                    }
                    break;
                case 'V3GroupUser':
                    if (checked == false) {
                        $scope.countV3GroupUser = $scope.countV3GroupUser - 1;
                        index = $scope.selectedV3GroupUserArray.indexOf(dataItem);
                        if (index > -1) {
                            $scope.selectedV3GroupUserArray.splice(index, 1);
                        }
                    } else {
                        $scope.countV3GroupUser = $scope.countV3GroupUser + 1;
                        $scope.selectedV3GroupUserArray.push(dataItem);
                    }
                    break;
				default:
					break;
            }
            if ($scope.selectedCommunityArray.length > 0 || $scope.selectedUserArray.length > 0 || $scope.selectedHostArray.length > 0 || $scope.selectedV3GroupUserArray.length >0) {
                $scope.enableDeleteBtn = false;
            } else {
                $scope.enableDeleteBtn = true;
            }
        };
        $scope.snmpModel = {
            status: translate('com_enable'),
            systemLocation: '',
            systemContact: '',
            globalTrap: '',
            logging: ''
        };
		var snmpValidations = $("#snmpForm").kendoValidator({
			rules: {
				maximum : function(input) {
						var minValue = input.data('maximum');
						if(!isNaN(input.val())){
							if($scope.snmpModel.snmpTftp){
								if (minValue){
									return input.val() <= Number(minValue);
								}
							}
						}
						return true;
					},
					minimum : function(input) {
						var maxValue = input.data('minimum');
						if(!isNaN(input.val())){
							if($scope.snmpModel.snmpTftp){
								if (maxValue){
									return input.val() >= Number(maxValue);
								}
							}
						}
						return true;
					}
			}
		}).data("kendoValidator");
		var portNone = translate('portconfig_options_none');
        $scope.versionChange = function () {
			if($scope.snmpHost.version.toUpperCase() == "V3"){
				$timeout(function() {
					$scope.snmpHost.securityLevel = $scope.securityLevelOptions.options.data[0].value;
				},10);
			}
        };
		var preventCommunityGridPaginationAction = false;
		var preventUsersGridPaginationAction = false;
		var preventHostsGridPaginationAction = false;
        $scope.rowSelected = function (data) {
			$scope.disableApplyButton = true;
            if ($scope.snmpTabStrip.select().index() == 1) {
				$scope.snmpCommunityValidator.hideMessages();
				$scope.communityChanges = false;
				$scope.EditcommunityChanges = true;
				$scope.vlanGridWindow.open().center();
			    $scope.snmpCommunity = angular.copy(data)
				$scope.snmpCommunity.AccessMode = data.AccessMode;
				if(data.accessValue == "NA"){
					$scope.snmpCommunity.accessValue = "";
				}
				angular.element("#AccessMode").data('kendoDropDownList').value($scope.snmpCommunity.AccessMode);
            } else if ($scope.snmpTabStrip.select().index() == 2) {
				$scope.EditUserChanges = true;
				$scope.deleteUser = [];
				$scope.snmpV3UserValidator.hideMessages();
				$scope.v3UsersWindow.open().center();
				$scope.snmpUser = angular.copy(data)
				$scope.snmpUser.authProtocol = data.authProtocol;
				$scope.snmpUser.privProtocol = data.privProtocol;
				if($scope.snmpUser.authProtocol !="None"){
					$scope.snmpUser.authPassword = "*****";
				}
				if($scope.snmpUser.privProtocol !="None"){
					$scope.snmpUser.privPassword = "*****";
				}
				$scope.deleteUser.push(angular.copy(data));
				$scope.snmpUser.Version = data.Version;
				angular.element("#version").data('kendoDropDownList').value($scope.snmpUser.Version);
				angular.element("#authProtocol").data('kendoDropDownList').value($scope.snmpUser.authProtocol);
				angular.element("#privProtocol").data('kendoDropDownList').value($scope.snmpUser.privProtocol);
				$scope.snmpUserChanges = false;
            } else if ($scope.snmpTabStrip.select().index() == 3) {
				$scope.EditHostChanges = true;
				$scope.deleteHost = [];
				$scope.snmpHostValidator.hideMessages();
				$scope.hostWindow.open().center();
				$scope.snmpHost = angular.copy(data)
				$scope.snmpHost.version = data.version;
				$scope.snmpHost.type = data.type;
				$scope.deleteHost.push(angular.copy(data));
				angular.element("#version").data('kendoDropDownList').value($scope.snmpHost.version);
				angular.element("#type").data('kendoDropDownList').value($scope.snmpHost.type);
				$scope.snmpHostChanges = false;
            } else if ($scope.snmpTabStrip.select().index() == 4) {
                $scope.EditV3GroupUserChanges = true;
                $scope.deleteV3GroupUser = [];
                $scope.snmpV3UserGroupValidator.hideMessages();
                $scope.v3GroupUserWindow.open().center();
                $scope.snmpV3GroupUser = angular.copy(data);
                $scope.snmpV3GroupUser.groupName = data.groupName;
                $scope.snmpV3GroupUser.securityLevel = data.securityLevel;
                $scope.deleteV3GroupUser.push(angular.copy(data));
                $scope.snmpV3GroupUserChanges = false;
            }
        };
		$scope.enableApplybtn = function(){
			if($scope.snmpModel.status == "Disable") {
				$scope.disableApplyButton = true;
			}
			else {
				$scope.disableApplyButton = false;
			}
            $scope.snmpModel.displayAllGrid = ($scope.snmpModel.status == 'not enabled') ? translate('com_disable') : translate('com_enable');
		}
		$scope.IsShow = false;
		$scope.disableApply = function(){
			if($scope.communityGridData.length == 0 && $scope.userGridData.length == 0 && $scope.hostGridData.length == 0 && $scope.v3UserGroupGridData.length == 0) {
				$scope.disableApplyButton = true;
			}
			else {
				$scope.disableApplyButton = false;
			}
			$scope.IsShow = false;
		}
        $scope.disableApplyCommunity = function () {
            $scope.disableApplyButton = true;
            var communityIndex = 0;
            if ($scope.communityGridData.length > 0 && $scope.communityGrid._data[communityIndex].Name === "") {
                return $scope.communityGrid.dataSource.remove($scope.communityGrid._data[communityIndex]);
            }
            if ($scope.communityChanges === true) {
                $scope.disableApplyButton = false;
            } else if ($scope.communityChanges === false) {
                $scope.disableApplyButton = true;
            }
			$scope.IsShow = true;
        };
        $scope.disableApplyUser = function () {
            $scope.disableApplyButton = true;
            var communityIndex = 0;
            if ($scope.snmpUserGrid.length > 0 && $scope.snmpUserGrid._data[communityIndex].userName === "") {
                return $scope.snmpUserGrid.dataSource.remove($scope.snmpUserGrid._data[communityIndex]);
            }
            if ($scope.snmpUserChanges === true) {
                $scope.disableApplyButton = false;
            } else if ($scope.snmpUserChanges === false) {
                $scope.disableApplyButton = true;
            }
			$scope.IsShow = true;
        };
        $scope.disableApplyHost = function () {
            $scope.disableApplyButton = true;
            var communityIndex = 0;
            if ($scope.snmpHostGrid.length > 0 && $scope.snmpHostGrid._data[communityIndex].ipAddress === "") {
                return $scope.snmpHostGrid.dataSource.remove($scope.snmpHostGrid._data[communityIndex]);
            }
            if ($scope.snmpHostChanges === true) {
                $scope.disableApplyButton = false;
            } else if ($scope.snmpHostChanges === false) {
                $scope.disableApplyButton = true;
            }
			$scope.IsShow = true;
        };
		$scope.disableApplyV3GroupUser = function () {
			$scope.disableApplyButton = true;
			var communityIndex = 0;
			if ($scope.v3UserGroupGrid.length > 0 && $scope.v3UserGroupGrid._data[communityIndex].groupName === "") {
				return $scope.v3UserGroupGrid.dataSource.remove($scope.v3UserGroupGrid._data[communityIndex]);
			}
			if ($scope.snmpV3GroupUserChanges === true) {
				$scope.disableApplyButton = false;
			} else if ($scope.snmpV3GroupUserChanges === false) {
				$scope.disableApplyButton = true;
			}
			$scope.IsShow = true;
		};
        function filterSnmpCommunity(data1, data2) {
            var a = angular.copy(data1);
            var b = angular.copy(data2);
            for (var i = 0, len = a.length; i < len; i++) {
                for (var j = 0, len2 = b.length; j < len2; j++) {
                    if (a[i].Name === b[j].Name && a[i].AccessMode === b[j].AccessMode && a[i].accessValue === b[j].accessValue) {
                        b.splice(j, 1);
                        len2 = b.length;
                    }
                }
            }
            return b;
        }
        function filterSnmpUser(data1, data2) {
            var a = angular.copy(data1);
            var b = angular.copy(data2);
            var c = [];
            for (var i = 0, len = a.length; i < len; i++) {
                for (var j = 0, len2 = b.length; j < len2; j++) {
                    if (a[i].userName === b[j].userName && a[i].Version === b[j].Version && a[i].groupName === b[j].groupName && a[i].privProtocol === b[j].privProtocol && a[i].authProtocol === b[j].authProtocol && a[i].authPassword === b[j].authPassword && a[i].privPassword === b[j].privPassword&& a[i].acessNumber === b[j].acessNumber) {
                        b.splice(j, 1);
                        len2 = b.length;
                    }
                }
            }
            return b;
        }
        function filterSnmpHost(data1, data2) {
            var a = angular.copy(data1);
            var b = angular.copy(data2);
            for (var i = 0, len = a.length; i < len; i++) {
                for (var j = 0, len2 = b.length; j < len2; j++) {
                    if (a[i].ipAddress === b[j].ipAddress && a[i].udpPort === b[j].udpPort && a[i].version === b[j].version && a[i].type === b[j].type && a[i].communityName === b[j].communityName && a[i].securityLevel === b[j].securityLevel) {
                        b.splice(j, 1);
                        len2 = b.length;
                    }
                }
            }
            return b;
        }
		function filterSnmpV3UserGroup(data1, data2) {
			var a = angular.copy(data1);
			var b = angular.copy(data2);
			for (var i = 0, len = a.length; i < len; i++) {
				for (var j = 0, len2 = b.length; j < len2; j++) {
					if (a[i].groupName === b[j].groupName && a[i].securityLevel === b[j].securityLevel ) {
						b.splice(j, 1);
						len2 = b.length;
					}
				}
			}
			return b;
		}
        $scope.generalApply = function () {
			var generalCLI = "";
			    if ($scope.snmpModel["status"] == translate('com_disable')){
                    generalCLI = generalCLI + " no snmp-server \n";
				}
                else {
					    generalCLI = generalCLI + "snmp-server cache\n";
                    if ($scope.snmpModel["systemLocation"]) {
                        generalCLI = generalCLI + "snmp-server location " + $scope.snmpModel["systemLocation"] + " \n";
                    }
                    else {
                        generalCLI = generalCLI + "no snmp-server location \n"
                    }
                    if ($scope.snmpModel["systemContact"]) {
                        generalCLI = generalCLI + "snmp-server contact " + $scope.snmpModel["systemContact"] + " \n";
                    }
                    else {
                        generalCLI = generalCLI + "no snmp-server contact \n";
                    }
					if ($scope.oldtftpvalue) {
                        generalCLI = generalCLI + "no snmp-server tftp-server-list " + $scope.oldtftpvalue + " \n";
                    }
					if ($scope.snmpModel["snmpTftp"]) {
                        generalCLI = generalCLI + "snmp-server tftp-server-list " + $scope.snmpModel["snmpTftp"] + " \n";
                    }
                    if ($scope.snmpModel["globalTrap"] == translate('com_enable')) {
                        generalCLI = generalCLI + "snmp-server enable traps \n";
                    }
                    else {
                        generalCLI = generalCLI + "no snmp-server enable traps \n";
                    }
                }
					$scope.disableApplyButton = true;
				var result3 = requestRoutingService.getConfigCmdOutput(generalCLI);
					if(result3==""){
						notificationService.showNotification(translate('snmp_success_msg'),translate('com_config_success_title'),'success');
					}else{
						notificationService.showNotification(result3,translate('com_config_fail_title'),'error');
					}
					$scope.enableDeleteButton = true;
					if(snmpValidations.validate()) {
						$scope.disableApplyButton = true;
					}
					if ($scope.snmpTabStrip.select().index() == 0 || $scope.snmpTabStrip.select().index() == 3){
						$scope.loadGridData();
					}
		}
		$scope.apply = function () {
            $scope.returnJson = {
                createSnmp: [],
                deleteSnmp: [],
                snmpTab: ""
            };	
            if ($scope.snmpTabStrip.select().index() == 1) {
				if ($scope.snmpCommunityValidator.validate()) {
					$scope.communityGridData.push($scope.snmpCommunity)
					$scope.snmpCommunity = {};
					$scope.vlanGridWindow.close().center();
				}
				var pristineDataCommunity = angular.copy($scope.snmpCommunityPristineData);
				var currentDataTemp = angular.copy($scope.communityGrid.dataSource._data);
				var createdSnmp_community = filterSnmpCommunity(pristineDataCommunity, currentDataTemp);
				var deletedSnmp_community = filterSnmpCommunity(currentDataTemp, pristineDataCommunity);
				var communityCLI = "";
				if(deletedSnmp_community.length > 0){
					createdSnmp_community = [];
				}
				if(deletedSnmp_community){
				 for (var j = 0; j < deletedSnmp_community.length; j++) {
						communityCLI += "no snmp-server community " + deletedSnmp_community[j].Name + " \n";
					}
				 }
				if (createdSnmp_community) {
					
					for (var i = 0; i < createdSnmp_community.length; i++) {
						if (createdSnmp_community[i].AccessMode == translate("management_snmp_readonly")){
							communityCLI += "snmp-server community " + createdSnmp_community[i].Name + " ro " + createdSnmp_community[i].accessValue +" \n";
						}
						if (createdSnmp_community[i].AccessMode == translate("management_snmp_readwrite")){
							communityCLI += "snmp-server community " + createdSnmp_community[i].Name + " rw "+ createdSnmp_community[i].accessValue +" \n";						}
					}
				 }
				 if(!communityCLI){
					 return;
				 }
				 var result = requestRoutingService.getConfigCmdOutput(communityCLI);	
				 if(result==""){
						notificationService.showNotification(translate('snmp_success_msg'),translate('com_config_success_title'),'success');
					}else{
						notificationService.showNotification(result,translate('com_config_fail_title'),'error');
					}
					$scope.loadGridData();
					$scope.communityChanges = false;
					$scope.communityGridDataSource = new kendo.data.DataSource({
						pageSize: 10,
						data: $scope.communityGridData
					});
				 
            }
			
            else if ($scope.snmpTabStrip.select().index() == 2) {
				if($scope.snmpV3UserValidator.validate() ){
					$scope.userGridData.push($scope.snmpUser)
					$scope.snmpUser = {};
					$scope.v3UsersWindow.close();
				}
				var pristineDataUser = angular.copy($scope.snmpUserPristineData);
				var currentDataTemp1 = angular.copy($scope.snmpUserGrid.dataSource._data);
				var createdSnmp_user = filterSnmpUser(pristineDataUser, currentDataTemp1);
				var deletedSnmp_user = filterSnmpUser(currentDataTemp1, pristineDataUser);
				if(deletedSnmp_user.length > 0){
					createdSnmp_user = [];
				}
				var userCLI = "";
				if(!deletedSnmp_user.length){
					if($scope.deleteUser){
					deletedSnmp_user = $scope.deleteUser;
					}
				}
				if(deletedSnmp_user){
				for (var j1 = 0; j1 < deletedSnmp_user.length; j1++) {
						if(deletedSnmp_user[j1].Version == "v3"){
						    userCLI += "no snmp-server user " + deletedSnmp_user[j1].userName + " " + deletedSnmp_user[j1].groupName + " v3 \n";
						}else{
							if(deletedSnmp_user[j1].acessNumber){
							userCLI += userCLI + "no snmp-server user " + deletedSnmp_user[j1].userName + " " + deletedSnmp_user[j1].groupName + " " +  deletedSnmp_user[j1].Version + " access " + deletedSnmp_user[j1].acessNumber +" \n";
						    }else{
							userCLI += userCLI + "no snmp-server user " + deletedSnmp_user[j1].userName + " " + deletedSnmp_user[j1].groupName + " " +  deletedSnmp_user[j1].Version +" \n";	
							}
						}
					}
				}	
				if(createdSnmp_user){
					for (var i1 = 0; i1 < createdSnmp_user.length; i1++) {
						if(createdSnmp_user[i1].Version == "v3"){
							var privProtocolType = translate("portconfig_options_none");
							if (createdSnmp_user[i1].authProtocol == translate("portconfig_options_none")){
								userCLI = userCLI + "snmp-server user " + createdSnmp_user[i1].userName + " " + createdSnmp_user[i1].groupName + " v3 \n";
							}
							if (createdSnmp_user[i1].privProtocol == "3DES"){
								privProtocolType = "3des";
							}
							if (createdSnmp_user[i1].privProtocol == "DES"){
								privProtocolType = "des";
							}
							if (createdSnmp_user[i1].privProtocol == "AES128"){
								privProtocolType = "aes 128";
							}
							if (createdSnmp_user[i1].privProtocol == "AES192"){
								privProtocolType = "aes 192";
							}
							if (createdSnmp_user[i1].privProtocol == "AES256"){
								privProtocolType = "aes 256";
							}
							if (createdSnmp_user[i1].authProtocol != "None" && createdSnmp_user[i1].authPassword == "") {
								createdSnmp_user[i1].authPassword = "test123"
							}
							if (createdSnmp_user[i1].privProtocol != "None" && createdSnmp_user[i1].privPassword == "") {
								createdSnmp_user[i1].privPassword = "test123"
							}
							if (createdSnmp_user[i1].authProtocol == "MD5") {
								if (privProtocolType == translate("portconfig_options_none")) {
									if (createdSnmp_user[i1].authPassword != ""){
										userCLI = userCLI + "snmp-server user " + createdSnmp_user[i1].userName + " " + createdSnmp_user[i1].groupName + " v3 auth md5 " + createdSnmp_user[i1].authPassword + " \n";
									}
								}
								else {
									if ((createdSnmp_user[i1].privPassword != "")){
										userCLI = userCLI + "snmp-server user " + createdSnmp_user[i1].userName + " " + createdSnmp_user[i1].groupName + " v3 auth md5 " + createdSnmp_user[i1].privPassword + " priv " + privProtocolType + " " + createdSnmp_user[i1].authPassword + " \n";
									}
								}
							}
							if (createdSnmp_user[i1].authProtocol == "SHA") {
								if (privProtocolType == translate("portconfig_options_none")) {
									if (createdSnmp_user[i1].authPassword){
										userCLI = userCLI + "snmp-server user " + createdSnmp_user[i1].userName + " " + createdSnmp_user[i1].groupName + " v3 auth sha " + createdSnmp_user[i1].authPassword + " \n";
									}
								}
								else {
									if (createdSnmp_user[i1].privPassword){
										userCLI = userCLI + "snmp-server user " + createdSnmp_user[i1].userName + " " + createdSnmp_user[i1].groupName + " v3 auth sha " + createdSnmp_user[i1].privPassword + " priv " + privProtocolType + " " + createdSnmp_user[i1].authPassword + " \n";
									}
								}
							}
					 }else{
						 if(createdSnmp_user[i1].acessNumber){
						 userCLI = userCLI + "snmp-server user " + createdSnmp_user[i1].userName + " " + createdSnmp_user[i1].groupName + " " +  createdSnmp_user[i1].Version + " access " + createdSnmp_user[i1].acessNumber +" \n";
					     }else{
						 userCLI = userCLI + "snmp-server user " + createdSnmp_user[i1].userName + " " + createdSnmp_user[i1].groupName + " " +  createdSnmp_user[i1].Version +" \n";	 
						 }
					 }
					}
				}
				if(!userCLI){
					return;
				}
				var result1 = requestRoutingService.getConfigCmdOutput(userCLI);
					if(result1==""){
						notificationService.showNotification(translate('snmp_success_msg'),translate('com_config_success_title'),'success');
					}else{
						notificationService.showNotification(result1,translate('com_config_fail_title'),'error');
					}
					if (createdSnmp_user.length > 0) {
						$scope.fieldEmpty = false;
						if (!$scope.snmpUserGrid.editable) {
							$scope.disableApplyButton = true;
						} else {
							$scope.disableApplyButton = true;
							$scope.snmpUserGrid.editable.end();
						}
					}
					$scope.snmpUserChanges = false;
					$scope.loadGridData();
            }
            else if ($scope.snmpTabStrip.select().index() == 3) {
				if($scope.snmpHostValidator.validate()){
					$scope.hostGridData.push($scope.snmpHost);
					$scope.snmpHost = {};
					$scope.hostWindow.close();
			    }
                var pristineData = angular.copy($scope.snmpHostPristineData);
                var currentDataTemp2 = angular.copy($scope.snmpHostGrid.dataSource._data);
                var createdSnmp_host = filterSnmpHost(pristineData, currentDataTemp2);
                var deletedSnmp_host = filterSnmpHost(currentDataTemp2, pristineData);
                var hostCLI = "";
				if(deletedSnmp_host.length>0){
					createdSnmp_host = [];
				}
				if(!deletedSnmp_host.length){
					if($scope.deleteHost){
					deletedSnmp_host = $scope.deleteHost;
					$scope.deleteHost = [];
					}
				}
                for (var j2 = 0; j2 < deletedSnmp_host.length; j2++) {
                    if (deletedSnmp_host[j2].version == "v1"){
                        hostCLI = hostCLI + "no snmp-server host " + deletedSnmp_host[j2].ipAddress + " trap version 1 " + deletedSnmp_host[j2].communityName + " udp-port " + deletedSnmp_host[j2].udpPort + " \n";
					}
                    if (deletedSnmp_host[j2].version == "v2c"){
                        hostCLI = hostCLI + "no snmp-server host " + deletedSnmp_host[j2].ipAddress + " " + deletedSnmp_host[j2].type + " version 2c " + deletedSnmp_host[j2].communityName + " udp-port " + deletedSnmp_host[j2].udpPort + " \n";
					}
                    if (deletedSnmp_host[j2].version == "v3"){
                        hostCLI = hostCLI + "no snmp-server host " + deletedSnmp_host[j2].ipAddress + " " + deletedSnmp_host[j2].type + " version 3 " + deletedSnmp_host[j2].securityLevel + " " + deletedSnmp_host[j2].communityName + " udp-port " + deletedSnmp_host[j2].udpPort + " \n";
					}
                }
				if(createdSnmp_host){
					for (var i2 = 0; i2 < createdSnmp_host.length; i2++) {
						if (!createdSnmp_host[i2].udpPort){
							createdSnmp_host[i2].udpPort = "162";
						}
						if (createdSnmp_host[i2].version == "v1"){
							hostCLI = hostCLI + "snmp-server host " + createdSnmp_host[i2].ipAddress + " trap version 1 " + createdSnmp_host[i2].communityName + " udp-port " + createdSnmp_host[i2].udpPort + " \n";
						}
						if (createdSnmp_host[i2].version == "v2c"){
							hostCLI = hostCLI + "snmp-server host " + createdSnmp_host[i2].ipAddress + " " + createdSnmp_host[i2].type + " version 2c " + createdSnmp_host[i2].communityName + " udp-port " + createdSnmp_host[i2].udpPort + " \n";
						}
						if (createdSnmp_host[i2].version == "v3"){
							hostCLI = hostCLI + "snmp-server host " + createdSnmp_host[i2].ipAddress + " " + createdSnmp_host[i2].type + " version 3 " + createdSnmp_host[i2].securityLevel + " " + createdSnmp_host[i2].communityName + " udp-port " + createdSnmp_host[i2].udpPort + " \n";
						}
					}
				}
                if (createdSnmp_host.length > 0) {
                    if (!$scope.snmpHostGrid.editable) {
                        $scope.disableApplyButton = true;
                    } else {
                        $scope.disableApplyButton = true;
                        $scope.snmpHostGrid.editable.end();
                    }
                }
				if(!hostCLI){
					 return;
				 }
                var result2 = requestRoutingService.getConfigCmdOutput(hostCLI);
                if(result2==""){
    				notificationService.showNotification(translate('snmp_success_msg'),translate('com_config_success_title'),'success');
    			}else{
    				notificationService.showNotification(result2,translate('com_config_fail_title'),'error');
    			}
               var tabSNMP ="General";
                if ($scope.snmpTabStrip.select().index() ==1 ) {
                    tabSNMP = "Communities";
                }else if ($scope.snmpTabStrip.select().index() ==2 ) {
                    tabSNMP = "SNMP V3 Users";
                }else if ($scope.snmpTabStrip.select().index() ==3 ) {
                    tabSNMP = "SNMP Host";
                }
                $scope.returnJson.snmpTab = tabSNMP;
				$scope.loadGridData();
                $scope.snmpHostChanges = false;
					$scope.hostGridDataSource = new kendo.data.DataSource({
						pageSize: 10,
						data: $scope.hostGridData
					});
            }
            else if($scope.snmpTabStrip.select().index() == 4){
                if($scope.snmpV3UserGroupValidator.validate()) {
                    $scope.v3UserGroupGridData.push($scope.snmpV3GroupUser);
                    $scope.snmpV3GroupUser = {};
                    $scope.v3GroupUserWindow.close();
                }
                var pristineDataV3GroupUser = angular.copy($scope.snmpV3GroupUserPristineData);
                var currentDataV3GroupUserTemp = angular.copy($scope.v3UserGroupGrid.dataSource._data);
                var createdSnmp_v3UserGroup = filterSnmpV3UserGroup(pristineDataV3GroupUser, currentDataV3GroupUserTemp);
                var deletedSnmp_v3UserGroup = filterSnmpV3UserGroup(currentDataV3GroupUserTemp, pristineDataV3GroupUser);
                var v3GroupUserCLI = "";
                if(deletedSnmp_v3UserGroup.length > 0){
                    createdSnmp_v3UserGroup = [];
                }
                if(!deletedSnmp_v3UserGroup.length){
                    if($scope.deleteV3GroupUser){
                        deletedSnmp_v3UserGroup = $scope.deleteV3GroupUser;
                        $scope.deleteV3GroupUser = [];
                    }
                }
                if(deletedSnmp_v3UserGroup){
                    for (var j = 0; j < deletedSnmp_v3UserGroup.length; j++) {
                        v3GroupUserCLI = v3GroupUserCLI + "no snmp-server group " + deletedSnmp_v3UserGroup[j].groupName + " v3 " + deletedSnmp_v3UserGroup[j].securityLevel +" \n";
                    }
                }
                if (createdSnmp_v3UserGroup) {
                    for (var i = 0; i < createdSnmp_v3UserGroup.length; i++) {
                        if (createdSnmp_v3UserGroup[i].groupName && createdSnmp_v3UserGroup[i].securityLevel){
                            v3GroupUserCLI += "snmp-server group " + createdSnmp_v3UserGroup[i].groupName + " v3 " + createdSnmp_v3UserGroup[i].securityLevel +" \n";
                        }
                    }
                }
                if(!v3GroupUserCLI){
                    return;
                }
                var result = requestRoutingService.getConfigCmdOutput(v3GroupUserCLI);
                if(result==""){
                    notificationService.showNotification(translate('snmp_success_msg'),translate('com_config_success_title'),'success');
                }else{
                    notificationService.showNotification(result,translate('com_config_fail_title'),'error');
                }
                $scope.loadGridData();
                $scope.snmpV3GroupUserChanges = false;
                $scope.v3UserGroupGridDataSource= new kendo.data.DataSource({
                    pageSize: 10,
                    data: $scope.v3UserGroupGridData
                });
            }
            else if ($scope.snmpTabStrip.select().index() == 0) {
				
            }
           if ($scope.snmpTabStrip.select().index() == 1) {
                $scope.snmpCommunityPristineData = {};
                $scope.snmpCommunityPristineData = angular.copy($scope.communityGrid.dataSource._data);
                $scope.communityGridDataSource.sync();
                $scope.cancelOtherTabs = true;
				$scope.enableDeleteBtn = true;
            }
            else if ($scope.snmpTabStrip.select().index() == 2) {
                $scope.snmpUserPristineData = {};
                $scope.snmpUserPristineData = angular.copy($scope.snmpUserGrid.dataSource._data);
                $scope.userGridDataSource.sync();
                $scope.cancelOtherTabs = true;
				$scope.enableDeleteBtn = true;
            }
            else if ($scope.snmpTabStrip.select().index() == 3) {
                $scope.snmpHostPristineData = {};
                $scope.snmpHostPristineData = angular.copy($scope.snmpHostGrid.dataSource._data);
                $scope.hostGridDataSource.sync();
                $scope.cancelOtherTabs = true;
				$scope.enableDeleteBtn = true;
            }
           else if ($scope.snmpTabStrip.select().index() == 4) {
               $scope.snmpV3GroupUserPristineData = {};
               $scope.snmpV3GroupUserPristineData = angular.copy($scope.v3UserGroupGrid.dataSource._data);
               $scope.v3UserGroupGridDataSource.sync();
               $scope.cancelOtherTabs = true;
               $scope.enableDeleteBtn = true;
           }
            $scope.enableDeleteButton = true;
			if(snmpValidations.validate()) {
				$scope.disableApplyButton = true;
			}
			if ($scope.snmpTabStrip.select().index() == 0 || $scope.snmpTabStrip.select().index() == 3){
				$scope.loadGridData();
			}
        };
        $scope.showToasters = function (data) {
            validationService.showToasterMessage(data, validationService.WSMA_MESSAGE);
        };
        $scope.cancel = function () {
            $scope.confirmationWindow.close();
        };
        //All Variable Declrations are being done here
        $scope.enableDeleteBtn = true;
        $scope.authenticationProtocolOptions = new kendo.data.DataSource({
            data: [
                {
                    nameAuth: translate("portconfig_options_none"),
                    valueAuth: "None"
                },
                {
                    nameAuth: "MD5",
                    valueAuth: "MD5"
                },
                {
                    nameAuth: "SHA",
                    valueAuth: "SHA"
                }
            ]
        })
        $scope.privacyProtocolOptions = new kendo.data.DataSource({
            data: [
                {
                    namePriv: translate("portconfig_options_none"),
                    valuePriv: "None"
                },
                {
                    namePriv: "3DES",
                    valuePriv: "3DES"
                },
                {
                    namePriv: "AES128",
                    valuePriv: "AES128"
                },
                {
                    namePriv: "AES192",
                    valuePriv: "AES192"
                },
                {
                    namePriv: "AES256",
                    valuePriv: "AES256"
                },
                {
                    namePriv: "DES",
                    valuePriv: "DES"
                }
            ]
        })
        $scope.snmpVersionOptions = new kendo.data.DataSource({
            data: [
                {
                    name: "V1",
                    value: "v1"
                },
                {
                    name: "V2C",
                    value: "v2c"
                },
                {
                    name: "V3",
                    value: "v3"
                }
            ]
        })
        $scope.securityLevelOptions = new kendo.data.DataSource({
            data: [
                {
                    name: "auth",
                    value: "auth"
                },
                {
                    name: "noauth",
                    value: "noauth"
                },
                {
                    name: "priv",
                    value: "priv"
                }
            ]
        })
        $scope.messageTypeOptionsV1 = new kendo.data.DataSource({
            data: [
                {
                    name: translate("management_snmp_v3usertype_trap"),
                    value: "trap"
                }
            ]
        })
        $scope.messageTypeOptionsV2andV3 = new kendo.data.DataSource({
            data: [
                {
                    name: translate("management_snmp_v3usertype_trap"),
                    value: "trap"
                },
                {
                    name: translate("management_snmp_v3usertype_inform"),
                    value: "informs"
                }
            ]
        })
        $scope.messageTypeOptions = angular.copy($scope.messageTypeOptionsV1);
		var hdrTmpCommunityName=translate("management_snmp_community_name") + " <tooltip helptext='" + translate("help_SNMP_community_name") +"' position='top'></tooltip>";
		var hdrTmpAccessMode=translate("management_snmp_community_mode") + " <tooltip helptext='" + translate("help_SNMP_access_mode") +"' position='top'></tooltip>";
		var snmpnameMsg = translate("management_snmp_name_required");
		var snmpgrpnameMsg = translate("management_snmp_grpname");
		var snmppasswordMsg = translate("management_snmp_password_required");
		var snmpusernameMsg = translate("management_snmp_username");
		var snmpipMsg = translate("management_snmp_ipaddress_required");
		var snmpcomnameMsg = translate("management_snmp_comname_required");
		$scope.communityGridDataSource = new kendo.data.DataSource({
					pageSize: 10,
					data: $scope.communityGridData
				});
		
        $scope.communityGridOptions = {
            	editable : false,
				sortable : true,
				filterable : {
					extra : false,
					operators : {
						string : {
							eq : translate("com_is_equal"),
							neq : translate("com_isnot_equal")
						}
					},
					messages : {
			            info: translate("com_page_dropDowntext"),
			            filter: translate("com_btn_filter"),
			            clear: translate("com_btn_clear")
			        }
				},
				scrollable : false,
				selectable : true,
				pageable : {
					messages: {
						  display: translate("com_page_display"),
						  empty: translate("com_page_empty"),
						  page: translate("com_page_pagetext"),
						  of:translate("com_page_of"),
						  itemsPerPage: translate("com_page_itemsPerPage"),
						  first: translate("com_page_first"),
						  previous: translate("com_page_previous"),
						  next: translate("com_page_next"),
						  last: translate("com_page_last"),
						  refresh: translate("com_page_refresh"),
						  morePages: translate("com_page_morePage")
					},
					previousNext : true,
					info : true,
					refresh : true,
					pageSizes : gridCrudService.grid_page_sizes,
					buttonCount : 5
				},
				columns : [{
                    "template": "<input type=\"checkbox\"  ng-model=\"checkedCommunity\" ng-click=\"isChecked(checkedCommunity,dataItem,'Community')\"  />",
                    sortable: false,
                    width: "2%"
                },{
					field : "Name",
					title : translate("management_snmp_community_name"),
					width : "10%"
				}, {
					field : "AccessMode",
					title : translate("management_snmp_community_mode"),
					width : "10%"
				}, {
					field : "accessValue",
					title : translate("com_access_value"),
					width : "10%"
				}]
			};
		$scope.v3UserGroupGridDataSource= new kendo.data.DataSource({
			pageSize: 10,
			data: $scope.v3UserGroupGridData
		});
		$scope.v3UserGroupGridOptions = {
			editable : false,
			sortable : true,
			filterable : {
				extra : false,
				operators : {
					string : {
						eq : translate("com_is_equal"),
						neq : translate("com_isnot_equal")
					}
				},
				messages : {
					info: translate("com_page_dropDowntext"),
					filter: translate("com_btn_filter"),
					clear: translate("com_btn_clear")
				}
			},
			scrollable : false,
			selectable : true,
			pageable : {
				messages: {
					display: translate("com_page_display"),
					empty: translate("com_page_empty"),
					page: translate("com_page_pagetext"),
					of:translate("com_page_of"),
					itemsPerPage: translate("com_page_itemsPerPage"),
					first: translate("com_page_first"),
					previous: translate("com_page_previous"),
					next: translate("com_page_next"),
					last: translate("com_page_last"),
					refresh: translate("com_page_refresh"),
					morePages: translate("com_page_morePage")
				},
				previousNext : true,
				info : true,
				refresh : true,
				pageSizes : gridCrudService.grid_page_sizes,
				buttonCount : 5
			},
			columns : [{
				"template": "<input type=\"checkbox\"  ng-model=\"checkedV3GroupUser\" ng-click=\"isChecked(checkedV3GroupUser,dataItem,'V3GroupUser')\"  />",
				sortable: false,
				width: "2%"
			},{
				field : "groupName",
				title : translate("management_snmp_v3user_group"),
				width : "10%"
			}, {
				field : "securityLevel",
				title : translate("management_snmp_host_security"),
				width : "10%"
			}]
		};
		$scope.authProtocolChange = function (e) {
            var passwordColumn = angular.element(angular.element(e.sender.element).parent().parent().parent().find("td")[4]);
            passwordColumn.empty();
            var model = $scope.snmpUserGrid._modelForContainer(passwordColumn);
            if (e.sender._old == "MD5" || e.sender._old == "SHA") {
                $("<input type='password' class='k-text-box form-control fieldinput margin-top-05' required data-required-msg='{{'management_snmp_password_required' | translate}}' data-bind='value:authPassword'>").appendTo(passwordColumn).element
            }
            kendo.bind(passwordColumn, model);
        };
        $scope.privProtocolChange = function (e) {
			var privpro = translate('management_snmp_password_required');
            var passwordColumn = angular.element(angular.element(e.sender.element).parent().parent().parent().find("td")[6]);
            passwordColumn.empty();
            var model = $scope.snmpUserGrid._modelForContainer(passwordColumn);
            if (e.sender._old.toUpperCase() == "DES" || e.sender._old.toUpperCase() == "3DES" || e.sender._old.toUpperCase() == "AES128" || e.sender._old.toUpperCase() == "AES192" || e.sender._old.toUpperCase() == "AES256") {
                $("<input type='password' name='authPassword' class='k-text-box form-control field-input margin-top-05' required data-required-msg='"+privpro+"' data-bind='value:privPassword'>").appendTo(passwordColumn).element
            }
            kendo.bind(passwordColumn, model);
        };
        var hdrTmpGroupName=translate("management_snmp_v3user_group") + " <tooltip helptext='" + translate("help_SNMP_group") +"' position='top'></tooltip>";
        var hdrTmpAuthProtocol=translate("management_snmp_v3user_auth_protocol") + " <tooltip helptext='" + translate("help_SNMP_auth_protocol") +"' position='top'></tooltip>";
        var hdrTmpPrivProtocol=translate("management_snmp_v3user_priv_protocol") + " <tooltip helptext='" + translate("help_SNMP_priv_protocol") +"' position='top'></tooltip>";
        $scope.userGridOptions = {
            editable: false,
            edit: function () {
                preventUsersGridPaginationAction = true;
            },
            sortable: true,
            pageable: {
            	messages: {
					  display: translate("com_page_display"),
					  empty: translate("com_page_empty"),
					  page: translate("com_page_pagetext"),
					  of:translate("com_page_of"),
					  itemsPerPage: translate("com_page_itemsPerPage"),
					  first: translate("com_page_first"),
					  previous: translate("com_page_previous"),
					  next: translate("com_page_next"),
					  last: translate("com_page_last"),
					  refresh: translate("com_page_refresh"),
					  morePages: translate("com_page_morePage")
				},
				refresh:true,
                pageSizes: gridCrudService.grid_page_sizes, // This page size variable is written in datasourceService.js file.
                buttonCount: 4
            },
            filterable : {
				extra : false,
				operators : {
					string : {
						eq : translate("com_is_equal"),
                        neq : translate("com_isnot_equal")
					}
				},
				messages : {
		            info: translate("com_page_dropDowntext"),
		            filter: translate("com_btn_filter"),
		            clear: translate("com_btn_clear")
		        }
			},
            selectable: true,
			scrollable:false,
            columns : [{
                    "template": "<input type=\"checkbox\" ng-model=\"checkedUser\" ng-click=\"isChecked(checkedUser,dataItem,'User')\"  />",
                    sortable: false,
                    width: "5%"
                },{
					field: "userName",
                    title : translate("management_snmp_v3user_name"),
					width : "10%"
				}, {
					field: "groupName",
					headerTemplate : hdrTmpGroupName,
                    title : translate("management_snmp_v3user_group"),
					width : "10%"
				}, {
					field: "Version",
                    title : translate("management_snmp_host_version"),
					width : "10%"
				}, {
					field: "acessNumber",
                    title : translate("management_snmp_host_version"),
					hidden : true,
					width : "10%"
				}, {
					field: "authProtocol",
					headerTemplate : hdrTmpAuthProtocol,
                    title : translate("management_snmp_v3user_auth_protocol"),
					width : "10%"
				}, {
					field: "authPassword",
                    title : translate("management_snmp_v3user_auth_password"),
					template: "#if (authProtocol == 'None' || authProtocol == '') { # <div>{{'portconfig_options_none' | translate}} </div> # }else{# <div>***** </div> #} #",
					width : "10%"
				},{
					field: "privProtocol",
					headerTemplate : hdrTmpPrivProtocol,
                    title : translate("management_snmp_v3user_priv_protocol"),
					width : "10%"
				},{
					field: "privPassword",
                    title : translate("management_snmp_v3user_priv_password"),
					template: "#if (authProtocol == ''  || authProtocol == 'None' ||  privProtocol == 'None' ||  privProtocol == '') { # <div>{{'portconfig_options_none' | translate}} </div> # }else{# <div>***** </div> #} #",
					width : "10%"
				}]
        };
		$scope.changeUserName = function(_val){
			if(_val){
				$timeout(function() {
					angular.element("#snmpUserGrid table tbody tr:nth-child(1) td:nth-child(3)").click();
				},10);
			}
		};
        var hdrTmpIPAddress=translate("management_snmp_host_ipaddress") + " <tooltip helptext='" + translate("help_SNMP_IP_address") +"' position='top'></tooltip>";
        var hdrTmpUdpPort=translate("management_snmp_host_port") + " <tooltip helptext='" + translate("help_SNMP_port") +"' position='top'></tooltip>";
        var hdrTmpVersion=translate("management_snmp_host_version") + " <tooltip helptext='" + translate("help_SNMP_version") +"' position='top'></tooltip>";
        var hdrTmpType=translate("management_snmp_host_type") + " <tooltip helptext='" + translate("help_SNMP_type") +"' position='top'></tooltip>";
        $scope.hostGridOptions = {
            editable: false,
            edit: function () {
                preventHostsGridPaginationAction = true;
            },
            sortable: true,
            pageable: {
            	messages: {
					  display: translate("com_page_display"),
					  empty: translate("com_page_empty"),
					  page: translate("com_page_pagetext"),
					  of:translate("com_page_of"),
					  itemsPerPage: translate("com_page_itemsPerPage"),
					  first: translate("com_page_first"),
					  previous: translate("com_page_previous"),
					  next: translate("com_page_next"),
					  last: translate("com_page_last"),
					  refresh: translate("com_page_refresh"),
					  morePages: translate("com_page_morePage")
				},
				refresh:true,
                pageSizes: gridCrudService.grid_page_sizes,
                buttonCount: 4
            },
            filterable : {
				extra : false,
				operators : {
					string : {
						
						eq : translate("com_is_equal"),
                        neq : translate("com_isnot_equal")
					}
				},
				messages : {
		            info: translate("com_page_dropDowntext"),
		            filter: translate("com_btn_filter"),
		            clear: translate("com_btn_clear")
		        }
			},
            selectable: true,
			scrollable : false,
            columns : [{
                    "template": "<input type=\"checkbox\"  ng-model=\"checkedHost\" ng-click=\"isChecked(checkedHost,dataItem,'Host')\"  />",
                    sortable: false,
                    width: 2
                },{
					field: "ipAddress",
                    title : translate("management_snmp_host_ipaddress"),
					headerTemplate : hdrTmpIPAddress,
                    width: 4,
				}, {
					field: "udpPort",
                    title : translate("management_snmp_host_port"),
                    headerTemplate : hdrTmpUdpPort,
                    width: 4,
				}, {
					field: "version",
                    title : translate("management_snmp_host_version"),
                    headerTemplate : hdrTmpVersion,
                    width: 4,
				}, {
					field: "type",
                    title : translate("management_snmp_host_type"),
                    headerTemplate : hdrTmpType,
                    width: 4,
				},{
					field: "communityName",
                    title : translate("management_snmp_host_community"),
                    width: 4,
				},{
					field: "securityLevel",
                    title : translate("management_snmp_host_security"),
                    width: 4,
				}]
        };
		$scope.changeipAddress = function(_val){
			if(_val){
				$timeout(function() {
					angular.element("#snmpHostGrid table tbody tr:nth-child(1) td:nth-child(6)").click();
				},10);
			}
		};
		$scope.vlanCancel = function() {
			$timeout(function(){
				$scope.vlanGridWindow.close();
			});
		};
		$scope.userCancel = function() {
			$scope.deleteUser = [];
			$timeout(function(){
				$scope.v3UsersWindow.close();
				$scope.deleteUser = [];
			});
		};
		$scope.HostCancel = function() {
			$timeout(function(){
				$scope.hostWindow.close();
				$scope.deleteHost = [];
			});
		};
		$scope.v3GroupUserCancel = function() {
			$timeout(function(){
				$scope.v3GroupUserWindow.close();
				$scope.deleteV3GroupUser = [];
			});
		};
		$scope.addBtnFunction = function () {
            $scope.disableApplyButton = false;
            if ($scope.snmpTabStrip.select().index() == 1) {
				$scope.EditcommunityChanges = false;
				$scope.snmpCommunityValidator.hideMessages();
                $scope.cancelOtherTabs = false;
				$scope.vlanGridWindow.open().center();
				$scope.snmpCommunity.Name = "";
				$scope.snmpCommunity.accessValue = "";
				$scope.snmpCommunity.AccessMode = $scope.communityAccessModeOptions[0].modeValue;
				$scope.communityChanges = true;
            } else if ($scope.snmpTabStrip.select().index() == 2) {
				$scope.snmpV3UserValidator.hideMessages();
				$scope.EditUserChanges = false;
                $scope.cancelOtherTabs = false;
                    $scope.v3UsersWindow.open().center();
					$scope.snmpUser.userName = "";
					$scope.snmpUser.groupName = "";
					$scope.snmpUser.authPassword = "";
					$scope.snmpUser.privPassword = "";
				    $scope.snmpUser.authProtocol = $scope.authenticationProtocolOptions.options.data[0].nameAuth;
				    $scope.snmpUser.privProtocol = $scope.privacyProtocolOptions.options.data[0].namePriv;
					$scope.snmpUser.Version = $scope.snmpVersionOptions.options.data[0].value;
                    $scope.snmpUserChanges = true;
            } else if ($scope.snmpTabStrip.select().index() == 3) {
				$scope.EditHostChanges = false;
				$scope.snmpHostValidator.hideMessages();
                $scope.cancelOtherTabs = false;
				    $scope.hostWindow.open().center();
					$scope.snmpHost.ipAddress = "";
					$scope.snmpHost.udpPort = "";
					$scope.snmpHost.communityName = "";
				    $scope.snmpHost.version = $scope.snmpVersionOptions.options.data[0].value;
				    $scope.snmpHost.type = $scope.messageTypeOptionsV1.options.data[0].value;
            } else if ($scope.snmpTabStrip.select().index() == 4) {
                $scope.EditV3GroupUserChanges = false;
                $scope.snmpV3UserGroupValidator.hideMessages();
            	$scope.cancelOtherTabs = false;
                $scope.v3GroupUserWindow.open().center();
                $scope.snmpV3GroupUser.groupName = "";
                $scope.snmpV3GroupUser.securityLevel = "auth";
                $scope.snmpV3GroupUserChanges = true;
            }
        };
		$scope.openDeleteWindow = function(windowType){
			if(windowType =="deleteSnmpWindow"){
				$scope.deleteWindow = dialogService.dialog({
					content : translate('msg_delete_confirmation'),
					messageType : translate('sys_dhcp_confirm'),
					actionButtons : [{
						text : translate('com_ok'),
						callback : "deleteDHCP"
					},
						{
							text : translate('com_cancel'),
							callback : "cancelDelete"
						}]
				});
			}
		};
        $scope.deleteBtnFunction = function () {
			$scope.openDeleteWindow('deleteSnmpWindow');
        };
		$scope.$on("deleteDHCP", function() {
			$scope.deleteWindow.data("kendoWindow").close();
			$scope.disableApplyButton = false;
			$scope.enableDeleteBtn = true;
            switch ($scope.snmpTabStrip.select().index()) {
                case 4:
                    if ($scope.countV3GroupUser > 0) {
                        for (var v3GroupUser = 0; v3GroupUser < $scope.selectedV3GroupUserArray.length; v3GroupUser++) {
                            $scope.v3UserGroupGrid.dataSource.remove($scope.selectedV3GroupUserArray[v3GroupUser]);
                            $scope.snmpV3GroupUserChanges = true;
                        }
                        $scope.selectedV3GroupUserArray = [];
                    }
                    break;
                case 3:
                    if ($scope.countHost > 0) {
                        for (var host = 0; host < $scope.selectedHostArray.length; host++) {
                            $scope.snmpHostGrid.dataSource.remove($scope.selectedHostArray[host]);
                            $scope.snmpHostChanges = true;
                        }
                        $scope.selectedHostArray = [];
                    }
                    break;
                case 2:
                    if ($scope.countUser > 0) {
                        for (var userIndex = 0; userIndex < $scope.selectedUserArray.length; userIndex++) {
                            $scope.snmpUserGrid.dataSource.remove($scope.selectedUserArray[userIndex]);
                            $scope.snmpUserChanges = true;
                        }
                        $scope.selectedUserArray = [];
                    }
                    break;
                case 1:
                    if ($scope.countCommunity > 0) {
                        for (var communityIndex = 0; communityIndex < $scope.selectedCommunityArray.length; communityIndex++) {
                            $scope.communityGrid.dataSource.remove($scope.selectedCommunityArray[communityIndex]);
                            $scope.communityChanges = true;
                        }
                        $scope.selectedCommunityArray = [];
                    }
                    break;
				default:
					break;
            }
			$scope.apply();
		});
		$scope.$on("cancelDelete", function() {
			$scope.deleteWindow.data("kendoWindow").close();
			$scope.enableDeleteBtn = true;
			$scope.resetBtnFunction();
		});
		angular.element("#communityGrid").delegate(".k-pager-refresh", "click", function(){
			$scope.resetBtnFunction();
			if (!$scope.$$phase){
				$scope.$apply();
			}
		});
		angular.element("#snmpUserGrid").delegate(".k-pager-refresh", "click", function(){
			$scope.resetBtnFunction();
			if (!$scope.$$phase){
				$scope.$apply();
			}
		});
		angular.element("#snmpHostGrid").delegate(".k-pager-refresh", "click", function(){
			$scope.resetBtnFunction();
			if (!$scope.$$phase){
				$scope.$apply();
			}
		});
		$scope.resetBtnFunction = function () {
			if ($scope.snmpTabStrip.select().index() == 1) {
				$scope.loadGridData();
				$scope.enableDeleteBtn = true;
				$scope.disableApplyButton = true;
			}
			else if ($scope.snmpTabStrip.select().index() == 2) {
				$scope.loadGridData();
				$scope.enableDeleteBtn = true;
				$scope.disableApplyButton = true;
			}
			else if ($scope.snmpTabStrip.select().index() == 3) {
				$scope.loadGridData();
				$scope.enableDeleteBtn = true;
				$scope.disableApplyButton = true;
			}
            else if ($scope.snmpTabStrip.select().index() == 4) {
                $scope.loadGridData();
                $scope.enableDeleteBtn = true;
                $scope.disableApplyButton = true;
            }
		};
		$scope.enableApplybtn1 = function(){
				$scope.snmpModel.displayAllGrid = ($scope.snmpModel.status == 'not enabled') ? translate('com_disable') : translate('com_enable');
				if($scope.snmpModel.status1 == translate('com_disable')){
					if($scope.snmpModel.status == translate('com_enable')){
						$scope.disableApplyButton = true;
					}
				}
				else if($scope.snmpModel.status1 == translate('com_enable') && $scope.snmpModel.status == translate('com_disable')){
					$scope.disableApplyButton = false;
				}
				if($scope.snmpModel.status1 == translate('com_enable') && $scope.snmpModel.status == translate('com_enable')){
					$scope.disableApplyButton = false;
				}
				$scope.generalApply();
		}
		 $scope.loadGridData = function () {
			$scope.EditcommunityChanges = false;
			$scope.EditHostChanges = false;
			$scope.EditUserChanges = false;
            $scope.EditV3GroupUserChanges = false;
			$scope.userGridData = new kendo.data.ObservableArray([]);
			var showSNMP = requestRoutingService.getShowCmdOutput("show snmp", "snmp");
			var showSNMPTftp = requestRoutingService.getShowCmdOutput("show running-config | i tftp-server-list");
			var showUsers = requestRoutingService.getShowCmdOutput("show running-config partition snmp");
			var getUsers = showUsers.split("\n");
			$scope.userCheck = [];
			$scope.GroupUser = [];
             var GroupUserObj = {};
			if(getUsers){
				for(var i=0;i<getUsers.length;i++){
					if((getUsers[i].indexOf("v1")!=-1)||(getUsers[i].indexOf("v2c")!=-1)){
						$scope.userCheck.push(getUsers[i])
					}
				}
			}
             if(getUsers){
                 for(var i=0;i<getUsers.length;i++){
                     if((getUsers[i].indexOf("snmp-server group")!=-1)){
                         $scope.GroupUser.push(getUsers[i]);
                     }
                 }
             }
             $scope.v3UserGroupGridData = new kendo.data.ObservableArray([]);
             for(var g=0;g<$scope.GroupUser.length;g++){
                 GroupUserObj.groupUser = executeCliCmdService.getNextString($scope.GroupUser[g],["snmp-server group"],["\n"]).trim();
                 var res = GroupUserObj.groupUser.split(" ");
                 var snmpV3GroupUser1 = { groupName : res[0],
                 						  securityLevel : res[2]
                 						};
                 $scope.v3UserGroupGridData.push(snmpV3GroupUser1);
			 }
             $scope.snmpV3GroupUserPristineData = angular.copy($scope.v3UserGroupGridData);
             $scope.v3UserGroupGridDataSource = new kendo.data.DataSource({
                 pageSize: 10,
                 data: $scope.v3UserGroupGridData
             });
             var groupUserGrid = angular.element("#v3UserGroupGrid").data("kendoGrid");
             groupUserGrid.dataSource = $scope.v3UserGroupGridDataSource;
             $scope.v3UserGroupGridDataSource.read();
             groupUserGrid.refresh();
			 if($scope.userCheck.length >0) {
				for (index = 0; index < $scope.userCheck.length; index++) {
					var snmpUserTest = $scope.userCheck[index].split(" ")
					var userSnmpValue = {
						userName: snmpUserTest[2],
						groupName: snmpUserTest[3],
						Version : snmpUserTest[4],
						acessNumber: snmpUserTest[6],
						privProtocol: "None",
						authProtocol: "None",
						authPassword: "None",
						privPassword: "None"
					};
					$scope.userGridData.push(userSnmpValue);
				}
            }
			$scope.oldtftpvalue = '';
			if(showSNMPTftp.indexOf("snmp-server tftp-server-list")!=-1){
				var tftpValue = showSNMPTftp.split("tftp-server-list")[1]
				$scope.oldtftpvalue = angular.copy(tftpValue)
			}
			$scope.snmpModel.snmpTftp = tftpValue || "";
            showSNMP = showSNMP ? showSNMP.ShowSnmp.wnwebdata.entry : $scope.snmpModel;
			$scope.disableApplyButton = true;
            $scope.snmpModel.status = (showSNMP.status == 'not enabled') ? translate('com_disable') : translate('com_enable');
			$scope.snmpModel.status1 = (showSNMP.status == 'not enabled') ? translate('com_disable') : translate('com_enable');
            $scope.snmpModel.displayAllGrid = $scope.snmpModel.status;
            $scope.snmpModel.systemContact = showSNMP.systemContact || "";
            $scope.snmpModel.systemLocation = showSNMP.systemLocation || "";
            if (!showSNMP.globalTrap) {
				showSNMP.globalTrap = "disabled";
			}
            $scope.snmpModel.globalTrap = (showSNMP.globalTrap == 'disabled') ? translate('com_disable') : translate('com_enable');
            if (!showSNMP.logging){
				showSNMP.logging = "";
			}
            $scope.snmpModel.logging = (showSNMP.logging == 'enabled') ? translate('com_enabled') : translate('com_disabled');
				var showSNMPCommunity = requestRoutingService.getShowCmdOutput("show running-config partition snmp", "community");
				showSNMPCommunity = (showSNMPCommunity && showSNMPCommunity.ShowSnmp.SNMPCommunity.entry) ? showSNMPCommunity.ShowSnmp.SNMPCommunity.entry : [];
				$scope.communityGridData = new kendo.data.ObservableArray([]);
				if (showSNMPCommunity.length > 0) {
					for (var loopVariable = 0; loopVariable < showSNMPCommunity.length; loopVariable++) {
						var community = {
							Name: "",
							AccessMode: "",
							accessValue: "",
						}
						if(showSNMPCommunity[loopVariable].Name.indexOf("ro")==-1){
							 community.Name = showSNMPCommunity[loopVariable].Name;
							 if(showSNMPCommunity[loopVariable].AccessNumber){
								 community.accessValue = showSNMPCommunity[loopVariable].AccessNumber;
							 }else{
								 community.accessValue = "NA";
							 }
							 community.AccessMode = (showSNMPCommunity[loopVariable].AccessMode == "RO" ) ? translate("management_snmp_readonly") : translate("management_snmp_readwrite");
							 $scope.communityGridData.push(community);
						}
					}
				}
				else if (showSNMPCommunity.Name) {
					var community1 = {
							Name: "",
							AccessMode: "",
							accessValue: ""
						}
					 if(showSNMPCommunity.Name.indexOf("ro")==-1){
						community1.Name = showSNMPCommunity.Name;
						if(showSNMPCommunity.AccessNumber){
							 community1.accessValue = showSNMPCommunity.AccessNumber;
						 }else{
							 community1.accessValue = "NA";
						 }
						community1.AccessMode = (showSNMPCommunity.AccessMode == "RO" ) ? translate("management_snmp_readonly") : translate("management_snmp_readwrite");
						$scope.communityGridData.push(community1);
					 }
				}
				$scope.snmpCommunityPristineData = angular.copy($scope.communityGridData);
				$scope.communityGridDataSource = new kendo.data.DataSource({
					pageSize: 10,
					data: $scope.communityGridData
				});
				var grid = angular.element("#communityGrid").data("kendoGrid");
				grid.dataSource = $scope.communityGridDataSource;
				$scope.communityGridDataSource.read();
				grid.refresh();
            var showSNMPUser = requestRoutingService.getShowCmdOutput("show snmp user", "user");
            showSNMPUser = (showSNMPUser && showSNMPUser.ShowSnmpUser.wnwebdata.entry) ? showSNMPUser.ShowSnmpUser.wnwebdata.entry : [];
			
			$scope.disableApplyButton = true;
            if(showSNMPUser.length >0) {
				for (index = 0; index < showSNMPUser.length; index++) {
					var privProtocol = showSNMPUser[index].privProtocol == "None" ? translate("portconfig_options_none") : showSNMPUser[index].privProtocol;
					var authProtocol = showSNMPUser[index].authProtocol == "None" ? translate("portconfig_options_none") : showSNMPUser[index].authProtocol;
					var userSnmp = {
						userName: showSNMPUser[index].userName,
						privProtocol: privProtocol,
						groupName: showSNMPUser[index].groupName,
						Version : "v3",
						authProtocol: authProtocol,
						authPassword: "",
						privPassword: ""
					};
					$scope.userGridData.push(userSnmp);
				}
            } else if (showSNMPUser.userName) {
            	var privProtocol1 = showSNMPUser.privProtocol  == "None" ? translate("portconfig_options_none") : showSNMPUser.privProtocol;
				var authProtocol1 = showSNMPUser.authProtocol == "None" ? translate("portconfig_options_none") : showSNMPUser.authProtocol;
                var userSnmp1 = {
                    userName: showSNMPUser.userName,
                    privProtocol: privProtocol1,
                    groupName: showSNMPUser.groupName,
					Version : "v3",
                    authProtocol: authProtocol1,
                    authPassword: "",
                    privPassword: ""
                };
                $scope.userGridData.push(userSnmp1);
            }
			$scope.snmpUserPristineData = angular.copy($scope.userGridData);
			$scope.userGridDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.userGridData
			});
			var grid1 = angular.element("#snmpUserGrid").data("kendoGrid");
			grid1.dataSource = $scope.userGridDataSource;
			$scope.userGridDataSource.read();
			grid1.refresh();
			var showSNMPHost = requestRoutingService.getShowCmdOutput("show snmp host", "host");
            showSNMPHost = (showSNMPHost && showSNMPHost.ShowSnmpHost.wnwebdata.entry) ? showSNMPHost.ShowSnmpHost.wnwebdata.entry : [];
            $scope.hostGridData = new kendo.data.ObservableArray([]);
            if (showSNMPHost.length > 0) {
				for (index = 0; index < showSNMPHost.length; index++) {
					var securityLevel = showSNMPHost[index].securityLevel || "";
					var hostSnmp = {
						communityName: showSNMPHost[index].communityName,
						ipAddress: showSNMPHost[index].ipAddress,
						type: showSNMPHost[index].type === "trap" ? translate("management_snmp_v3usertype_trap") : translate("management_snmp_v3usertype_inform"),
						udpPort: showSNMPHost[index].udpPort,
						version: showSNMPHost[index].version,
						securityLevel: (securityLevel != "") ? securityLevel : portNone
					};
					$scope.hostGridData.push(hostSnmp);
				}
            }else if (showSNMPHost.communityName) {
                    var securityLevel1 = showSNMPHost.securityLevel || "";
                    var hostSnmp1 = {
                        communityName: showSNMPHost.communityName,
                        ipAddress: showSNMPHost.ipAddress === "udp-port:" ? "::" : showSNMPHost.ipAddress,
                        type: showSNMPHost.type === "trap" ? translate("management_snmp_v3usertype_trap") : translate("management_snmp_v3usertype_inform"),
                        udpPort: showSNMPHost.udpPort,
                        version: showSNMPHost.version,
						securityLevel : (securityLevel1 != "") ? securityLevel1 : portNone
                    };
                    $scope.hostGridData.push(hostSnmp1);
            }
            $scope.snmpHostPristineData = angular.copy($scope.hostGridData);
			$scope.hostGridDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.hostGridData
			});
			var grid2 = angular.element("#snmpHostGrid").data("kendoGrid");
			grid2.dataSource = $scope.hostGridDataSource;
			$scope.hostGridDataSource.read();
			grid2.refresh();
        };
}]);
