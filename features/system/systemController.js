/**
 Description: system-Time/NTP Server Controller
 Copyright (c) 2016-2019 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';
app.register.controller('SystemCtrl', ['$scope','$rootScope','$interval','dialogService','$filter','$timeout','validationService','requestRoutingService','dataSourceService','notificationService','gridCrudService','getLocalCalendar','getLocalDayMonth','getMonthIndex','getStringLineService','executeCliCmdService',
	function($scope,$rootScope,$interval,dialogService,$filter,$timeout,validationService,requestRoutingService,dataSourceService,notificationService,gridCrudService,getLocalCalendar,getLocalDayMonth,getMonthIndex,getStringLineService,executeCliCmdService ) {
		var translate = $filter("translate");
		$scope.transferDataSource=[];
		$scope.fileDataSource=[];
		$scope.transferDataSource = dataSourceService.transferDataSource();
		$scope.fileDataSource = dataSourceService.fileDataSource();
		// System Time Configuration
		$scope.currentdate = "";
		$scope.disableApplyButton = true;
    $scope.disableClearApplyButton = true;
    $scope.disableClearCancelButton = true;
		$scope.displayHostnameType = false;
		$scope.timeZoneNameOptions = dataSourceService.timeZoneNameOptions();
		$scope.offsetHoursDataSource = dataSourceService.offsetHoursDataSource();
		$scope.offsetMinutesDataSource = dataSourceService.offsetMinutesDataSource();
		$scope.systemModel = {
			setDate: '',
			setTime: '',
			settimezoneName: null,
			setOffsetHours:null,
			setOffsetMinutes:null
		};
		$scope.loadSystemTimeOptions = function(){
			$timeout(function(){
				$scope.disableApplyButton = true;
				$scope.disableCancelButton = true;
				$scope.loadCommonRunData();
        $scope.loadCommonGlobalData();
			}, 1000);
		};
		$scope.showNtp="";
		(function () {
			// Clear setInterval if already present
			if($rootScope.clockFetchLoop){
				$interval.cancel($rootScope.clockFetchLoop);
			}
	   //Refresh the Clock for every 60 seconds
		$rootScope.clockFetchLoop = $interval(function(){
			if(angular.element(".sysClockContent").length > 0){
				$scope.loadGridData();
			} else {
				$interval.cancel($rootScope.clockFetchLoop);
			}
		}, 30000);
		}());
		var todayDate = new Date();
		var deviceCurrentDate="";
		$scope.loadGridData = function () {
			var systemCLI="show clock\n show ntp status\n";
			var systemCLIOP = deviceCommunicatorCLI.getExecCmdOutput(systemCLI);
			var showTIME = systemCLIOP[0];
			var showTimeSource = systemCLIOP[1];
			$scope.showNtp = showTimeSource;
			// converting the device date to ISO 8601 format
			var getTime = showTIME.split(" ");
            var newArr = getTime[1]+" "+getTime[2]+" "+getTime[3]+" "+getTime[4]+" "+getTime[5];
            var time = getTime[0];
            var timeVal = time.split(".")[0];
            $scope.timeval = timeVal;
			showTIME = newArr;
			$scope.currentdate = showTIME;
			$scope.setDate = $scope.dateValue;
			var splitCurrentData = $scope.currentdate.split(" ");
			var splitDate = splitCurrentData[2]+" "+splitCurrentData[3]+" "+splitCurrentData[4];
			$scope.setDate = splitDate;
			deviceCurrentDate=$scope.setDate;
			var splitTime = splitCurrentData[0];
			$scope.setTime = splitTime;
			todayDate = $filter('date')(new Date(splitDate),'yyyy-MM-dd');
			$scope.timesource = showTimeSource;
			var splitCurremtData = $scope.timesource.split("\n");
			var temp = {};
			temp.timesourceName = "None";
			$scope.timesource = "NTP";
			if (splitCurremtData[0].indexOf("Clock is synchronized") > -1) {
				var splitVrf = splitCurremtData[0].split("Clock is synchronized ");
				temp.timesourceName = splitVrf[0];
				if(temp.timesourceName.indexOf("Clock is synchronized")>-1)	{
					$scope.timesource = "NTP";
				}else{
					$scope.timesource = translate('system_time_local');
				}
			}else{
                $scope.timesource = ": " +translate('system_time_local');
			}
			var cultureName = "";
			$timeout(function(){
				if(navigator.language.indexOf("zh") != -1 || $rootScope.preferredLanguage == "zh"){
					cultureName = kendo.culture("zh");
				}
				else if(navigator.language.indexOf("ko") != -1 || $rootScope.preferredLanguage == "ko"){
					cultureName = kendo.culture("ko");
					kendo.calendar.views[0].title = function(date) {
						var culture = kendo.culture();
						var month = culture.calendar.months.names[date.getMonth()];
						var year = date.getFullYear();
						var title = year + "년 " + month;
						return title;
					 };
				}
				else if(navigator.language.indexOf("ja") != -1 || $rootScope.preferredLanguage == "ja"){
					cultureName = kendo.culture("ja");
				}
				angular.element("#date").kendoDatePicker({
					value: todayDate, //setting current date as default date
					format: "yyyy-MM-dd",
					change: function() {
						$timeout(function(){$scope.disableApplyButton = false;});
					},
					culture: cultureName
				});
			},500);

			angular.element("#time").kendoTimePicker({
				value: "00:00:00", //setting default time
				format: "HH:mm:ss",
				change: function() {
					$timeout(function(){$scope.disableApplyButton = false;});
				}
			});
			angular.element('input').removeAttr('style');
		};
		$scope.SwitchTypeOnChange = function(nTrans,otrans){
			if(nTrans =="To_Switch"){
				if(otrans =="tftp"){
					angular.element("input[type='file']").val(null);
				}if(otrans =="local_hard_drive"){
					$scope.ipaddress="";
					$scope.fileName = "";
				}
			}
			if(nTrans =="From_Switch"){
				if(otrans =="tftp"){
					angular.element("input[type='file']").val(null);
				}if(otrans =="local_hard_drive"){
					$scope.ipaddress="";
					angular.element("input[type='file']").val(null);
				}
			}

		};
		$scope.loadCommonRunData = function () {
			var systemCLI="show clock\n show running-config partition common\n";
			var systemCLIOP = deviceCommunicatorCLI.getExecCmdOutput(systemCLI);
			$timeout(function(){
				var clockTimeZone = getStringLineService.getLines(systemCLIOP[1],["clock timezone"]);
				if(clockTimeZone.length>0){
					var showRunCommon =clockTimeZone[0].split(" ");
					$scope.systemModel.settimezoneName = showRunCommon[2];
					$scope.systemModel.setOffsetHours =  showRunCommon[3];
					$scope.systemModel.setOffsetMinutes= showRunCommon[4];
				}else{
					$scope.systemModel.settimezoneName = "UTC";
					$scope.systemModel.setOffsetHours = "-23";
					$scope.systemModel.setOffsetMinutes = "0";
				}
				//DST time option
				var dstTimeZone = getStringLineService.getLines(systemCLIOP[1],["clock summer-time"]);
				if(dstTimeZone.length>0){
					$scope.systemDSTStatus=translate('com_enable');
				}else{
					$scope.systemDSTStatus=translate('com_disable');
				}
			}, 1000);
		}
		$scope.loadGridData();
		$scope.loadCommonRunData();
		$scope.disableApplyButton = true;
		$scope.sysTab1 = true;
		$scope.sysTab2 = false;
		$scope.ntpTab1 = false;
		$scope.ntpTab2 = true;
		$scope.dhcpScopeTab1 = true;
		$scope.dhcpScopeTab2 = false;
		$scope.dhcpExcludTab1 = false;
		$scope.dhcpExcludTab2 = true;
		$scope.tabTog = function(name){
			if(name == "systemTime"){
				$scope.sysTab1 = !$scope.sysTab1;
				$scope.sysTab2 = !$scope.sysTab2;
			}else if(name == "ntpServer"){
				$scope.ntpTab1 = !$scope.ntpTab1;
				$scope.ntpTab2 = !$scope.ntpTab2;
			}else if(name == "dhcpScope"){
				$scope.dhcpScopeTab1 = !$scope.dhcpScopeTab1;
				$scope.dhcpScopeTab2 = !$scope.dhcpScopeTab2;
			}else if(name == "dhcpExcludScope"){
				$scope.dhcpExcludTab1 = !$scope.dhcpExcludTab1;
				$scope.dhcpExcludTab2 = !$scope.dhcpExcludTab2;
			}
		}
		$scope.apply_systemtime = function() {
			var generalsystemCLI = "";
			if($scope.systemModel["setOffsetMinutes"]!="0") {
				generalsystemCLI = "clock timezone " +$scope.systemModel["settimezoneName"] +" " +$scope.systemModel["setOffsetHours"]+" " +$scope.systemModel["setOffsetMinutes"] +"\n";
			}
			else {
				generalsystemCLI = "clock timezone " + $scope.systemModel["settimezoneName"] + " " + $scope.systemModel["setOffsetHours"] + "\n";
			}
			var datepicker = angular.element("#date").data("kendoDatePicker");
			var setDate = datepicker._oldText;
			setDate=$filter('date')(new Date(setDate), 'dd MMMM yyyy');
			var timepicker = angular.element("#time").data("kendoTimePicker");
			var setTime = timepicker._oldText;
			var latestDate=$filter('date')(new Date(setDate), 'MMM dd yyyy');
			if(deviceCurrentDate!=latestDate || setTime!="00:00:00"){
				generalsystemCLI += "do-exec clock set "+setTime+" "+setDate+"\n";
			}
			if ($scope.systemDSTStatus == translate('com_enable')){
				generalsystemCLI += "clock summer-time "+$scope.systemModel["settimezoneName"]+" recurring \n";
			} else {
				generalsystemCLI += "no clock summer-time "+$scope.systemModel["settimezoneName"]+" recurring \n";
			}
			var result = requestRoutingService.getConfigCmdOutput(generalsystemCLI);
			if(result==""){
				notificationService.showNotification(translate('system_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
			$scope.cancel();
		};
		$scope.clearThreshold = function (interruptRisingThreshold,interruptRisingInterval,interruptFallingThreshold,interruptFallingInterval) {
			if(interruptRisingThreshold !=''){
				$scope.interruptRisingThresholdClear = interruptRisingThreshold;
				$scope.interruptRisingIntervalClear = interruptRisingInterval;
				$scope.interruptFallingThresholdClear = interruptFallingThreshold;
				$scope.interruptFallingIntervalClear = interruptFallingInterval;
				$scope.threshold.interruptRisingThreshold = "";
				$scope.threshold.interruptRisingInterval = "";
				$scope.threshold.interruptFallingThreshold = "";
				$scope.threshold.interruptFallingInterval = "";
			}
		}
		$scope.clearThreshold1 = function (processRisingThreshold,interruptRisingInterval,processFallingThreshold,processFallingInterval) {
			if(interruptRisingThreshold !=''){
				$scope.processRisingThresholdClear = processRisingThreshold;
				$scope.processRisingIntervalClear = processRisingInterval;
				$scope.processFallingThresholdClear = processFallingThreshold;
				$scope.processFallingIntervalClear = processFallingInterval;
				$scope.threshold.processRisingThreshold = "";
				$scope.threshold.processRisingInterval = "";
				$scope.threshold.processFallingThreshold = "";
				$scope.threshold.processFallingInterval = "";
			}
		}
		$scope.clearThreshold2 = function (totalRisingThreshold,totalRisingInterval,interruptFallingThreshold,interruptFallingInterval) {
			if(interruptRisingThreshold !=''){
				$scope.totalRisingThresholdClear = totalRisingThreshold;
				$scope.totalRisingIntervalClear = totalRisingInterval;
				$scope.totalFallingThresholdClear = totalFallingThreshold;
				$scope.totalFallingIntervalClear = totalFallingInterval;
				$scope.threshold.totalRisingThreshold = "";
				$scope.threshold.totalRisingInterval = "";
				$scope.threshold.totalFallingThreshold = "";
				$scope.threshold.totalFallingInterval = "";
			}
		}
		$scope.cancel = function () {
    		$scope.loadGridData();
			$scope.loadCommonRunData();
			$scope.disableApplyButton = true;
			$scope.disableCancelButton = true;
		};
		// NTP Server Configuration
		var trimVal=$filter('trimValue');
		function ntpServerLoad(){
				var vlanOptions=[];
				var interfaceOptions=[];
				var vrfOptions=[];
				$scope.validateHostNameMsg='';
				var ntpList = requestRoutingService.getShowCmdOutput("show ntp config","showNtpConfig");
				if(ntpList.ShowNtp.entry){
					ntpList=ntpList.ShowNtp.entry;
				}
				else {
					ntpList=ntpList.ShowNtp;
				}
				if (typeof ntpList == "object" && !ntpList.length){
					ntpList = [ntpList];
				}
				var ntpGridDataList=[];
				var ntpStatusTemp = $scope.showNtp;
				for(var i=0;i<ntpList.length;i++){
					var sourceAdress='';
					var hostName='';
					if(ntpList[i].hostName){
						if(ntpList[i].hostName=="ip"){
							hostName=ntpList[i].hostNameIP;
							if(ntpList[i].IPInterface){
								sourceAdress=ntpList[i].IPInterface;
							}
							else {
								sourceAdress="None"
							}
						}
						else if(ntpList[i].hostName=="ipv6"){
							hostName=ntpList[i].hostNameIPv6;
							if(ntpList[i].IPv6Interface){
								sourceAdress=ntpList[i].IPv6Interface;
							}
							else {
								sourceAdress="None"
							}
						} else {
							hostName=ntpList[i].hostName;
							if(ntpList[i].hostNameIP2){
								sourceAdress=ntpList[i].hostNameIP2;
							}
							else if(ntpList[i].hostNameIP){
								sourceAdress=ntpList[i].hostNameIP;
							}
							else {
								sourceAdress="None"
							}
						}
						if(ntpStatusTemp.indexOf("Clock is unsynchronized") > -1){
							ntpStatusTemp="Unsynchronized"
						}
						else {
							ntpStatusTemp="Synchronized"
						}
							var sourceAdd;
							if(sourceAdress.indexOf("GigabitEthernet")!=-1){
								sourceAdd = sourceAdress.replace("GigabitEthernet","Gi");
							}else if(sourceAdress.indexOf("FastEthernet")!=-1){
								sourceAdd = sourceAdress.replace("FastEthernet","Fa");
							}else if(sourceAdress.indexOf("TenGigabitEthernet")!=-1){
								sourceAdd = sourceAdress.replace("TenGigabitEthernet","Te");
							}else{
								sourceAdd = sourceAdress;
							}
						ntpGridDataList.push({
							"HostName": hostName,
							"VRFName": "None",
							"SourceAddress": sourceAdd, //sourceAdress.replace("GigabitEthernet","Gi"),
							"Status": ntpStatusTemp});
					}
				}
				$scope.ntpData=new kendo.data.ObservableArray(ntpGridDataList);
                //sending all the required CLIs
				var ntpShowCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show ip interface brief\n show interface status\n");
				//Setting the interface(vlan) list which starts with index vlan
				var showVlanBrList=[];
				var arrVlan=ntpShowCLIOP[0].split("\n");
				for (var i=1; i < arrVlan.length; i++) {
					var portsObj = {};
					if(arrVlan[i].substring(0,22).trim().indexOf("Vlan")!=-1){
						portsObj["Interface"] = arrVlan[i].substring(0,22).trim();
						showVlanBrList.push(portsObj)
					}
				}
				for(var iCountr=0;iCountr<showVlanBrList.length;iCountr++){
					vlanOptions.push({
						"ntpVlanText": showVlanBrList[iCountr].Interface,
						"ntpVlanValue": showVlanBrList[iCountr].Interface
					});
				}
				//Setting the interface list
				var interfaceStatusInfo =[];
			    var arrInterface=ntpShowCLIOP[1].split("\n");
				for (var i=1; i < arrInterface.length; i++) {
					var portsObj = {};
					portsObj["Port"] = arrInterface[i].substring(0,8).trim();
    			    interfaceStatusInfo.push(portsObj)
				}
				for(var iCount=0;iCount<interfaceStatusInfo.length;iCount++){
					interfaceOptions.push({
						"ntpInterfaceText": interfaceStatusInfo[iCount].Port,
						"ntpInterfaceValue": interfaceStatusInfo[iCount].Port
					});
				}
				vrfOptions.push({
					"ntpVRFNameText": "Mgmt-vrf",
					"ntpVRFNameValue": "Mgmt-vrf"
				});
				$scope.ntpVlan = null;
				$scope.ntpInterfaceOptions = null;
				$timeout(function () {
					$scope.ntpVlanDataSource=new kendo.data.ObservableArray(vlanOptions);
					$scope.ntpInterfaceDataSource=new kendo.data.ObservableArray(interfaceOptions);
					$scope.ntpVRFNameDataSource=new kendo.data.ObservableArray(vrfOptions);
				}, 1000);
				$scope.stpStackModeType = null;
				$scope.ntpHostNameRadio= translate('ntp_word');
				$scope.hostNamePlaceHolder=translate("ntp_host_placeholder");
				$scope.showVRF=true;
				$scope.vrfCheckbox=true;
				$scope.$watch('ntpHostNameRadio', function() {
					if($scope.ntpHostNameRadio==translate('ntp_word')){
						$scope.showVRF=true;
						$scope.hostNamePlaceHolder=translate("ntp_host_placeholder");
						$scope.ntpHostName='';
					}else{
						$scope.showVRF=false;
						$scope.hostNamePlaceHolder=translate("ntp_host_placeholderTxt");
						$scope.ntpHostName='';
					}
				});
				$scope.ntpVRF= false;
				$scope.showntpVRFName=false;
				$scope.showNtpSource=true;
				$scope.$watch('ntpVRF', function() {
					if($scope.ntpVRF){
						$scope.showntpVRFName=true;
						$scope.showNtpSource=false;
					}else{
						$scope.showntpVRFName=false;
						$scope.showNtpSource=true;

					}
				});
				$scope.ntpSource= translate('ntp_none');
				$scope.showVlan=true;
				$scope.showInterface=true;
				$scope.$watch('ntpSource', function() {
					if($scope.ntpSource==translate('menu_vlan')){
						$scope.showVlan=false;
						$scope.ntpVlan=$scope.ntpVlanDataSource[0].ntpVlanValue;
						$scope.showInterface=true;
						$scope.vrfCheckbox=true;
					}else if($scope.ntpSource==translate('portconfig_general_interface')){
						$scope.showVlan=true;
						$scope.showInterface=false;
						$scope.ntpInterfaceOptions=$scope.ntpInterfaceDataSource[0].ntpInterfaceValue;
						$scope.vrfCheckbox=true;
					}else{
						$scope.showVlan=true;
						$scope.showInterface=true;
						$scope.vrfCheckbox=true;
					}
				});
				//form validate
				function checkValidateIP(ip){
					//Check Format
					var ip = ip.split(".");
					if(ip.length != 4){
						return false;
					}
					//Check Numbers
					for(var c = 0; c < 4; c++){
						if( !(1/ip[c] > 0) ||
									ip[c] > 255 ||
									isNaN(parseFloat(ip[c])) ||
									!isFinite(ip[c])  ||
									ip[c].indexOf(" ") !== -1){
									return false;
						}
					}
					//Invalidate addresses that start with 192.168
					if( ip[0] == 192 && ip[1] == 168 ){
						return false;
					}
					return true;
				}
				var ntpFormValidate = $("#ntpForm").kendoValidator({
					rules: {
						duplicate:function(input){
							var valMsg = input.data('duplicateMsg');
							if ((valMsg==undefined)) {
								return true;
							}
							if(!$scope.ntpDirty){
								return true;
							}
							var ntpGrid = $("#ntpGrid").data("kendoGrid");
							var ntpData = ntpGrid.dataSource.data();
							for(i=0;i<ntpData.length;i++){
								if(trimVal(input.val())== trimVal(ntpData[i].HostName)){
									return false;
								}
							}
							return true;
						},
						checkhost:function(input) {
							var valMsg = input.data('checkhostMsg');
							if ((valMsg == undefined)) {
								return true;
							}
							if ( !isNaN(parseInt(input.val())) ){
								return checkValidateIP(input.val());
							}
							return true;
						}
					}
				}).data("kendoValidator")
				var ntpEditData={
					HostName: "",
					VRFName: "",
					SourceAddress: "",
					Status: ""
				};
				$scope.ntpEditData = angular.copy(ntpEditData);
				$scope.ntpDirty="";
				$scope.ntpDelBtn=true;
				$scope.disNtpApplyBtn=true;
				var ntpConfigCLI="";
				$scope.newData=[];
				// Edit NTP
				var showNtpEdit = function(){
                     $scope.ntpHostname = true;
					$scope.kendoWindow.isEditMode = false;
					$("#ntpForm  span.k-tooltip-validation").hide();
					var selected = this.dataItem(this.select());
					$scope.ntpHostName=selected.HostName;
					$timeout(function(){$scope.ntpShowEditSection = true});
					for(var i=0;i<ntpList.length;i++) {
						if (ntpList[i].hostName) {
							if (ntpList[i].hostName == "ip") {
								if (selected.HostName == ntpList[i].hostNameIP){
									$scope.ntpHostNameRadio = translate('clients_ip');
								}
							}
							else if (ntpList[i].hostName == "ipv6") {
								if (selected.HostName == ntpList[i].hostNameIPv6){
									$scope.ntpHostNameRadio = translate('portconfig_adv_ipv6label');
								}
							}
							else {
								$scope.ntpHostNameRadio = translate('ntp_word');
							}
						}
					}
					for(var j=0;j<$scope.newData.length;j++) {
						if($scope.newData[j].HostName==selected.HostName)
							{
								if($scope.newData[j].hostType=="IP"){
									$scope.ntpHostNameRadio = translate('clients_ip');
								}
								else if($scope.newData[j].hostType=="IPV6"){
									$scope.ntpHostNameRadio = translate('portconfig_adv_ipv6label');
								}
							}
					}
					if(selected.SourceAddress.indexOf("Gi") > -1 || selected.SourceAddress.indexOf("Fa") > -1 || selected.SourceAddress.indexOf("Te") > -1){
						$scope.ntpSource=translate('portconfig_general_interface');
					}
					else if(selected.SourceAddress.indexOf("Vlan") > -1){
						$scope.ntpSource=translate('menu_vlan');
					}else {
						$scope.ntpSource=translate('ntp_none');
					}
					$timeout(function(){
						$scope.ntpInterfaceOptions = selected.SourceAddress;
						$scope.ntpVlan=selected.SourceAddress;
					},100)
					$scope.ntpDirty=selected.dirty;
					$scope.ntpServerDiv.open().center();
					$scope.ntpDelBtn=true;
				};
				$scope.updateNtp = function(){
					$scope.saveNtpData();
				}
				//Save NTP
				$scope.saveNtpData = function() {
					var hostName='';
					var vrfName='';
					var sourceAddress='';
					var status='';
					if (ntpFormValidate.validate()) {
						if($scope.ntpHostNameRadio==translate('ntp_word') && $scope.ntpSource==translate('ntp_none') && !$scope.ntpVRF){
							hostName=$scope.ntpHostName;
							vrfName='None';
							sourceAddress='None';
							status='Unsynchronized';
							ntpConfigCLI += "ntp server " + hostName+"\n";

						}else if($scope.ntpHostNameRadio!=translate('ntp_word') && $scope.ntpSource==translate('ntp_none')){
							hostName=$scope.ntpHostName;
							vrfName='None';
							sourceAddress='None';
							status='Unsynchronized';
							if($scope.ntpHostNameRadio==translate('clients_ip')){
								$scope.newData.push({HostName:hostName,hostType:"IP"});
								ntpConfigCLI += "ntp server ip " + hostName+"\n";
							}else{
								ntpConfigCLI += "ntp server ipv6 " + hostName+"\n";
								$scope.newData.push({HostName:hostName,hostType:"IPV6"});
							}
						}else if($scope.ntpHostNameRadio==translate('ntp_word') && $scope.ntpVRF){
							hostName=$scope.ntpHostName;
							vrfName=$scope.ntpVRFName;
							sourceAddress='None';
							status='Unsynchronized';
						}else if($scope.ntpHostNameRadio==translate('ntp_word') && $scope.ntpSource==translate('menu_vlan')){
							hostName=$scope.ntpHostName;
							vrfName="None";
							sourceAddress=$scope.ntpVlan;
							status='Unsynchronized';
							if($scope.ntpVlan){
								ntpConfigCLI += "ntp server "+hostName+" source " + sourceAddress+"\n";
							}
							else {
								ntpConfigCLI += "ntp server "+hostName+"\n";
							}
						}else if($scope.ntpHostNameRadio==translate('ntp_word') && $scope.ntpSource==translate('portconfig_general_interface')){
							hostName=$scope.ntpHostName;
							vrfName="None";
							sourceAddress=$scope.ntpInterfaceOptions;
							status='Unsynchronized';
							if($scope.ntpInterfaceOptions){
								ntpConfigCLI += "ntp server "+hostName+" source " + sourceAddress+"\n";
							}
							else{
								ntpConfigCLI += "ntp server "+hostName+"\n";
							}
						}
						else if($scope.ntpHostNameRadio!=translate('ntp_word') && $scope.ntpSource==translate('menu_vlan')){
							hostName=$scope.ntpHostName;
							vrfName="None";
							sourceAddress=$scope.ntpVlan;
							status='Unsynchronized';
							if($scope.ntpVlan){
								if($scope.ntpHostNameRadio==translate('clients_ip')){
									$scope.newData.push({HostName:hostName,hostType:"IP"});
									ntpConfigCLI += "ntp server ip "+hostName+" source " + sourceAddress+"\n";
								}else{
									ntpConfigCLI += "ntp server ipv6 "+hostName+" source " + sourceAddress+"\n";
									$scope.newData.push({HostName:hostName,hostType:"IPV6"});
								}
							}else{
								if($scope.ntpHostNameRadio==translate('clients_ip')){
									ntpConfigCLI += "ntp server ip "+hostName+"\n";
									$scope.newData.push({HostName:hostName,hostType:"IP"});
								}else{
									ntpConfigCLI += "ntp server ipv6 "+hostName+"\n";
									$scope.newData.push({HostName:hostName,hostType:"IPV6"});
								}
							}
						}else if($scope.ntpHostNameRadio!=translate('ntp_word') && $scope.ntpSource==translate('portconfig_general_interface')){
							hostName=$scope.ntpHostName;
							vrfName="None";
							sourceAddress=$scope.ntpInterfaceOptions;
							status='Unsynchronized';
							if($scope.ntpInterfaceOptions){
								if($scope.ntpHostNameRadio==translate('clients_ip')){
									ntpConfigCLI += "ntp server ip "+hostName+" source " + sourceAddress+"\n";
									$scope.newData.push({HostName:hostName,hostType:"IP"});
								}else{
									ntpConfigCLI += "ntp server ipv6 "+hostName+" source " + sourceAddress+"\n";
									$scope.newData.push({HostName:hostName,hostType:"IPV6"});
								}
							}else{
								if($scope.ntpHostNameRadio==translate('clients_ip')){
									ntpConfigCLI += "ntp server ip "+hostName+"\n";
									$scope.newData.push({HostName:hostName,hostType:"IP"});
								}else{
									ntpConfigCLI += "ntp server ipv6 "+hostName+"\n";
									$scope.newData.push({HostName:hostName,hostType:"IPV6"});
								}
							}
						}
						if(sourceAddress==''){
							sourceAddress="None"
						}
						if (!$scope.ntpDirty) {
							var hostNameFlag=false;
							var selectedItem = $scope.ntpGrid.dataItem($scope.ntpGrid.select());
							for(var i=0;i<ntpList.length;i++) {
								if (ntpList[i].hostName) {
									if (ntpList[i].hostName == "ipv6") {
										if (selectedItem.HostName == ntpList[i].hostNameIPv6){
											hostNameFlag=true
										}
									}
								}
							}
							if(selectedItem.HostName!=hostName) {
								if (hostNameFlag) {
									ntpConfigCLI += "no ntp server ipv6 " + selectedItem.HostName + "\n";
								} else {
									ntpConfigCLI += "no ntp server " + selectedItem.HostName + "\n";
								}
							}
							selectedItem.HostName =hostName;
							selectedItem.VRFName = vrfName
							selectedItem.SourceAddress = sourceAddress
							selectedItem.Status = status

						} else {
							$scope.ntpGrid.dataSource.add({
								"HostName": hostName,
								"VRFName": vrfName,
								"SourceAddress": sourceAddress,
								"Status": status
							});
						}
						$scope.ntpApplyBtn();
						$scope.ntpShowEditSection = false;
						$scope.disNtpApplyBtn = false;
						$scope.ntpServerDiv.close();
					}
				}
				// Cancel NTP
				$scope.cancelNtpData=function(){
					$scope.ntpServerDiv.close();
					$scope.ntpShowEditSection = false;
					$scope.ntpVlan = null;
					$scope.ntpInterfaceOptions = null;
				};
				// Add NTP row
				$scope.addNtpRow = function(){
					$scope.kendoWindow.isEditMode = true;
					$scope.ntpServerDiv.open().center();
					$scope.ntpShowEditSection = true;
					$scope.ntpHostname = false;
					$scope.ntpDirty=true;
					$scope.ntpHostNameRadio= translate('ntp_word');
					$scope.hostNamePlaceHolder=translate("ntp_host_placeholder");
					$scope.showVRF=true;
					$scope.vrfCheckbox=true;
					$scope.ntpVRF= false;
					$scope.showntpVRFName=false;
					$scope.showNtpSource=true;
					$scope.ntpSource= translate('ntp_none');
					$scope.showVlan=true;
					$scope.showInterface=true;
					$scope.ntpHostName='';
					$("#ntpForm  span.k-tooltip-validation").hide();
				};
				$scope.ntpApplyBtn=function(){
					$("#ntpForm  span.k-tooltip-validation").hide();
					var result = requestRoutingService.getConfigCmdOutput(ntpConfigCLI);
					if(result==""){
						notificationService.showNotification(translate('ntp_success_msg'),translate('com_config_success_title'),'success');
					}else{
						notificationService.showNotification(result,translate('com_config_fail_title'),'error');
					}
					$scope.disNtpApplyBtn=true;
					ntpConfigCLI='';
				}
				$scope.gridDataSource = new kendo.data.DataSource({
					pageSize : 10,
					data : $scope.ntpData
				});
				//Push deleted items
				$scope.delNtpArray = [];
               $scope.isDeleteChecked = function(checked, dataItem) {
                if (checked == false) {
                    var index = $scope.delNtpArray.indexOf(dataItem);
                    if (index > -1) {
                        $scope.delNtpArray.splice(index, 1);
                    }
                } else {
                    $scope.delNtpArray.push(dataItem);
                }
                if ($scope.delNtpArray.length > 0) {
                    $scope.ntpDelBtn= false;
                }else {
                    $scope.ntpDelBtn= true;
                }
            };
            $scope.$on("okDelete", function() {
                $scope.dlg.data("kendoWindow").close();
                $scope.deleteNtpRow();
            });
			//Delete NTP Data.
            $scope.deleteNtpRow = function(){
                var selectedItem = $scope.delNtpArray;
                var hostNameFlag=false;
				for(var i=0;i<ntpList.length;i++) {
					if (ntpList[i].hostName && ntpList[i].hostName == "ipv6") {
						if (selectedItem.HostName == ntpList[i].hostNameIPv6){
							hostNameFlag=true;
						}
					}
				}
				$scope.delNtpArray = [];
				for(var i=0;i<selectedItem.length;i++){
					if (hostNameFlag) {
						ntpConfigCLI += "no ntp server ipv6 "+selectedItem[i].HostName+"\n";
					}else{
						ntpConfigCLI += "no ntp server "+selectedItem[i].HostName+"\n";
					}
					$scope.ntpGrid.dataSource.remove(selectedItem[i]);
				}
                $scope.ntpDelBtn=true;
                $scope.ntpApplyBtn();
			}
            $scope.$on("cancel", function() {
                $scope.dlg.data("kendoWindow").close();
            });
			//Confirmation Window For Delete NTP Data.
            $scope.openDeleteConfirmationWindow = function(){
                $scope.dlg = dialogService.dialog({
                    content : translate('ntp_delete_confirmation'),
                    title : translate('msg_delete_confirmation_window'),
                    messageType : "confirm",
                    actionButtons : [{
                        text : translate('com_ok'),
                        callback : "okDelete"
                    }, {
                        text : translate('com_cancel'),
                        callback : "cancel"
                    }]
                });
            };
				$scope.ntpGridOptions = {
					dataSource: $scope.gridDataSource,
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
					change	:showNtpEdit,
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
                        "template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isDeleteChecked(checked,dataItem)\"  />",
                        sortable : false,
                        width : 10
                    }, {
						field : "HostName",
						title : translate("portconfig_port_ipv4_host")
					}, {
						field : "SourceAddress",
						title : translate("ntp_source_address")
					}, {
						field : "Status",
						title : translate("com_status")
					}]
				};
		}
		
		
		/* Threshold Type Start */
		var thresholdConfigCLI="";
		var threshold={
				interruptRisingThreshold: null,
				interruptRisingInterval: null,
				interruptFallingThreshold: null,
				interruptFallingInterval: null,
				processRisingThreshold: null,
				processRisingInterval: null,
				processFallingThreshold: null,
				processFallingInterval: null,
				totalRisingThreshold: null,
				totalRisingInterval: null,
				totalFallingThreshold: null,
				totalFallingInterval: null
		};
		
		// Threshold Form validation
		var thresholdTypeValidations = angular.element("#thresholdTypeForm").kendoValidator({
			rules: {
				range: function (input) {
					if(input.val() != "" && !$scope.firstLoad){
						var count=0;
						var valMsg = input.data('rangeMsg');
						if ((valMsg==undefined)) {
							return true;
						}
						var min= trimVal(input.prop('min'));
						var max= trimVal(input.prop('max'));
						var arr = input.val().replace('-',',');
						arr= arr.split(',');
						for(var i=0;i<arr.length;i++){
							if(parseFloat(trimVal(arr[i]))>=min && parseFloat(trimVal(arr[i]))<=max) {
								count++;
							}
						}
						if(arr.length!=count){
							return false;
						}
						return true;
					}
					else {
						return true;
					}
				}
			}
		}).data("kendoValidator");
		
		
		$scope.onClickThresholdTab = function(){
			$scope.threshold = angular.copy(threshold);
			$scope.disableThresholdApplyButton = true;
			$scope.disableThresholdCancelButton = true;
			$scope.loadThresholdValues();			
		};
		
		$scope.validateThresholdApply = function(){
			$scope.disableThresholdApplyButton = false;
			$scope.disableThresholdCancelButton = false;
		}
		
		$scope.loadThresholdValues = function(){
			$scope.firstLoad = true;
			var thresholdCLIData = [],thresholdIntervalList = [],thresholdTypeList = [];
			thresholdCLIData = deviceCommunicatorCLI.getExecCmdOutput("show run | in process cpu threshold type \n");
			if(thresholdCLIData[0] != ''){
				thresholdTypeList = thresholdCLIData[0].split("process cpu threshold type ");
			}
			if(thresholdTypeList.length > 0){
				$scope.resetEnable = true;
				for(var i=0;i<thresholdTypeList.length;i++){
					if(thresholdTypeList[i].indexOf("interrupt ") != -1){
						$scope.threshold.interruptRisingThreshold = executeCliCmdService.getNextString(thresholdTypeList[i], ["rising "], [" "]).trim();
						$scope.threshold.interruptFallingThreshold = executeCliCmdService.getNextString(thresholdTypeList[i], ["falling "], [" "]).trim();
						thresholdIntervalList = [];
						thresholdIntervalList = thresholdTypeList[i].split("interval ");
						if(thresholdIntervalList.length > 1){
							$scope.threshold.interruptRisingInterval = executeCliCmdService.getNextString(thresholdIntervalList[1], [""], [" "]).trim();
							$scope.threshold.interruptFallingInterval = executeCliCmdService.getNextString(thresholdIntervalList[2], [""], ["\n"]).trim();
						}
					}
					if(thresholdTypeList[i].indexOf("process ") != -1){
						$scope.threshold.processRisingThreshold = executeCliCmdService.getNextString(thresholdTypeList[i], ["rising "], [" "]).trim();
						$scope.threshold.processFallingThreshold = executeCliCmdService.getNextString(thresholdTypeList[i], ["falling "], [" "]).trim();
						thresholdIntervalList = [];
						thresholdIntervalList = thresholdTypeList[i].split("interval ");
						if(thresholdIntervalList.length > 1){
							$scope.threshold.processRisingInterval = executeCliCmdService.getNextString(thresholdIntervalList[1], [""], [" "]).trim();
							$scope.threshold.processFallingInterval = executeCliCmdService.getNextString(thresholdIntervalList[2], [""], ["\n"]).trim();
						}
					}
					if(thresholdTypeList[i].indexOf("total ") != -1){
						$scope.threshold.totalRisingThreshold = executeCliCmdService.getNextString(thresholdTypeList[i], ["rising "], [" "]).trim();
						$scope.threshold.totalFallingThreshold = executeCliCmdService.getNextString(thresholdTypeList[i], ["falling "], [" "]).trim();
						thresholdIntervalList = [];
						thresholdIntervalList = thresholdTypeList[i].split("interval ");
						if(thresholdIntervalList.length > 1){
							$scope.threshold.totalRisingInterval = executeCliCmdService.getNextString(thresholdIntervalList[1], [""], [" "]).trim();
							$scope.threshold.totalFallingInterval = executeCliCmdService.getNextString(thresholdIntervalList[2], [""], ["\n"]).trim();
						}
					}
				}
				
			}
			$scope.firstLoad=false;
		}
		
		$scope.applyThreshold = function(){
			$scope.firstLoad = false;
			if(thresholdTypeValidations.validate()){
				thresholdConfigCLI += "process cpu threshold type interrupt rising "+$scope.threshold.interruptRisingThreshold+" interval "+$scope.threshold.interruptRisingInterval+
						              " falling "+$scope.threshold.interruptFallingThreshold+" interval "+$scope.threshold.interruptFallingInterval+" \n";
				thresholdConfigCLI += "process cpu threshold type process rising "+$scope.threshold.processRisingThreshold+" interval "+$scope.threshold.processRisingInterval+
						              " falling "+$scope.threshold.processFallingThreshold+" interval "+$scope.threshold.processFallingInterval+" \n";
				thresholdConfigCLI += "process cpu threshold type total rising "+$scope.threshold.totalRisingThreshold+" interval "+$scope.threshold.totalRisingInterval+
	                                  " falling "+$scope.threshold.totalFallingThreshold+" interval "+$scope.threshold.totalFallingInterval+" \n";
				$scope.applyThresholdCLI();
			}
		}
		
		$scope.cancelThreshold = function(){
			$scope.threshold = angular.copy(threshold);
			angular.element("#thresholdTypeForm  span.k-tooltip-validation").hide();
			$scope.disableThresholdApplyButton = true;
			$scope.disableThresholdCancelButton = true;
			$scope.loadThresholdValues();
		}
		$scope.resetThreshold = function(){
			
			thresholdConfigCLI += "no process cpu threshold type interrupt rising "+$scope.threshold.interruptRisingThreshold+" interval "+$scope.threshold.interruptRisingInterval+
						              " falling "+$scope.threshold.interruptFallingThreshold+" interval "+$scope.threshold.interruptFallingInterval+" \n";
				thresholdConfigCLI += "no process cpu threshold type process rising "+$scope.threshold.processRisingThreshold+" interval "+$scope.threshold.processRisingInterval+
						              " falling "+$scope.threshold.processFallingThreshold+" interval "+$scope.threshold.processFallingInterval+" \n";
				thresholdConfigCLI += "no process cpu threshold type total rising "+$scope.threshold.totalRisingThreshold+" interval "+$scope.threshold.totalRisingInterval+
	                                  " falling "+$scope.threshold.totalFallingThreshold+" interval "+$scope.threshold.totalFallingInterval+" \n";
			$scope.applyThresholdCLI();				
			$scope.threshold = angular.copy(threshold);
			angular.element("#thresholdTypeForm  span.k-tooltip-validation").hide();
			$scope.loadThresholdValues();
			$scope.resetEnable = false;
		}
		
		$scope.applyThresholdCLI=function(){
			var result = requestRoutingService.getConfigCmdOutput(thresholdConfigCLI);
			if(result==""){
				notificationService.showNotification('Threshold Data is successfully Applied',translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
			thresholdConfigCLI="";
			$scope.disableThresholdApplyButton = true;
			$scope.disableThresholdCancelButton = true;
			$scope.loadThresholdValues();
		}
		/* Threshold Type End */
		
	//Config File Import & Export
				$scope.configFileValidations = {
					rules: {
						validateip : function(input) {
							if (angular.isUndefined(input.data('validateIp'))) {
								return true;
							}
							if (validationService.validateIPAddress(input)) {
								return true;
							}else {
								return false;
							}
						}
					}
				}
		$scope.startupbkpfilename = "startup.cfg.bkp";
		var protocolLocal = null;
		var devicetype = $rootScope.deviceInfo.type;
		$scope.disableTransfer = true;
		$scope.defaultfilename = devicetype+"_config";
		$timeout(function(){
		$scope.transferType = "To_Switch";
		$scope.protocol = "tftp";
		},100);
		$scope.clear=function(){
			$scope.fileName="";
			$scope.ipaddress="";
			uploadFile.value="";
			$scope.disableTransfer = true;
		}
		$scope.transfer = function(evt) {
			 $scope.evt=evt.target;
		 	if(($scope.transferType == "From_Switch") && ($scope.protocol == "local_hard_drive")){
		 		angular.element("body").addClass("busy");
		 		$timeout(function(){
		 		protocolLocal="local_hard_drive";
				$scope.exportFile();
				angular.element("body.busy").removeClass("busy");
		 		},400);
			}else if(($scope.transferType == "To_Switch") && ($scope.protocol == "local_hard_drive")){
		 		protocolLocal="local_hard_drive";
				$scope.toSubmit();
			} else if(($scope.transferType == "From_Switch") && ($scope.protocol == "tftp")){
				angular.element("body").addClass("busy");
				$timeout(function(){
		 		protocolLocal="tftp";
				$scope.fromSwitchtotftp();
				angular.element("body.busy").removeClass("busy");
				},400);
			} else if (($scope.transferType == "To_Switch") && ($scope.protocol == "tftp")) {
		 		protocolLocal="tftp";
				$scope.toSwitchfromtftp();
			}
		};
		 $scope.exportFile = function() {
			    var fileText = requestRoutingService.getShowCmdOutput("show running-config");
			    $scope.portsFileName = $scope.fileName;
			    $scope.saveTextAsFile(fileText, $scope.portsFileName);
			    $scope.clear();
		 };
		$scope.fileSelected = function(file){
					if(file.value != ''){
						$scope.disableTransfer = false;
						$scope.$apply();
					}
				};
		$scope.fromSwitchtotftp = function() {
				var url = protocolLocal+"://"+$scope.ipaddress+"/"+$scope.fileName;
				var cliop = deviceCommunicator.getExecCmdOutput("copy running-config "+url);
				$timeout(function(){
				if(cliop.indexOf("bytes copied")>=0){
					$scope.showStatus(translate('config_file_transfer_success_msg'),false);
					$scope.clear();
				} else {
					$scope.showStatus(translate('config_file_transfer_failure_msg'),true);
				}
				},100);
		};
		 $scope.toSubmit = function() {
			 		$scope.showRestartConfirmDialog();
		  };
		$scope.toSwitchfromtftp = function() {
			$scope.showRestartConfirmDialog();
			};
		$scope.showRestartConfirmDialog = function(){
			$scope.dlg = dialogService.dialog({
				content : translate('software_update_restart_confirm') + "<br/>"+ "<div class=\"col-sm-12 col-sm-offset-1 webui-centerpanel-label\"><div class=\"col-sm-7 custom-checkbox\"><span class=\"label\">"+translate('config_file_restart_config_checkboxmsg')+"</span></div><div class=\"col-sm-2 custom-checkbox\"><input type=\"checkbox\" name=\"saveconfig\" id=\"saveconfig\" class=\"k-checkbox form-control\" ng-model=\"saveconfig\"><label class=\"k-checkbox-label\" for=\"saveconfig\"></label></div></div>" + "<br/>",
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

    $scope.afterFileUpload = function(restartChecked) {
      var cmd = "copy uploadFile/"+uploadFile.files[0].name+" startup-config";
      var startupchange = deviceCommunicator.getExecCmdOutput(cmd);
      if(restartChecked) {
          $timeout(function(){
            angular.element("body.busy").removeClass("busy");
            if(startupchange.indexOf("bytes copied")>=0){
              $scope.showStatus(translate('config_file_transfer_success_msg_autostart'),false);
              deviceCommunicator.getExecCmdOutput("delete /force flash:/uploadFile/"+uploadFile.files[0].name);
              requestRoutingService.getShowCmdOutput("reload\n");
            } else {
              $scope.showStatus(translate('config_file_transfer_failure_msg'),true);
            }
            $scope.clear();
          },100);
      } else {
          $timeout(function(){
            angular.element("body.busy").removeClass("busy");
            if(startupchange.indexOf("bytes copied")>=0){
              deviceCommunicator.getExecCmdOutput("delete /force flash:/uploadFile/"+uploadFile.files[0].name);
              $scope.showStatus(translate('config_file_transfer_success_msg_manualrestart'),false);
            } else {
              $scope.showStatus(translate('config_file_transfer_failure_msg'),true);
            }
            $scope.clear();
          },100);
      }
    };

    $scope.uploadFileFromLocalRequest = function(formToSubmit, restartChecked) {
      var csrfToken = "";
      var CMD_GET_CSRF = "";
      angular.element("body").addClass("busy");
      if ($(location) != undefined && $(location)[0] != undefined && $(location)[0] != "") {
          CMD_GET_CSRF = $(location)[0].origin + $(location)[0].pathname + "get_csrf";
      }
      if (CMD_GET_CSRF != "") {
          csrfToken = "";
          var xmlHttp = new XMLHttpRequest();
          // false for synchronous request
          xmlHttp.open("GET", CMD_GET_CSRF, false);
          xmlHttp.send(null);
          csrfToken = xmlHttp.responseText;
      }
  
      if (csrfToken.indexOf("404 Not Found") == -1) {
          $.ajaxSetup({ headers: { 'X-Csrf-Token': csrfToken } });
          $.ajax({
              // server script to process the upload
              url: formToSubmit.action,
              type: 'POST',
              data: new FormData($('form')[1]),
              cache: false,
              contentType: false,
              processData: false,
              error: function(data) {
                  console.log("File Upload failed!");
                  $scope.afterFileUpload(restartChecked)
              },
              success: function(data) {
                  console.log("File Upload successful!");
                  $scope.afterFileUpload(restartChecked)
              },
              // Custom XMLHttpRequest
              xhr: function() {
                  var myXhr = $.ajaxSettings.xhr();
                  if (myXhr && myXhr.upload) {
                      // For handling the progress of the upload
                      myXhr.upload.addEventListener('progress', function(e) {
                          console.log("loaded ", e.loaded, " total", e.total)
                      }, false);
                  }
                  return myXhr;
              }
          });
      } else {
        $scope.afterFileUpload(restartChecked)
      }
    };

		$scope.$on("restartSwitch", function() {
			$scope.dlg.data("kendoWindow").close();
			var restartChecked = false;
			restartChecked = angular.element("#saveconfig").is(":checked");
			if(protocolLocal!=null){
				if(protocolLocal=="tftp"){
					var input = $scope.fileName;
					var filename = input.substring(input.lastIndexOf("/")+1,input.length);
					var url = protocolLocal+"://"+$scope.ipaddress+"/"+$scope.fileName;
					var cli = "copy "+url+" flash://"+filename+" \n";
					deviceCommunicator.getExecCmdOutput("copy running-config startup-config");
					if(restartChecked){
						angular.element("body").addClass("busy");
						var bkpstatus = deviceCommunicator.getExecCmdOutput("copy startup-config flash://"+$scope.startupbkpfilename);
						var copystatus = deviceCommunicator.getExecCmdOutput(cli);
						$timeout(function(){
							if(copystatus.indexOf("bytes copied")>=0){
								deviceCommunicator.getExecCmdOutput("copy flash://"+filename+" startup-config");
								angular.element("body.busy").removeClass("busy");
								$scope.showStatus(translate('config_file_transfer_success_msg_autostart'),false);
								requestRoutingService.getShowCmdOutput("reload\n");
							} else {
								angular.element("body.busy").removeClass("busy");
								$scope.showStatus(translate('config_file_transfer_failure_msg'),true);
							}
							$scope.clear();
							},100);
					} else {
						angular.element("body").addClass("busy");
						var bkpstatus = deviceCommunicator.getExecCmdOutput("copy startup-config flash://"+$scope.startupbkpfilename);
						var copystatus = deviceCommunicator.getExecCmdOutput(cli);
						$timeout(function(){
							if(copystatus.indexOf("bytes copied")>=0){
								deviceCommunicator.getExecCmdOutput("copy flash://"+filename+" startup-config");
								angular.element("body.busy").removeClass("busy");
								$scope.showStatus(translate('config_file_transfer_success_msg_manualrestart'),false);
							} else {
								angular.element("body.busy").removeClass("busy");
								$scope.showStatus(translate('config_file_transfer_failure_msg'),true);
							}
							$scope.clear();
							},100);
					}
				} else if(protocolLocal=="local_hard_drive") {
					deviceCommunicator.getExecCmdOutput("copy running-config startup-config");
					var bkpstatus = deviceCommunicator.getExecCmdOutput("copy startup-config flash://"+$scope.startupbkpfilename);
					var result = requestRoutingService.getShowCmdOutput("mkdir flash:/uploadFile");
					var formToSubmit = document.getElementById("configFileForm");
					formToSubmit.action = "/archive+download-file+%2fhttp+uploadFile%0A";
					$scope.uploadFileFromLocalRequest(formToSubmit,restartChecked);
				}
			}
		});
		$scope.showStatus = function(msg,error){
			var type = error?"error":"info";
			 $scope.dlg = dialogService.dialog({
	                                content : msg,
	                                title : translate("config_file_transfer_status_notification"),
	                                messageType : type,
	                                actionButtons : [{
	                                        text : translate("com_ok")
	                                }]
	                        });
		};
        $scope.saveTextAsFile = function(data, filename){
            if(!data) {
                return;
            }
            if(!filename) {
				filename = $scope.defaultfilename;
			}
            var blob = new Blob([data], {type: 'text/plain'}),
                e    = document.createEvent('MouseEvents'),
                a    = document.createElement('a')
	    // FOR IE:
	      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
	          window.navigator.msSaveOrOpenBlob(blob, filename);
	      }
	      else{
	          var e = document.createEvent('MouseEvents'),
	              a = document.createElement('a');
	          a.download = filename;
	          a.href = window.URL.createObjectURL(blob);
	          a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
	          e.initEvent('click', true, false, window,
	              0, 0, 0, 0, 0, false, false, false, false, 0, null);
	          a.dispatchEvent(e);
	      }
    };
	/* dhcp start here */
	$scope.enableDhcpDeleteButton = true;
	$scope.disableDhcpCancelButton = true;
	$scope.disableDhcpExcludedCancelButton = true;
	$scope.selectedDhcpScope = "";
	$scope.disableDHCPOptionsDeleteButton = true;
	$scope.disableGlobalApplyButton = true;
	$scope.disableGlobalCancelButton = true;
  $scope.serviceDhcp = translate('com_enabled');
  $scope.dhcpRelayInfo = translate('com_disable');
	$scope.dhcpSmartRelayStatus = translate('com_disable');
	$scope.globalDhcpScope = {};
	$scope.refrwdingPolicy = null;
	$scope.deletedDhcp = [];
	$scope.deletedDhcpOptions = [];
	$scope.selectedDHCPOptionsArray = [];
	$scope.defaultRoutersData = [];
	$scope.dnsServersData = [];
	$scope.netBiosServersData = [];
	$scope.dnsDomainData = [];
	$scope.dhcpOptionsGridData = new kendo.data.ObservableArray([]);
	$scope.dnsGridData = new kendo.data.ObservableArray([]);
	$scope.checkOptionState = false;
	$scope.nodeType = null;
	$scope.dhcpScopeMaster = {
		dhcpScopeName : null,
    manualBinding : null,
    clientIdentifier : null,
		hostIp : null,
		hostSubnetIp : null,
		networkIp : null,
		subnetIp : null,
		lease : {
			leaseDays : null,
			leaseHours : null,
			leaseMinutes : null,
      infinite : null
		},
		routers : "",
		domain : null,
		dns : "",
		netbios : "",
		routerIp: null,
		dnsIp: null,
		netBiosIp: null,
    bootfile : null
	};
	$scope.dhcpScope = angular.copy($scope.dhcpScopeMaster);
	$scope.olddhcpGridData =  new kendo.data.ObservableArray([]);
	$scope.refrwdingPolicyOptions = dataSourceService.refrwdingPolicyOptions();
  $scope.nodeTypeOptions = dataSourceService.nodeTypeOptions();
        $scope.loadDhcpData = function(){
		$scope.dhcpGridData = new kendo.data.ObservableArray([]);
		var dhcpData = dhcpCliloaddata();
		var serverdhcpData = loadserverData();
		var dhcpDetails = mergeObj(dhcpData,serverdhcpData);
		if(!angular.isUndefined(dhcpDetails)){
			for(var i = 0; i < dhcpDetails.length; i++){
				dhcpDetails[i].iptype = "ipv4";
				$scope.dhcpGridData.push(dhcpDetails[i]);
			}
		}
		$scope.dhcpGridDataSource = new kendo.data.DataSource({
			pageSize : 20,
			data : $scope.dhcpGridData
		});
		$scope.olddhcpGridData = angular.copy($scope.dhcpGridData);
    $scope.disableGlobalApplyButton = true;
    $scope.disableGlobalCancelButton = true;
	};
	function mergeObj(obj, src) {
		if(!angular.isUndefined(obj)){
			for(var i = 0; i < obj.length; i++){
					for(var i1 in src[i]){
						obj[i][i1] = src[i][i1];
					}
			}
			return obj;
		}
	}
	var dhcpCliloaddata = function(){
		var serverldapdetail = requestRoutingService.getShowCmdOutput("show running-config ip dhcp pool", "dhcp");
		if(angular.isUndefined(serverldapdetail.ShowRunningconfigIpDhcpPool.wnwebdata.entry)){
			return undefined;
		}else if(!angular.isArray(serverldapdetail.ShowRunningconfigIpDhcpPool.wnwebdata.entry)){
			return [serverldapdetail.ShowRunningconfigIpDhcpPool.wnwebdata.entry];
		}
		return serverldapdetail.ShowRunningconfigIpDhcpPool.wnwebdata.entry;
	}
	var loadserverData = function(){
		var ServerData = [];
		var serverDetail = requestRoutingService.getShowCmdOutput("show running-config ip dhcp pool");
		var SpltCli = serverDetail.split("ip dhcp pool") ;
		for(var i = 1; i < SpltCli.length; i++){
			var spltServer = SpltCli[i].split("\n");
			var serverObj = {};
			for(var j = 0; j < spltServer.length; j++)
			{
				var str = spltServer[j];
				if(str.indexOf("default-router") != -1){
					var defaultRouter = extractIP(str);
					serverObj.routers = defaultRouter;
				}
				if(str.indexOf("dns-server") >= 0){
					var dnsServer = extractIP(str);
					serverObj.dns = dnsServer;
				}
				if(str.indexOf("netbios-name-server") >= 0){
					var netbiosName = extractIP(str);
					serverObj.netbios = netbiosName;
				}
				if(str.indexOf("netbios-node-type") >= 0){
					var nodeType = str.substring(18,25).trim();
					serverObj.nodeType = nodeType;
				}
				if(Object.keys(serverObj).length > 0){
					ServerData[i-1] = serverObj;
				}
			}
		}
		return ServerData;
	}
	var extractIP = function(str){
		var r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
		var ip = str.match(r).join(" ");
		return ip;
	}
	var oneTimeNtpServerLoad = true;
	var oneTimeDhcpLoad = true;
	var oneTimeDhcpexcludeLoad = true;
	$scope.loadSystemTab = function(curTab){
		if(curTab == "ntpServer" && oneTimeNtpServerLoad){
			oneTimeNtpServerLoad = false;
			ntpServerLoad();
		}
		if(curTab == "dhcp" && oneTimeDhcpLoad){
			oneTimeDhcpLoad = false;
			$scope.loadDhcpData();
		}
		if(curTab == "exclude" && oneTimeDhcpexcludeLoad){
			oneTimeDhcpexcludeLoad = false;
			$scope.loadExcludedAddress();
		}
	}
	$scope.dhcpGridOptions = {
		editable : false,
		sortable : true,
		resizable : true,
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
			buttonCount : 4
		},
		selectable : true,
		scrollable : true,
		columns : [{
			"template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isDhcpChecked(checked,dataItem)\"  />",
			sortable : false
		}, {
			field : "dhcpScopeName",
			title : translate("com_name")
		}, {
			field : "iptype",
			title : translate("staticrouting_ip_type")
		}]
	};
	$scope.apply_globalDhcp = function() {
        if (!globalConfigValidations.validate()) {
            return;
        }
		var globalDhcpCLI = "";
        if($scope.globalDhcpScope.hasOwnProperty("oldrefrwdingPolicy")){
            if($scope.globalDhcpScope.oldrefrwdingPolicy){
                globalDhcpCLI += "no ip dhcp relay information policy "+ $scope.globalDhcpScope.oldrefrwdingPolicy +"\n";
            }
            $scope.globalDhcpScope.oldrefrwdingPolicy = "";
        }
		if($scope.refrwdingPolicy != 'none' && $scope.refrwdingPolicy != ""){
            globalDhcpCLI += "ip dhcp relay information policy "+ $scope.refrwdingPolicy + "\n";
		}
        if($scope.globalDhcpScope.hasOwnProperty("oldPingPacketValue")){
            if($scope.globalDhcpScope.oldPingPacketValue){
                globalDhcpCLI += "no ip dhcp ping packets "+ $scope.globalDhcpScope.oldPingPacketValue +"\n";
            }
            $scope.globalDhcpScope.oldPingPacketValue = "";
        }
        if($scope.globalDhcpScope.pingPacketValue){
            globalDhcpCLI += "ip dhcp ping packets "+ $scope.globalDhcpScope.pingPacketValue + "\n";
        }
        if($scope.globalDhcpScope.hasOwnProperty("oldtimeOutValue")){
            if($scope.globalDhcpScope.oldtimeOutValue){
                globalDhcpCLI += "no ip dhcp ping timeout "+ $scope.globalDhcpScope.oldtimeOutValue +"\n";
            }
            $scope.globalDhcpScope.oldtimeOutValue = "";
        }
        if($scope.globalDhcpScope.timeOutValue) {
            globalDhcpCLI += "ip dhcp ping timeout " + $scope.globalDhcpScope.timeOutValue + "\n";
        }
        if($scope.dhcpSmartRelayStatus == "Enable"){
            globalDhcpCLI += "ip dhcp smart-relay \n";
        }
        else{
            globalDhcpCLI += "no ip dhcp smart-relay \n";
        }
        if($scope.serviceDhcp == "Enable"){
            globalDhcpCLI += "service dhcp \n";
        }
        else{
            globalDhcpCLI += "no service dhcp \n";
        }
        if($scope.dhcpRelayInfo == "Enable"){
            globalDhcpCLI += "ip dhcp relay information check \n";
        }
        else{
            globalDhcpCLI += "no ip dhcp relay information check \n";
        }
        if($scope.globalDhcpScope.hasOwnProperty("olddhcpDataBase") || $scope.globalDhcpScope.hasOwnProperty("olddataBaseTimeOut") || $scope.globalDhcpScope.hasOwnProperty("oldwriteDelayValue")){
            if($scope.globalDhcpScope.olddhcpDataBase != "" || $scope.globalDhcpScope.olddataBaseTimeOut != undefined){
                globalDhcpCLI += " no ip dhcp database  "+ $scope.globalDhcpScope.olddhcpDataBase + " timeout " + $scope.globalDhcpScope.olddataBaseTimeOut + "\n";
                $scope.globalDhcpScope.olddhcpDataBase = "";
                $scope.globalDhcpScope.olddataBaseTimeOut = "";
            } else if($scope.globalDhcpScope.olddhcpDataBase != "" || $scope.globalDhcpScope.oldwriteDelayValue != undefined) {
                globalDhcpCLI += " no ip dhcp database  "+ $scope.globalDhcpScope.olddhcpDataBase + " write-delay " + $scope.globalDhcpScope.oldwriteDelayValue + "\n";
                $scope.globalDhcpScope.olddhcpDataBase = "";
                $scope.globalDhcpScope.oldwriteDelayValue = "";
            } else if($scope.globalDhcpScope.olddhcpDataBase != "") {
                globalDhcpCLI += "no ip dhcp database   "+ $scope.globalDhcpScope.olddhcpDataBase + "\n";
                $scope.globalDhcpScope.olddhcpDataBase = "";
            }
        }
        if($scope.globalDhcpScope.dhcpDataBase){
            if($scope.globalDhcpScope.dataBaseTimeOut){
                globalDhcpCLI += "ip dhcp database  "+ $scope.globalDhcpScope.dhcpDataBase + " timeout " + $scope.globalDhcpScope.dataBaseTimeOut + "\n";
            } else if($scope.globalDhcpScope.writeDelayValue){
                globalDhcpCLI += "ip dhcp database  "+ $scope.globalDhcpScope.dhcpDataBase + " write-delay "  + $scope.globalDhcpScope.writeDelayValue + "\n";
            }else {
                globalDhcpCLI += "ip dhcp database  "+ $scope.globalDhcpScope.dhcpDataBase + "\n";
            }
        }
        var result = requestRoutingService.getConfigCmdOutput(globalDhcpCLI);
        if(result==""){
            notificationService.showNotification(translate('system_dhcpsuccess_msg'),translate('com_config_success_title'),'success');
        }else{
            notificationService.showNotification(result,translate('com_config_fail_title'),'error');
        }
        $scope.globalCancel();
	};
        $scope.apply_clearDhcp = function(){
            var clearDhcpCLI = "";
            if($scope.clearBinding){
                clearDhcpCLI += "clear ip dhcp binding * \n";
            }
            if($scope.clearConflict){
                clearDhcpCLI += "clear ip dhcp conflict * \n";
            }
            if($scope.clearServer){
                clearDhcpCLI += "clear ip dhcp server statistics \n";
            }
            var result = deviceCommunicatorCLI.getExecCmdOutput(clearDhcpCLI);
            if(result[0]=="" || result[1]=="" ||result[2]==""){
                notificationService.showNotification(translate('system_dhcpsuccess_msg'),translate('com_config_success_title'),'success');
            }else{
                notificationService.showNotification(result,translate('com_config_fail_title'),'error');
            }

            $scope.clearCancel();
        };
	$scope.globalCancel = function () {
        $scope.loadCommonGlobalData();
		$scope.disableGlobalApplyButton = true;
		$scope.disableGlobalCancelButton = true;
	};
        $scope.clearCancel = function () {
            $scope.clearWindow.close();
        };
        $scope.globalClear = function () {
            $scope.disableClearApplyButton = true;
            $scope.disableClearCancelButton = true;
            $scope.clearBinding= false;
            $scope.clearConflict =false;
            $scope.clearServer = false;
            $scope.clearWindow.open().center();
            $scope.oldclearBinding= $scope.clearBinding;
            $scope.oldclearConflict =$scope.clearConflict;
            $scope.oldclearServer = $scope.clearServer;
        };
        $scope.updateClearMode = function(){
        	if($scope.clearBinding != false || $scope.clearConflict != false || $scope.clearServer != false){
            $scope.disableClearApplyButton=  false;
            $scope.disableClearCancelButton= false;
        	} else {
                $scope.disableClearApplyButton=  true;
                $scope.disableClearCancelButton= true;
			}
		};
        $scope.updateglobalMode = function(){
            if($scope.globalDhcpScope.oldPingPacketValue != $scope.globalDhcpScope.pingPacketValue || $scope.globalDhcpScope.oldtimeOutValue != $scope.globalDhcpScope.timeOutValue || $scope.globalDhcpScope.olddhcpDataBase != $scope.globalDhcpScope.dhcpDataBase || $scope.globalDhcpScope.oldrefrwdingPolicy != $scope.refrwdingPolicy || $scope.globalDhcpScope.olddataBaseTimeOut != $scope.globalDhcpScope.dataBaseTimeOut || $scope.globalDhcpScope.oldwriteDelayValue != $scope.globalDhcpScope.writeDelayValue || $scope.oldDhcpSmartRelayStatus != $scope.dhcpSmartRelayStatus || $scope.oldDhcpRelayInfo != $scope.dhcpRelayInfo || $scope.oldServiceDhcp != $scope.serviceDhcp){
                $scope.disableGlobalApplyButton=  false;
                $scope.disableGlobalCancelButton= false;
            } else {
                $scope.disableGlobalApplyButton = true;
                $scope.disableGlobalCancelButton = true;
            }
            };
	$scope.loadCommonGlobalData = function () {
        var globalDhcpCLI = "show run partition common | i dhcp";
        var globalDhcpCLIOP = deviceCommunicatorCLI.getExecCmdOutput(globalDhcpCLI);
        var strLinesServiceDhcp = getStringLineService.getLines(globalDhcpCLIOP[0],["no service dhcp"]);
        var strLinesDhcpSmartRelay = getStringLineService.getLines(globalDhcpCLIOP[0],["ip dhcp smart-relay"]);
        var strLinesDhcpRelayInfo = getStringLineService.getLines(globalDhcpCLIOP[0],["no ip dhcp relay information check"]);
        var portsObj = {};
        portsObj.refrwdingPolicy=executeCliCmdService.getNextString(globalDhcpCLIOP[0],["ip dhcp relay information policy"],["\n"]).trim();
        portsObj.pingPacketValue=executeCliCmdService.getNextString(globalDhcpCLIOP[0],["ip dhcp ping packets"],["\n"]).trim();
        portsObj.timeOutValue=executeCliCmdService.getNextString(globalDhcpCLIOP[0],["ip dhcp ping timeout"],["\n"]).trim();
        portsObj.dhcpDataBase=executeCliCmdService.getNextString(globalDhcpCLIOP[0],["ip dhcp database"],["\n"]).trim();
        portsObj.writeDelayValue=executeCliCmdService.getNextString(globalDhcpCLIOP[0],["write-delay"],["\n"]).trim();
        if(strLinesDhcpSmartRelay.length>0){
            $scope.dhcpSmartRelayStatus = translate('com_enable');
		} else {
            $scope.dhcpSmartRelayStatus = translate('com_disable');
		}
        if(strLinesDhcpRelayInfo.length>0){
            $scope.dhcpRelayInfo = translate('com_disable');
        } else {
            $scope.dhcpRelayInfo = translate('com_enable');
        }
        if(strLinesServiceDhcp.length>0){
            $scope.serviceDhcp=translate('com_disable');
        }else{
            $scope.serviceDhcp=translate('com_enable');
        }
        if(portsObj.refrwdingPolicy == ""){
            $scope.refrwdingPolicy = "none";
		} else {
            $scope.refrwdingPolicy = portsObj.refrwdingPolicy;
		}
        var result = portsObj.dhcpDataBase.split(" ");
        $scope.globalDhcpScope.pingPacketValue = portsObj.pingPacketValue;
        $scope.globalDhcpScope.timeOutValue = portsObj.timeOutValue;
        $scope.globalDhcpScope.dhcpDataBase = result[0];
        if(result[1]=="timeout") {
            $scope.globalDhcpScope.dataBaseTimeOut = result[2];
        } else {
            $scope.globalDhcpScope.writeDelayValue = result[2];
        }
        $scope.globalDhcpScope.oldrefrwdingPolicy = $scope.refrwdingPolicy;
        $scope.globalDhcpScope.oldPingPacketValue = $scope.globalDhcpScope.pingPacketValue;
        $scope.globalDhcpScope.oldtimeOutValue = $scope.globalDhcpScope.timeOutValue;
        $scope.globalDhcpScope.olddhcpDataBase = $scope.globalDhcpScope.dhcpDataBase;
        $scope.globalDhcpScope.olddataBaseTimeOut = $scope.globalDhcpScope.dataBaseTimeOut;
        $scope.globalDhcpScope.oldwriteDelayValue = $scope.globalDhcpScope.writeDelayValue;
        $scope.oldDhcpSmartRelayStatus = $scope.dhcpSmartRelayStatus;
        $scope.oldDhcpRelayInfo = $scope.dhcpRelayInfo;
        $scope.oldServiceDhcp = $scope.serviceDhcp;
    };

	// Refresh button trigger
	angular.element("#dhcpGrid").delegate(".k-pager-refresh", "click", function(){
		$scope.enableDhcpDeleteButton = true;
        $scope.selectedArray = [];
        if (!$scope.$$phase){
			$scope.$apply();
        }
	});
	$scope.selectedArray = [];
	$scope.isDhcpChecked = function(checked, dataItem) {
		$scope.enableDhcpDeleteButton = false;
		if (checked === false) {
			var index = $scope.selectedArray.indexOf(dataItem);
			if (index > -1) {
				$scope.selectedArray.splice(index, 1);
			}
		} else {
			$scope.enableDhcpDeleteButton = false;
			$scope.selectedArray.push(dataItem);
		}
		if ($scope.selectedArray.length < 1) {
			$scope.enableDhcpDeleteButton = true;
		}
		$scope.showTab = !($scope.selectedArray.length > 1);
	};
	$scope.$on("deleteDHCP", function() {
		$scope.deleteDhcpScopes();
	});
	$scope.$on("cancelDelete", function() {
		$scope.deleteBtnFunction(false);
	});
	$scope.deleteDhcpScopes = function() {
			$scope.deletedDhcp = [];
			$scope.enableDhcpDeleteButton = true;
			$scope.disableDhcpCancelButton = false;
			for (var index = 0; index < $scope.selectedArray.length; index++) {
				$scope.dhcpGrid.dataSource.remove($scope.selectedArray[index]);
				var olddhcpGridIndex = $scope.olddhcpGridData.map(function(e) {
					return e.dhcpScopeName;
				}).indexOf($scope.selectedArray[index].dhcpScopeName);
				$scope.olddhcpGridData.splice(olddhcpGridIndex, 1);
				$scope.deletedDhcp.push($scope.selectedArray[index]);
			}
			$scope.selectedArray = [];
			$scope.resetDhcp();
			if($scope.deleteWindow.data("kendoWindow")) {
				$scope.deleteWindow.data("kendoWindow").close();
				$scope.dhcpApplyBtn();
			}
		};
		$scope.resetDhcp = function() {
			if ($scope.dhcpOptionsGridData) {
				while ($scope.dhcpOptionsGridData.length != 0) {
					$scope.dhcpOptionsGridData.pop();
				}
			}
			if ($scope.deletedDhcpOptions && $scope.deletedDhcpOptions.length > 0) {
				$scope.deletedDhcpOptions = [];
			}
			$scope.dhcpScope = angular.copy($scope.dhcpScopeMaster);
			$scope.defaultRoutersData = [];
			$scope.dnsServersData = [];
			$scope.netBiosServersData = [];
		};
        var globalConfigValidations = angular.element("#globalConfigForm").kendoValidator({
            rules : {
                range: function (input) {
                    if(input.val()){
                        if(input.val() != ""){
                            var count=0;
                            var valMsg = input.data('rangeMsg');
                            if ((valMsg==undefined)) {
                                return true;
                            }
                            var min= trimVal(input.prop('min'));
                            var max= trimVal(input.prop('max'));
                            var arr = input.val().replace('-',',');
                            arr= arr.split(',');
                            for(var i=0;i<arr.length;i++){
                                if(parseFloat(trimVal(arr[i]))>=min && parseFloat(trimVal(arr[i]))<=max) {
                                    count++;
                                }
                            }
                            if(arr.length!=count){
                                return false;
                            }
                            return true;
                        }
                        else {return true;}
                    }else{
                        return true;
                    }
                }
            }
		}).data("kendoValidator");
	var dhcpValidations = angular.element("#dhcpForm").kendoValidator({
		rules : {
			max : function(input) {
				var maxlength = input.data('max');
				if (maxlength) {
					return input.val().length < Number(maxlength);
				}
				return true;
			},
			min : function(input) {
				var minValue = input.data('min');
				if (minValue){
					return input.val().length > Number(minValue);
				}
				return true;
			},
			validateip : function(input) {
				if (input.val()){
					if (angular.isUndefined(input.data('validateIp'))) {
						return true;
					}if (validationService.validateIPAddress(input)) {
						return true;
					}
					else {
						return false;
					}
				}
				return true;
			},
			validatesubnet: function(input){
				if (input.val()){
					if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255"){
						return true;
					}
					else{
						return input.data('validatesubnetMsg') ? $scope.validateSubnetMask(input.val())  : true;
					}
				}
				return true;
			},
			range: function (input) {
				if(input.val()){
					if(input.val() != ""){
						var count=0;
						var valMsg = input.data('rangeMsg');
						if ((valMsg==undefined)) {
							return true;
						}
						var min= trimVal(input.prop('min'));
						var max= trimVal(input.prop('max'));
						var arr = input.val().replace('-',',');
						arr= arr.split(',');
						for(var i=0;i<arr.length;i++){
							if(parseFloat(trimVal(arr[i]))>=min && parseFloat(trimVal(arr[i]))<=max) {
								count++;
							}
						}
						if(arr.length!=count){
							return false;
						}
						return true;
					}
					else {return true;}
				}else{
					return true;
				}
			},
			check : function(input) {
				if (angular.isUndefined(input.data('checkMsg'))) {
					return true;
				}
				var val = input.val();
				if (val.indexOf("?") != -1 || val.indexOf(" ") != -1) {
					return false;
				}
				return true;
			},
      isvalidmacaddress: function(input) {
          if (angular.isUndefined(input.data('isvalidmacaddress'))) {
              return true;
          } else {
              var RegEx='';
              var str="";
              if(typeof input === 'string'){
                  str=input;
              }else{
                  str=input.val().trim();
              }
              if(str.indexOf(".")!=-1){
                  RegEx = /^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$/;
                  if (RegEx.test(str) || str== "") {
                      return true;
                  } else {
                      return false;
                  }
              }
          }
      },
      hexadecimal : function(input) {
          return input.data('hexadecimalMsg') ? validationService.validateHexaDecimalChars(input.val()) : true;
      },
			scopeduplicate : function(input) {
				if (angular.isUndefined(input.data('scopeduplicate'))){
					return true;
				}
				for (var index = 0; index < $scope.dhcpGridData.length; index++) {
					if ($scope.dhcpGridData[index].dhcpScopeName == $scope.dhcpScope.dhcpScopeName) {
						return false;
					}
				}
				return true;
			},
			domainname : function(input) {
				if (input.data('domainname-msg') && input.val() && input.val().trim() != ''){
					return input.data('domainname-msg') ? $scope.validateDomainName(input.val()) : true;
				}else{
					return true;
				}
			}
		}
	}).data("kendoValidator");
	$scope.validateDomainName = function(value) {
		if (value.indexOf('.') < 0){
			return false;
		}
		return true;
	};
	$scope.validateSubnetMask = function(value) {
		if(value == undefined){
			return false;
		} else {
			var subnetRegex = "^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$";
			if (new RegExp(subnetRegex).test(value)) {
				return true;
			}
		}
		return false;
	};
	$scope.enableDhcpDeleteButton = true;
	$scope.disableDhcpApplyButton = true;
	$scope.mode = "basic";
	$scope.kendoWindow = {isEditMode:true };
	$scope.addDhcpBtnFunction = function(value) {
		if (value) {
			$scope.createDhcpWindow.open().center();
			$scope.selectedMode = "basic";
			$scope.mode = "basic";
			$scope.kendoWindow.isEditMode = true;
			$scope.nodeType = 'none';
			$scope.dhcpScopename = false;
			$scope.disableDHCPOptionsDeleteButton = true;
			$scope.dhcpScope = angular.copy($scope.dhcpScopeMaster);
			$scope.defaultRoutersData = [];
			$scope.dnsServersData = [];
			$scope.netBiosServersData = [];
			$scope.dhcpOptionsGridData = new kendo.data.ObservableArray([]);
			$scope.updateDHCPOptionsGrid();
			$scope.dhcpOptionsGrid.refresh();
			$scope.checkOptionState = false;
			angular.element("#dhcpForm span.k-tooltip-validation").hide();
		}
	};
	$scope.cancelAddEditKendoWindow = function(){
		$scope.createDhcpWindow.close();
		$scope.dhcpOptionsGrid.refresh();
		$scope.checkOptionState = false;
		$scope.disableDHCPOptionsDeleteButton = true;
		$scope.selectedDHCPOptionsArray = [];
	};
	$scope.changeBasicAdvance = function() {
		if($scope.selectedMode == "basic"){
			$scope.mode = "basic";
		}else {
			$scope.mode = "advance";
		}
	};
	$scope.netBiosServersData = [];
	$scope.dnsServersData = [];
	$scope.defaultRoutersData = [];
	$scope.addDefaultRouters = function() {
		if($scope.dhcpScope.routerIp){
			if (!($scope.dhcpScope.routerIp.indexOf('?') === -1) || !($scope.dhcpScope.routerIp.indexOf(' ') === -1)) {
				return false;

			} else {
				for (var index = 0; index < $scope.defaultRoutersData.length; index++) {
					if ($scope.defaultRoutersData[index] == $scope.dhcpScope.routerIp) {
						return false;
					}
				}
			}
			if ($scope.dhcpScope.routerIp !== '') {
				if ($scope.defaultRoutersData.length == 8) {
					$scope.disabledAddDefaultRouter = true;
					return false;
				}
				$scope.defaultRoutersData.push($scope.dhcpScope.routerIp);
				$scope.dhcpScope.routerIp = '';
			}
		}
	};
	$scope.storeRemovedDefaultRouters = [];
	$scope.removeDefaultRouters = function() {
		$scope.storeRemovedDefaultRouters = [];
		while ($scope.dhcpScope.selectedRouters.length > 0) {
			var item = $scope.dhcpScope.selectedRouters.pop();
			var index = $scope.defaultRoutersData.indexOf(item);
			if (index != -1) {
				if($scope.defaultRoutersData.length === 1){
					$scope.storeRemovedDefaultRouters.push($scope.defaultRoutersData[index]);
				}
				$scope.defaultRoutersData.splice(index, 1);
			}
		}
		if ($scope.defaultRoutersData.length <= 8) {
			$scope.disabledAddDefaultRouter = false;
		}
	};
	$scope.addDNSServers = function() {
		if($scope.dhcpScope.dnsIp){
			if (!($scope.dhcpScope.dnsIp.indexOf('?') === -1) || !($scope.dhcpScope.dnsIp.indexOf(' ') === -1)) {
				return false;

			} else {
				for (var index = 0; index < $scope.dnsServersData.length; index++) {
					if ($scope.dnsServersData[index] == $scope.dhcpScope.dnsIp) {
						return false;
					}
				}
			}
			if ($scope.dhcpScope.dnsIp !== '') {
				if ($scope.dnsServersData.length == 8) {
					$scope.disabledAddDNSServer = true;
					return false;
				}
				$scope.dnsServersData.push($scope.dhcpScope.dnsIp);
				$scope.dhcpScope.dnsIp = '';
			}
		}
	};
	$scope.storeRemoveDNSServers = [];
	$scope.removeDNSServers = function() {
		$scope.storeRemoveDNSServers = [];
		while ($scope.dhcpScope.selectedDNS.length > 0) {
			var item = $scope.dhcpScope.selectedDNS.pop();
			var index = $scope.dnsServersData.indexOf(item);
			if (index != -1) {
				if($scope.dnsServersData.length === 1){
					$scope.storeRemoveDNSServers.push($scope.dnsServersData[index]);
				}
				$scope.dnsServersData.splice(index, 1);
			}
		}
		if ($scope.dnsServersData.length <= 8) {
			$scope.disabledAddDNSServer = false;
		}
	};
	$scope.addNetBiosServers = function() {
		if($scope.dhcpScope.netBiosIp){
			if (!($scope.dhcpScope.netBiosIp.indexOf('?') === -1) || !($scope.dhcpScope.netBiosIp.indexOf(' ') === -1)) {
				return false;

			} else {
				for (var index = 0; index < $scope.netBiosServersData.length; index++) {
					if ($scope.netBiosServersData[index] == $scope.dhcpScope.netBiosIp) {
						return false;
					}
				}
			}
			if ($scope.dhcpScope.netBiosIp !== '') {
				if ($scope.netBiosServersData.length == 8) {
					$scope.disabledAddNetBiosServer = true;
					return false;
				}
				$scope.netBiosServersData.push($scope.dhcpScope.netBiosIp);
				$scope.dhcpScope.netBiosIp = '';
			}
		}
	};
	$scope.storeRemoveNetBiosServers = [];
	$scope.removeNetBiosServers = function() {
		$scope.storeRemoveNetBiosServers = [];
		while ($scope.dhcpScope.selectedNetBios.length > 0) {
			var item = $scope.dhcpScope.selectedNetBios.pop();
			var index = $scope.netBiosServersData.indexOf(item);
			if (index != -1) {
				if($scope.netBiosServersData.length === 1){
					$scope.storeRemoveNetBiosServers.push($scope.netBiosServersData[index]);
				}
				$scope.netBiosServersData.splice(index, 1);
			}
		}
		if ($scope.netBiosServersData.length <= 8) {
			$scope.disabledAddNetBiosServer = false;
		}
	};
	$scope.saveNewDhcp = function() {
		if($scope.checkOptionState){
			if(angular.element("#dhcpOptionsValueAscii").val() == "" || angular.element("#dhcpOptionsGrid table tbody tr td")[3].innerText == ""){
				if(angular.element("#dhcpOptionsGrid table tbody tr td")[1].innerText){
					angular.element("#dhcpOptionsGrid table tbody tr td")[3].click();
					return;
				}
			}
		}
		var validateOptionValue = false;
        $scope.showValidator = false;
		if (!dhcpValidations.validate()) {
			return;
		}
		angular.forEach($scope.dhcpOptionsGridData, function(item) {
			if(item.dhcpOptionsId){
				if(!item.dhcpOptionsValue){
						validateOptionValue = true;
						return;
					}
			}
		});
		if(validateOptionValue){
			$scope.showValidator = true;
			return;
		}
		$scope.dhcpScope.created = true;
		$scope.dhcpScope.networkIp = $scope.dhcpScope.networkIp;
		$scope.dhcpScope.subnetIp = $scope.dhcpScope.subnetIp ;
    $scope.dhcpScope.hostIp = $scope.dhcpScope.hostIp;
    $scope.dhcpScope.hostSubnetIp = $scope.dhcpScope.hostSubnetIp ;
		if ($scope.dhcpScope.lease.leaseDays) {
			$scope.dhcpScope.lease.leaseDays = $scope.dhcpScope.lease.leaseDays;
		}else if ($scope.dhcpScope.lease.leaseHours) {
			$scope.dhcpScope.lease.leaseHours = $scope.dhcpScope.lease.leaseHours;
		}else if ($scope.dhcpScope.lease.leaseMinutes) {
			$scope.dhcpScope.lease.leaseMinutes = $scope.dhcpScope.lease.leaseMinutes;
		}else{
			$scope.dhcpScope.lease.leaseDays = "";
			$scope.dhcpScope.lease.leaseHours = "";
			$scope.dhcpScope.lease.leaseMinutes = "";
		}
		$scope.dhcpScope.routers = "";
		$scope.dhcpScope.dns = "";
		$scope.dhcpScope.netbios = "";
		if ($scope.defaultRoutersData && $scope.defaultRoutersData.length > 0) {
			$scope.dhcpScope.routers = $scope.defaultRoutersData.join();
		}
		if ($scope.dnsServersData && $scope.dnsServersData.length > 0) {
			$scope.dhcpScope.dns = $scope.dnsServersData.join();
		}
		if ($scope.netBiosServersData && $scope.netBiosServersData.length > 0) {
			$scope.dhcpScope.netbios = $scope.netBiosServersData.join();
		}
		$scope.deletedOptions = [];
		$scope.dhcpScope.dhcpOptions = [];
		$scope.dhcpScope.addedOptions = [];
		angular.forEach($scope.dhcpOptionsGridData, function(item) {
			if(item.dhcpOptionsId != "" && $scope.dhcpOptionsArrays[item.dhcpOptionsId]) {
				$scope.dhcpScope.addedOptions.push({
					"dhcpOptionsId": item.dhcpOptionsId,
					"dhcpOptionsType": $scope.dhcpOptionsArrays[item.dhcpOptionsId].backendType,
					"dhcpOptionsValue": item.dhcpOptionsValue
				})
				$scope.dhcpScope.dhcpOptions.push(item);
			}
		});
		$scope.dhcpScope.iptype = "ipv4";
		$scope.dhcpGridData.push($scope.dhcpScope);
		$scope.createDhcpWindow.close();
		$scope.disableDhcpApplyButton = false;
		$scope.enableDhcpDeleteButton = true;
		$scope.selectedArray = [];
    $scope.dhcpApplyBtn();
	};
	$scope.getDhcpScope = function(dhcpScopeName) {
		var matchIndex = -1;
		angular.forEach($scope.dhcpGridData, function(item, index) {
			if (item.dhcpScopeName === dhcpScopeName) {
				matchIndex = index;
			}
		});
		return matchIndex;
	};
	$scope.validatedhcpIp = function(value){
		var octet = '(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])';
		var ip    = '(?:' + octet + '\\.){3}' + octet;
		var ipRE  = new RegExp( '^' + ip + '$' );
		return (ipRE.test(value) ? true : false);
	}
	$scope.isValidate = true;
	$scope.updateDhcp = function() {
			if($scope.checkOptionState){
				if(angular.element("#dhcpOptionsValueAscii").val() == "" || angular.element("#dhcpOptionsGrid table tbody tr td")[3].innerText == ""){
					if(angular.element("#dhcpOptionsGrid table tbody tr td")[1].innerText){
						angular.element("#dhcpOptionsGrid table tbody tr td")[3].click();
						return;
					}
				}
			}
			var validateOptionValue = false;
			$scope.showValidator = false;
			angular.forEach($scope.dhcpOptionsGridData, function(item) {
				if(item.dhcpOptionsId){
					if(!item.dhcpOptionsValue){
							validateOptionValue = true;
							return;
						}
				}
			});
			if(validateOptionValue){
				$scope.showValidator = true;
				return;
			}
			if($scope.isValidate){
				var selectedRow = $scope.getDhcpScope($scope.selectedDhcpScope);
				$scope.dhcpGridData[selectedRow].dhcpScopeName = $scope.dhcpScope.dhcpScopeName;
				$scope.dhcpGridData[selectedRow].networkIp = $scope.dhcpScope.networkIp;
				$scope.dhcpGridData[selectedRow].subnetIp = $scope.dhcpScope.subnetIp;
        $scope.dhcpGridData[selectedRow].hostIp = $scope.dhcpScope.hostIp;
        $scope.dhcpGridData[selectedRow].hostSubnetIp = $scope.dhcpScope.hostSubnetIp;
        $scope.dhcpGridData[selectedRow].clientIdentifier = $scope.dhcpScope.clientIdentifier;
        $scope.dhcpGridData[selectedRow].nodeType = $scope.nodeType;
        $scope.dhcpGridData[selectedRow].nodeTypeHexaDecimal = $scope.dhcpScope.nodeTypeHexaDecimal;
				$scope.dhcpGridData[selectedRow].lease = {};
				$scope.dhcpGridData[selectedRow].lease.leaseDays = $scope.dhcpScope.lease.leaseDays ?  $scope.dhcpScope.lease.leaseDays : "";
				$scope.dhcpGridData[selectedRow].lease.leaseHours = $scope.dhcpScope.lease.leaseHours ?  $scope.dhcpScope.lease.leaseHours : "";
				$scope.dhcpGridData[selectedRow].lease.leaseMinutes = $scope.dhcpScope.lease.leaseMinutes ?  $scope.dhcpScope.lease.leaseMinutes : "";
        $scope.dhcpGridData[selectedRow].lease.infinite = $scope.dhcpScope.lease.infinite ?  true : false;
				$scope.dhcpScope.routers = "";
				$scope.dhcpScope.dns = "";
				$scope.dhcpScope.netbios = "";
				if ($scope.defaultRoutersData && $scope.defaultRoutersData.length > 0) {
					$scope.dhcpScope.routers = $scope.defaultRoutersData.join();
				}
				if ($scope.dnsServersData && $scope.dnsServersData.length > 0) {
					$scope.dhcpScope.dns = $scope.dnsServersData.join();
				}
				if ($scope.netBiosServersData && $scope.netBiosServersData.length > 0) {
					$scope.dhcpScope.netbios = $scope.netBiosServersData.join();
				}
				$scope.dhcpGridData[selectedRow].routers = $scope.dhcpScope.routers;
				$scope.dhcpGridData[selectedRow].dns = $scope.dhcpScope.dns;
				$scope.dhcpGridData[selectedRow].netbios = $scope.dhcpScope.netbios;
				$scope.dhcpGridData[selectedRow].domain = $scope.dhcpScope.domain;
        $scope.dhcpGridData[selectedRow].bootfile = $scope.dhcpScope.bootfile;
				if (!angular.isUndefined($scope.dhcpGridData[selectedRow].dhcpOptions)) {
					while ($scope.dhcpGridData[selectedRow].dhcpOptions.length > 0) {
						$scope.dhcpGridData[selectedRow].dhcpOptions.pop();
					}
				}
				$scope.dhcpGridData[selectedRow].addedOptions = [];
				angular.forEach($scope.dhcpOptionsGridData, function(item) {
					if(item.dhcpOptionsId){
						$scope.dhcpGridData[selectedRow].addedOptions.push({
							"dhcpOptionsId" : item.dhcpOptionsId,
							"dhcpOptionsType" : $scope.dhcpOptionsArrays[item.dhcpOptionsId].backendType,
							"dhcpOptionsValue" : item.dhcpOptionsValue
						});
					}
					if (!angular.isArray($scope.dhcpGridData[selectedRow].dhcpOptions)) {
						$scope.dhcpGridData[selectedRow].dhcpOptions = [];
					}
					if (angular.isUndefined($scope.dhcpGridData[selectedRow].dhcpOptions)) {
						$scope.dhcpGridData[selectedRow].dhcpOptions = [];
					}
					$scope.dhcpGridData[selectedRow].dhcpOptions.push(item);
				});
				$scope.deletedOptions = [];
				if($scope.dhcpGridData[selectedRow].hasOwnProperty("dhcpOptions")){
					if($scope.dhcpGridData[selectedRow].dhcpOptions && $scope.dhcpGridData[selectedRow].hasOwnProperty("optiondata") && $scope.dhcpGridData[selectedRow].optiondata.hasOwnProperty("options")){
							var deletedoptionData = filterdhcpOption($scope.dhcpGridData[selectedRow].dhcpOptions, $scope.dhcpGridData[selectedRow].optiondata.options);
							if (deletedoptionData && deletedoptionData.length > 0) {
								angular.forEach(deletedoptionData, function(item) {
									$scope.deletedOptions.push(item);
								});
							}
					}
				}else{
					if($scope.dhcpGridData[selectedRow].optiondata != ""){
						if($scope.deletedDhcpOptions.length > 0) {
							angular.forEach($scope.deletedDhcpOptions, function(item) {
								$scope.deletedOptions.push(item);
							});
						}
					}
				}
				$scope.dhcpGridData[selectedRow].deletedOptions = angular.copy($scope.deletedOptions);
				if (!$scope.dhcpGridData[selectedRow].created) {
					$scope.dhcpGridData[selectedRow].dirty = true;
					if($scope.olddhcpGridData[selectedRow].networkIp != $scope.dhcpGridData[selectedRow].networkIp || $scope.olddhcpGridData[selectedRow].subnetIp != $scope.dhcpGridData[selectedRow].subnetIp){
						$scope.dhcpGridData[selectedRow].oldnetworkIp = $scope.olddhcpGridData[selectedRow].networkIp;
						$scope.dhcpGridData[selectedRow].oldsubnetIp = $scope.olddhcpGridData[selectedRow].subnetIp;
					}
          if($scope.olddhcpGridData[selectedRow].hostIp != $scope.dhcpGridData[selectedRow].hostIp || $scope.olddhcpGridData[selectedRow].hostSubnetIp != $scope.dhcpGridData[selectedRow].hostSubnetIp){
              $scope.dhcpGridData[selectedRow].oldhostIp = $scope.olddhcpGridData[selectedRow].hostIp;
              $scope.dhcpGridData[selectedRow].oldhostSubnetIp = $scope.olddhcpGridData[selectedRow].hostSubnetIp;
          }
          if($scope.olddhcpGridData[selectedRow].nodeType != $scope.dhcpGridData[selectedRow].nodeType){
              $scope.dhcpGridData[selectedRow].oldnodeType = $scope.olddhcpGridData[selectedRow].nodeType;
          }
          if($scope.olddhcpGridData[selectedRow].bootfile != $scope.dhcpGridData[selectedRow].bootfile){
              $scope.dhcpGridData[selectedRow].oldbootfile = $scope.olddhcpGridData[selectedRow].bootfile;
          }
					if($scope.olddhcpGridData[selectedRow].hasOwnProperty("routers")){
						if($scope.olddhcpGridData[selectedRow].routers != ""){
							$scope.dhcpGridData[selectedRow].routeritemList = $scope.storeRemovedDefaultRouters;
						}
					}
					if($scope.olddhcpGridData[selectedRow].hasOwnProperty("dns")){
						if($scope.olddhcpGridData[selectedRow].dns != ""){
							$scope.dhcpGridData[selectedRow].dnsitemList = $scope.storeRemoveDNSServers;
						}
					}
					if($scope.olddhcpGridData[selectedRow].hasOwnProperty("netbios")){
						if($scope.olddhcpGridData[selectedRow].netbios != ""){
							$scope.dhcpGridData[selectedRow].netbiositemList = $scope.storeRemoveNetBiosServers;
						}
					}
				}
				$scope.createDhcpWindow.close();
				$scope.disableDhcpApplyButton = false;
			}
        $scope.dhcpApplyBtn();
		};
	function filterdhcpOption(data1, data2) {
		var a = angular.copy(data1);
		var b = angular.copy(data2);
		for (var i = 0, len = a.length; i < len; i++) {
			for (var j = 0, len2 = b.length; j < len2; j++) {
				if (a[i].dhcpOptionsId === b[j].dhcpOptionsId && a[i].dhcpOptionsValue === b[j].dhcpOptionsValue) {
					b.splice(j, 1);
					len2 = b.length;
				}
			}
		}
		return b;
	}
	$scope.deleteBtnFunction = function(value) {
		$scope.checkOptionState = false;
		if (value == true) {
			$scope.showTab = false;
			$scope.openDeleteWindow('deleteDhcpWindow');
			$scope.disableDhcpApplyButton = false;
		} else {
			$scope.deleteWindow.data("kendoWindow").close();
		}
	};
	$scope.openDeleteWindow = function(windowType){
		if(windowType =="deleteDhcpWindow"){
			$scope.deleteWindow = dialogService.dialog({
				content : translate('sys_dhcp_delete_msg'),
				title : translate('sys_dhcp_config'),
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
		var optValMSg = translate("sys_dhcp_option_value_msg");
		var preventDhcpOptionsAction = false;
		$scope.dhcpOptionsGridOptions = {
			editable : true,
            		edit : function() {
                		preventDhcpOptionsAction = true;
            		},
            		dataBound: function() {
                		preventDhcpOptionsAction = false;
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
				buttonCount : 4
			},
			selectable : false,
			scrollable : false,
			columns : [{
				"template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isDHCPOptionsChecked(checked,dataItem)\"  />",
				 sortable : false
			}, {
				field : 'dhcpOptionsId',
				title : translate('sys_dhcp_option'),
				template : "#=dhcpOptionsId#",
				editor : function(container, options) {
					container.append(angular.element('<input class="k-textbox form-control" name="dhcpOptionsId" placeholder="2-251" id="dhcpOptionsId" required data-required-msg="'+translate("sys_dhcp_option_req_msg")+'" data-bind="' + options.field + '" />'));
				}
			}, {
				field : 'dhcpOptionsType',
				title : translate('sys_dhcp_option_type'),
				editable : false,
				template : "#=dhcpOptionsType#",
				hidden : true,
				editor : function(container, options) {
					if (options.model.dhcpOptionsId != "") {
						options.model.dhcpOptionsType = $scope.dhcpOptionsArrays[options.model.dhcpOptionsId].backendType;
						container.append(angular.element('<input class="k-textbox form-control" readonly name="dhcpOptionsType" id="dhcpOptionsType" data-bind="' + options.field + '" />'));
					}
				}
			}, {
				field : 'dhcpOptionsValue',
				title : translate('sys_dhcp_option_value'),
				template : "#=dhcpOptionsValue#",
				editor : function(container, options) {
					if (options.model.dhcpOptionsId != "") {
						switch ($scope.dhcpOptionsArrays[options.model.dhcpOptionsId].backendType) {
							case "ip":
								container.append(angular.element('<input class="k-textbox form-control" name="dhcpOptionsValue" placeholder="xxx.xxx.xxx.xxx" id="dhcpOptionsValueIp" required data-required-msg="'+optValMSg+'" data-iprange data-iprange-msg="'+translate('aaa_ip_msg')+'" data-reservedIp data-bind="' + options.field + '" />'));
								break;
							case "iparray":
								container.append(angular.element('<input class="k-textbox form-control" name="dhcpOptionsValue" placeholder="" id="dhcpOptionsValueMultipleIp" required data-required-msg="'+optValMSg+'" data-multipleip data-bind="' + options.field + '" />'));
								break;
							case "ascii":
								container.append(angular.element('<input class="k-textbox form-control" name="dhcpOptionsValue" id="dhcpOptionsValueAscii" placeholder="xxx.xxx.xxx.xxx" required data-required-msg="'+optValMSg+'" data-iprange data-iprange-msg="'+translate('aaa_ip_msg')+'" data-asciichar data-bind="' + options.field + '" />'));
								break;
						}
					}
				}
			}]
		};
		$scope.dhcpOptionsInlineEditHandler = function() {
			if ($scope.dhcpOptionsGridDataSource.hasChanges() === true) {
				preventDhcpOptionsAction = false;
			}
		};
		$scope.addDHCPOptions = function() {
			$scope.checkOptionState = true;
			$scope.dhcpOptionsGrid.addRow();
			var newRowIndex = $scope.dhcpGridData.map(function(e) {
				return e.dhcpOptionsId;
			}).indexOf("");
			if (newRowIndex != -1) {
				$scope.dhcpGridData[newRowIndex].created = true;
			}
			$scope.selectedDHCPOptionsArray = [];
			$scope.deletedDhcpOptions = [];
			$scope.disableDHCPOptionsDeleteButton = true;
		};
		$scope.$watch('dhcpOptionsGrid', function() {
			if ($scope.dhcpOptionsGrid) {
				$scope.updateDHCPOptionsGrid();
			}
		});
		$scope.isDHCPOptionsChecked = function(checked, dataItem) {
			$scope.disableDHCPOptionsDeleteButton = false;
			if (checked === false) {
				var index = $scope.selectedDHCPOptionsArray.indexOf(dataItem);
				if (index > -1) {
					$scope.selectedDHCPOptionsArray.splice(index, 1);
				}
			} else {
				$scope.disableDHCPOptionsDeleteButton = false;
				$scope.selectedDHCPOptionsArray.push(dataItem);
			}
			if ($scope.selectedDHCPOptionsArray.length < 1) {
				$scope.disableDHCPOptionsDeleteButton = true;
			}
		};
		$scope.deleteDHCPOptions = function() {
			$scope.checkOptionState = false;
			$scope.deletedDhcpOptions = [];
			for (var index = 0; index < $scope.selectedDHCPOptionsArray.length; index++) {
				$scope.dhcpOptionsGrid.dataSource.remove($scope.selectedDHCPOptionsArray[index]);
				$scope.deletedDhcpOptions.push($scope.selectedDHCPOptionsArray[index]);
			}
			$scope.disableDHCPOptionsDeleteButton = true;
			$scope.selectedDHCPOptionsArray = [];
			if($scope.dhcpOptionsGrid._data.length != 0 && $scope.dhcpOptionsGrid._data[0].dhcpOptionsId == ""){
				angular.element("#dhcpOptionsGrid table tbody tr td")[1].click();
			}
		};
		angular.element("#dhcpOptionsGrid").delegate(".k-pager-refresh", "click", function(){
			$scope.disableDHCPOptionsDeleteButton = true;
			$scope.selectedDHCPOptionsArray = [];
			if (!$scope.$$phase){
				$scope.$apply();
			}
		});
		$scope.updateDHCPOptionsGrid = function() {
			$scope.dhcpOptionsGridDataSource = new kendo.data.DataSource({
				pageSize : 10,
				data : $scope.dhcpOptionsGridData,
				schema : {
					model : {
						id : "dhcpOptionsId",
						fields : {
							 dhcpOptionsId : {
								validation : {
									optionsnumericrange : function(input) {
										if (input.is("[id=dhcpOptionsId]") && input.filter("[data-optionsnumericrange]")) {
											var value = input.val();
											var dhcpOptionsType = $scope.dhcpOptionsArrays[value];
											if (angular.isUndefined(dhcpOptionsType)) {
												input.attr("data-optionsnumericrange-msg", "2,4,5,7-11,13,14,16-43,45,47-49,55-57,60, <br/>  62-77,81,85-87,118,122,128,185,220,221,251 <br/> "+translate('sys_dhcp_option_range_msg')+" ");
												return false;
											}
											return true;
										}
										return true;
									}
								}
							}, 
							dhcpOptionsType : {},
							dhcpOptionsValue : {
								validation : {
									iprange: function(input) {
										if (input.is("[id=dhcpOptionsValueAscii]")) {
											var value = input.val();
											if(!$scope.validatedhcpIp(value)){
												$scope.isValidate = false;
												input.attr("data-iprange-msg",""+translate('aaa_ip_msg')+"");
												return false;
											}
											$scope.isValidate = true;
											return true;
										}
										return true;
									}
								}
							}
						}
					}
				},
				requestStart: function(e) {
					if (preventDhcpOptionsAction) {
						e.preventDefault();
					}
				}
			});
		};
		$scope.dhcpOptionsArrays = {
			2 : {
				'name' : 'time-offset',
				type : 'INT',
				backendType : 'ascii'
			},
			4 : {
				'name' : 'time-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			5 : {
				'name' : 'name-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			7 : {
				'name' : 'log-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			8 : {
				'name' : 'cookie-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			9 : {
				'name' : 'lpr-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			10 : {
				'name' : 'impress-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			11 : {
				'name' : 'resource-location-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			13 : {
				'name' : 'boot-size',
				type : 'ascii',
				backendType : 'ascii'
			},
			14 : {
				'name' : 'merit-dump',
				type : 'ascii',
				backendType : 'ascii'
			},
			16 : {
				'name' : 'swap-server',
				type : 'ip',
				backendType : 'ip'
			},
			17 : {
				'name' : 'root-path',
				type : 'ascii',
				backendType : 'ascii'
			},
			18 : {
				'name' : 'extensions-path',
				type : 'ascii',
				backendType : 'ascii'
			},
			19 : {
				'name' : 'ip-forwarding',
				type : 'boolean',
				backendType : 'ascii'
			},
			20 : {
				'name' : 'non-local-source-routing',
				type : 'boolean',
				backendType : 'ascii'
			},
			21 : {
				'name' : 'policy-filters',
				type : 'ip',
				backendType : 'iparray'
			},
			22 : {
				'name' : 'max-dgram-reassembly',
				type : 'ascii',
				backendType : 'ascii'
			},
			23 : {
				'name' : 'default-ip-ttl',
				type : 'BYTE',
				backendType : 'ascii'
			},
			24 : {
				'name' : 'path-mtu-aging-timeout',
				type : 'number',
				backendType : 'ascii'
			},
			25 : {
				'name' : 'path-mtu-plateau-tables',
				type : 'ascii',
				backendType : 'ascii'
			},
			26 : {
				'name' : 'interface-mtu',
				type : 'ascii',
				backendType : 'ascii'
			},
			27 : {
				'name' : 'all-subnets-local',
				type : 'boolean',
				backendType : 'ascii'
			},
			28 : {
				'name' : 'broadcast-address',
				type : 'ip',
				backendType : 'ip'
			},
			29 : {
				'name' : 'perform-mask-discovery',
				type : 'boolean',
				backendType : 'ascii'
			},
			30 : {
				'name' : 'mask-supplier',
				type : 'boolean',
				backendType : 'ascii'
			},
			31 : {
				'name' : 'router-discovery',
				type : 'boolean',
				backendType : 'ascii'
			},
			32 : {
				'name' : 'router-solicitation-address',
				type : 'ip',
				backendType : 'ip'
			},
			33 : {
				'name' : 'static-routes',
				type : 'ip',
				backendType : 'iparray'
			},
			34 : {
				'name' : 'trailer-encapsulation',
				type : 'boolean',
				backendType : 'ascii'
			},
			35 : {
				'name' : 'arp-cache-timeout',
				type : 'number',
				backendType : 'ascii'
			},
			36 : {
				'name' : 'ieee802.3-encapsulation',
				type : 'boolean',
				backendType : 'ascii'
			},
			37 : {
				'name' : 'default-tcp-ttl',
				type : 'number',
				backendType : 'ascii'
			},
			38 : {
				'name' : 'tcp-keepalive-interval',
				type : 'number',
				backendType : 'ascii'
			},
			39 : {
				'name' : 'tcp-keepalive-garbage',
				type : 'boolean',
				backendType : 'ascii'
			},
			40 : {
				'name' : 'nis-domain',
				type : 'ascii',
				backendType : 'ascii'
			},
			41 : {
				'name' : 'nis-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			42 : {
				'name' : 'ntp-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			43 : {
				'name' : 'vendor-encapsulated-options',
				type : 'BYTE_ARRAY',
				backendType : 'ascii'
			},
			45 : {
				'name' : 'netbios-dd-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			47 : {
				'name' : 'netbios-scope',
				type : 'ascii',
				backendType : 'ascii'
			},
			48 : {
				'name' : 'font-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			49 : {
				'name' : 'x-display-managers',
				type : 'ip',
				backendType : 'iparray'
			},
			55 : {
				'name' : 'dhcp-parameter-request-list',
				type : 'BYTE_ARRAY',
				backendType : 'ascii'
			},
			56 : {
				'name' : 'dhcp-message',
				type : 'ascii',
				backendType : 'ascii'
			},
			57 : {
				'name' : 'dhcp-max-message-size',
				type : 'ascii',
				backendType : 'ascii'
			},
			60 : {
				'name' : 'dhcp-class-identifier',
				type : 'ascii',
				backendType : 'ascii'
			},
			62 : {
				'name' : 'netwareip-domain',
				type : 'ascii',
				backendType : 'ascii'
			},
			63 : {
				'name' : 'netwareip-information',
				type : 'BYTE_ARRAY',
				backendType : 'ascii'
			},
			64 : {
				'name' : 'nis+-domain',
				type : 'ascii',
				backendType : 'ascii'
			},
			65 : {
				'name' : 'nis+-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			66 : {
				'name' : 'tftp-server',
				type : 'ascii',
				backendType : 'ascii'
			},
			67 : {
				'name' : 'boot-file',
				type : 'ascii',
				backendType : 'ascii'
			},
			68 : {
				'name' : 'mobile-ip-home-agents',
				type : 'ip',
				backendType : 'iparray'
			},
			69 : {
				'name' : 'smtp-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			70 : {
				'name' : 'pop3-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			71 : {
				'name' : 'nntp-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			72 : {
				'name' : 'www-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			73 : {
				'name' : 'finger-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			74 : {
				'name' : 'irc-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			75 : {
				'name' : 'streettalk-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			76 : {
				'name' : 'streettalk-directory-assistance-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			77 : {
				'name' : 'dhcp-user-class-id',
				type : 'ascii',
				backendType : 'ascii'
			},
			81 : {
				'name' : 'client-fqdn',
				type : 'BYTE_ARRAY',
				backendType : 'ascii'
			},
			85 : {
				'name' : 'nds-servers',
				type : 'ip',
				backendType : 'iparray'
			},
			86 : {
				'name' : 'nds-tree',
				type : 'ascii',
				backendType : 'ascii'
			},
			87 : {
				'name' : 'nds-context',
				type : 'ascii',
				backendType : 'ascii'
			},
			118 : {
				'name' : 'subnet-selection',
				type : 'ip',
				backendType : 'ip'
			},
			122 : {
				'name' : 'cablelabs-client-configuration',
				type : 'LINE',
				backendType : 'ascii'
			},
			128 : {
				'name' : 'mcns-security-server',
				type : 'ip',
				backendType : 'ip'
			},
			185 : {
				'name' : 'vpn-id',
				type : 'BYTE_ARRAY',
				backendType : 'ascii'
			},
			220 : {
				'name' : 'cisco-subnet-allocation',
				type : 'BYTE_ARRAY',
				backendType : 'ascii'
			},
			221 : {
				'name' : 'cisco-vpn-id',
				type : 'BYTE_ARRAY',
				backendType : 'ascii'
			},
			251 : {
				'name' : 'auto-configure',
				type : 'BYTE',
				backendType : 'ascii'
			}
		};
		$scope.showTabsOnClick = function(data) {
			if(data.clientIdentifier){
				$scope.dhcpScope.manualBinding = true;
                $scope.dhcpScope.clientIdentifier = data.clientIdentifier;
			} else {
                $scope.dhcpScope.manualBinding = false;
			}
            if(data.nodeType != undefined) {
                if (data.nodeType == 'b-node' || data.nodeType == 'h-node' || data.nodeType == 'm-node' || data.nodeType == 'p-node') {
                    $scope.nodeType = data.nodeType;
                } else {
                    $scope.nodeType = '<0-FF>';
                    $scope.dhcpScope.nodeTypeHexaDecimal = data.nodeType;
                }
            } else {
                $scope.dhcpScope.nodeType = 'none';
			}
			$scope.checkOptionState = false;
			angular.element("#dhcpForm").find("span.k-tooltip").hide();
			$scope.selectedMode = "basic";
			$scope.mode = "basic";
			$scope.dhcpScopename = true;
			$scope.showTab = true;
			$scope.kendoWindow.isEditMode = false;
			$scope.dhcpScope.routerIp = null;
			$scope.dhcpScope.dnsIp = null;
			$scope.dhcpScope.netBiosIp = null;
			$scope.dhcpScope.domain = null;
      $scope.dhcpScope.bootfile = null;
			var _index = $scope.dhcpGridData.indexOf(data);
			if (data) {
				$scope.selectedDhcp = data;
				$scope.selectedDhcpScope = data.dhcpScopeName;
				$scope.dhcpScope.dhcpScopeName = data.dhcpScopeName;
				$scope.dhcpScope.networkIp = data.networkIp;
				$scope.dhcpScope.subnetIp = data.subnetIp;
        $scope.dhcpScope.hostIp = data.hostIp;
        $scope.dhcpScope.hostSubnetIp = data.hostSubnetIp;
                if (data.lease) {
                    if(data.lease.leaseDays == "infinite"){
                        $scope.dhcpScope.lease.infinite = true;
                    }else{
                        $scope.dhcpScope.lease.leaseDays = data.lease.leaseDays;
                        $scope.dhcpScope.lease.leaseHours = data.lease.leaseHours;
                        $scope.dhcpScope.lease.leaseMinutes = data.lease.leaseMinutes;
                    }
                }
                else{
                    $scope.dhcpScope.lease.leaseDays = null;
                    $scope.dhcpScope.lease.leaseHours = null;
                    $scope.dhcpScope.lease.leaseMinutes = null;
                }
				$scope.dhcpScope.domain = data.domain;
        $scope.dhcpScope.bootfile = data.bootfile;
				$scope.defaultRoutersData = [];
				$scope.netBiosServersData = [];
				$scope.dnsServersData = [];
				if (data.routers && data.routers.trim() != "") {
					var findCommaAndSpace = (data.routers.indexOf(",") != -1) ? ",":" ";
					$scope.defaultRoutersData = data.routers.split(findCommaAndSpace);
				}
				if (data.netbios && data.netbios.trim() != "") {
					var findCommaAndSpace = (data.netbios.indexOf(",") != -1) ? ",":" ";
					$scope.netBiosServersData = data.netbios.split(findCommaAndSpace);
				}
				if (data.dns && data.dns.trim() != "") {
					var findCommaAndSpace = (data.dns.indexOf(",") != -1) ? ",":" ";
					$scope.dnsServersData = data.dns.split(findCommaAndSpace);
				}
				while ($scope.dhcpOptionsGridData.length != 0) {
					$scope.dhcpOptionsGridData.pop();
				}
				if($scope.dhcpGridData[_index] && $scope.dhcpGridData[_index].hasOwnProperty("dhcpOptions")){
					angular.forEach($scope.dhcpGridData[_index].dhcpOptions, function(item,val) {
						$scope.dhcpOptionsGridData.push(item);
					});
					$scope.updateDHCPOptionsGrid();
				}else{
					if($scope.dhcpGridData[_index].deletedOptions && $scope.dhcpGridData[_index].deletedOptions.length > 0){
						$scope.dhcpGridData[_index].dhcpOptions = [];
					}else{
						if(data.optiondata && data.optiondata.options.length === undefined){
							data.optiondata.options = [data.optiondata.options];
						}
						if (!angular.isUndefined(data.optiondata)) {
							angular.forEach(data.optiondata.options, function(item,val) {
								$scope.dhcpOptionsGridData.push(item);
							});
							$scope.updateDHCPOptionsGrid();
						}
					}
				}
				if (angular.isUndefined($scope.dhcpOptionsGridData.length) || $scope.dhcpOptionsGridData.length == 0) {
					$scope.disableDHCPOptionsDeleteButton = true;
				}
			}
			$scope.createDhcpWindow.open().center();
		};
		$scope.dhcpApplyBtn = function(){
			var dhcpJson = {
				createdDhcp : [],
				deletedDhcp : [],
				updatedDhcp : []
			};
			angular.forEach($scope.dhcpGridData, function(item) {
				if(item==null){
					return item;
				}
				if (item.created) {
					dhcpJson.createdDhcp.push(item);
				}
				if (item.hasOwnProperty('dirty') && item.dirty == true) {
					dhcpJson.updatedDhcp.push(item);
				}
			});
			if (dhcpJson.createdDhcp.length <= 0) {
				dhcpJson.createdDhcp = undefined;
			}
			if (dhcpJson.updatedDhcp.length <= 0) {
				dhcpJson.updatedDhcp = undefined;
			}
			if ($scope.deletedDhcp.length > 0){
				dhcpJson.deletedDhcp = angular.copy($scope.deletedDhcp);
			}
			else{
				dhcpJson.deletedDhcp = undefined;
			}
			var systemDhcpConfig = "";
			if(dhcpJson.createdDhcp){
                for(var index =0 ;index < dhcpJson.createdDhcp.length ; index++) {
                    systemDhcpConfig += "ip dhcp pool " + dhcpJson.createdDhcp[index].dhcpScopeName + "\n";
                   if(dhcpJson.createdDhcp[index].manualBinding){
            						if(dhcpJson.createdDhcp[index].clientIdentifier) {
            							systemDhcpConfig += "client-identifier " + dhcpJson.createdDhcp[index].clientIdentifier + "\n";
            						}
                       if (dhcpJson.createdDhcp[index].hostIp) {
                           if (dhcpJson.createdDhcp[index].hostSubnetIp) {
                               systemDhcpConfig += "host " + dhcpJson.createdDhcp[index].hostIp + " " + dhcpJson.createdDhcp[index].hostSubnetIp + "\n";
                           } else {
                               systemDhcpConfig += "host " + dhcpJson.createdDhcp[index].hostIp + "\n";
                           }
                       }

                   } else {
                       if (dhcpJson.createdDhcp[index].networkIp) {
                           if (dhcpJson.createdDhcp[index].subnetIp) {
                               systemDhcpConfig += "network " + dhcpJson.createdDhcp[index].networkIp + " " + dhcpJson.createdDhcp[index].subnetIp + "\n";
                           } else {
                               systemDhcpConfig += "network " + dhcpJson.createdDhcp[index].networkIp + "\n";
                           }
                       }
                       if (dhcpJson.createdDhcp[index].lease.infinite) {
                           systemDhcpConfig += "lease infinite \n";
                       }
                       if (dhcpJson.createdDhcp[index].lease.leaseHours) {
                           if (dhcpJson.createdDhcp[index].lease.leaseHours == undefined) {
                               dhcpJson.createdDhcp[index].lease.leaseHours = "";
                           }
                           systemDhcpConfig += "lease " + dhcpJson.createdDhcp[index].lease.leaseDays + " " + dhcpJson.createdDhcp[index].lease.leaseHours + " " + +dhcpJson.createdDhcp[index].lease.leaseMinutes + "\n";
                       }
                       if (dhcpJson.createdDhcp[index].routers) {
                           var spltroute = dhcpJson.createdDhcp[index].routers.split(",");
                           systemDhcpConfig += "default-router ";
                           for (var listInd = 0; listInd < spltroute.length; listInd++) {
                               systemDhcpConfig += spltroute[listInd] + " ";
                           }
                           systemDhcpConfig += "\n";
                       }
                       if (dhcpJson.createdDhcp[index].dns) {
                           var spltroute = dhcpJson.createdDhcp[index].dns.split(",");
                           systemDhcpConfig += "dns-server ";
                           for (var listInd1 = 0; listInd1 < spltroute.length; listInd1++) {
                               systemDhcpConfig += spltroute[listInd1] + " ";
                           }
                           systemDhcpConfig += "\n";
                       }
                       if (dhcpJson.createdDhcp[index].netbios) {
                           var spltroute = dhcpJson.createdDhcp[index].netbios.split(",");
                           systemDhcpConfig += "netbios-name ";
                           for (var listInd2 = 0; listInd2 < spltroute.length; listInd2++) {
                               systemDhcpConfig += spltroute[listInd2] + " ";
                           }
                           systemDhcpConfig += "\n";
                       }
                       if ($scope.nodeType!='none') {
                           if (dhcpJson.createdDhcp[index].nodeTypeHexaDecimal) {
                               systemDhcpConfig += "netbios-node-type " + dhcpJson.createdDhcp[index].nodeTypeHexaDecimal + "\n";
                           } else {
                               systemDhcpConfig += "netbios-node-type " + $scope.nodeType + "\n";
                           }
                       }
                       if (dhcpJson.createdDhcp[index].domain) {
                           systemDhcpConfig += "domain-name " + dhcpJson.createdDhcp[index].domain + "\n";
                       }
                       if (dhcpJson.createdDhcp[index].bootfile) {
                           systemDhcpConfig += "bootfile  " + dhcpJson.createdDhcp[index].bootfile + "\n";
                       }
                       if (dhcpJson.createdDhcp[index].dhcpOptions) {
                           for (var index1 = 0; index1 < dhcpJson.createdDhcp[index].dhcpOptions.length; index1++) {
                               systemDhcpConfig += "option " + dhcpJson.createdDhcp[index].dhcpOptions[index1].dhcpOptionsId + " ip " + dhcpJson.createdDhcp[index].dhcpOptions[index1].dhcpOptionsValue + "\n";
                           }
                       }
                   }
                    systemDhcpConfig += "exit \n";
                }
			}
			if(dhcpJson.updatedDhcp){
                if(dhcpJson.updatedDhcp.length > 0){
                    for(var index =0 ;index < dhcpJson.updatedDhcp.length ; index++){
                        systemDhcpConfig += "ip dhcp pool "+ dhcpJson.updatedDhcp[index].dhcpScopeName + "\n";
                        if(dhcpJson.updatedDhcp[index].clientIdentifier) {
                            if (dhcpJson.updatedDhcp[index].clientIdentifier) {
                                systemDhcpConfig += "client-identifier " + dhcpJson.updatedDhcp[index].clientIdentifier + "\n";
                            }
                            if(dhcpJson.updatedDhcp[index].hasOwnProperty("oldhostIp") || dhcpJson.updatedDhcp[index].hasOwnProperty("oldhostSubnetIp")){
                                if(dhcpJson.updatedDhcp[index].oldhostIp || dhcpJson.updatedDhcp[index].oldhostSubnetIp){
                                    systemDhcpConfig += "no host "+ dhcpJson.updatedDhcp[index].oldhostIp +" "+ dhcpJson.updatedDhcp[index].oldhostSubnetIp +"\n";
                                }
                                dhcpJson.updatedDhcp[index].oldhostIp = "";
                                dhcpJson.updatedDhcp[index].oldhostSubnetIp = "";
                            }
                            if(dhcpJson.updatedDhcp[index].hostIp){
                                if(dhcpJson.updatedDhcp[index].subnetIp){
                                    systemDhcpConfig += "host "+ dhcpJson.updatedDhcp[index].hostIp + " " + dhcpJson.updatedDhcp[index].hostSubnetIp + "\n";
                                }else{
                                    systemDhcpConfig += "host "+ dhcpJson.updatedDhcp[index].hostIp + "\n";
                                }
                            }
                        } else {
							if(dhcpJson.updatedDhcp[index].hasOwnProperty("oldnetworkIp") || dhcpJson.updatedDhcp[index].hasOwnProperty("oldsubnetIp")){
								if(dhcpJson.updatedDhcp[index].oldnetworkIp || dhcpJson.updatedDhcp[index].oldsubnetIp){
									systemDhcpConfig += "no network "+ dhcpJson.updatedDhcp[index].oldnetworkIp +" "+ dhcpJson.updatedDhcp[index].oldsubnetIp +"\n";
								}
								dhcpJson.updatedDhcp[index].oldnetworkIp = "";
								dhcpJson.updatedDhcp[index].oldsubnetIp = "";
							}
							if(dhcpJson.updatedDhcp[index].networkIp){
								if(dhcpJson.updatedDhcp[index].subnetIp){
									systemDhcpConfig += "network "+ dhcpJson.updatedDhcp[index].networkIp + " " + dhcpJson.updatedDhcp[index].subnetIp + "\n";
								}else{
									systemDhcpConfig += "network "+ dhcpJson.updatedDhcp[index].networkIp + "\n";
								}
							}
							if (dhcpJson.updatedDhcp[index].lease.infinite) {
								systemDhcpConfig += "lease infinite \n";
							} else {
								if (dhcpJson.updatedDhcp[index].lease) {
									systemDhcpConfig += "lease " + dhcpJson.updatedDhcp[index].lease.leaseDays + " " + dhcpJson.updatedDhcp[index].lease.leaseHours + " " + +dhcpJson.updatedDhcp[index].lease.leaseMinutes + "\n";
								}
							}
							if (dhcpJson.updatedDhcp[index].hasOwnProperty("routeritemList")) {
								if (dhcpJson.updatedDhcp[index].routeritemList.length > 0) {
									systemDhcpConfig += "no default-router \n";
								}
								dhcpJson.updatedDhcp[index].routeritemList = [];
							}
							if (dhcpJson.updatedDhcp[index].routers) {
								var spltroute = dhcpJson.updatedDhcp[index].routers.split(",");
								systemDhcpConfig += "default-router ";
								for (var listInd = 0; listInd < spltroute.length; listInd++) {
									systemDhcpConfig += spltroute[listInd] + " ";
								}
								systemDhcpConfig += "\n";
							}
							if (dhcpJson.updatedDhcp[index].hasOwnProperty("dnsitemList")) {
								if (dhcpJson.updatedDhcp[index].dnsitemList.length > 0) {
									systemDhcpConfig += "no dns-server \n";
								}
								dhcpJson.updatedDhcp[index].dnsitemList = [];
							}
							if (dhcpJson.updatedDhcp[index].dns) {
								var spltroute = dhcpJson.updatedDhcp[index].dns.split(",");
								systemDhcpConfig += "dns-server ";
								for (var listInd1 = 0; listInd1 < spltroute.length; listInd1++) {
									systemDhcpConfig += spltroute[listInd1] + " ";
								}
								systemDhcpConfig += "\n";
							}
							if (dhcpJson.updatedDhcp[index].hasOwnProperty("netbiositemList")) {
								if (dhcpJson.updatedDhcp[index].netbiositemList.length > 0) {
									systemDhcpConfig += "no netbios-name-server \n";
								}
								dhcpJson.updatedDhcp[index].netbiositemList = [];
							}
							if (dhcpJson.updatedDhcp[index].netbios) {
								var spltroute = dhcpJson.updatedDhcp[index].netbios.split(",");
								systemDhcpConfig += "netbios-name ";
								for (var listInd2 = 0; listInd2 < spltroute.length; listInd2++) {
									systemDhcpConfig += spltroute[listInd2] + " ";
								}
								systemDhcpConfig += "\n";
							}
              if(dhcpJson.updatedDhcp[index].hasOwnProperty("oldnodeType")){
                  if(dhcpJson.updatedDhcp[index].oldnodeType ){
                      systemDhcpConfig += "no netbios-node-type   " + dhcpJson.updatedDhcp[index].oldnodeType + "\n";
                  }
                  dhcpJson.updatedDhcp[index].oldnodeType = "";
              }
							if ($scope.nodeType!='none') {
								if(dhcpJson.updatedDhcp[index].nodeTypeHexaDecimal){
									systemDhcpConfig += "netbios-node-type " + dhcpJson.updatedDhcp[index].nodeTypeHexaDecimal + "\n";
								} else {
									systemDhcpConfig += "netbios-node-type " + $scope.nodeType + "\n";
								}
							}
							if (dhcpJson.updatedDhcp[index].domain) {
								systemDhcpConfig += "domain-name " + dhcpJson.updatedDhcp[index].domain + "\n";
							}
              if(dhcpJson.updatedDhcp[index].hasOwnProperty("oldbootfile")){
                  if(dhcpJson.updatedDhcp[index].oldbootfile ){
                      systemDhcpConfig += "no bootfile  " + dhcpJson.updatedDhcp[index].oldbootfile + "\n";
                  }
                  dhcpJson.updatedDhcp[index].oldbootfile = "";
              }
							if (dhcpJson.updatedDhcp[index].bootfile) {
								systemDhcpConfig += "bootfile  " + dhcpJson.updatedDhcp[index].bootfile + "\n";
							}
							if (dhcpJson.updatedDhcp[index].deletedOptions) {
								for (var index1 = 0; index1 < dhcpJson.updatedDhcp[index].deletedOptions.length; index1++) {
									if (dhcpJson.updatedDhcp[index].deletedOptions[index1].dhcpOptionsId) {
										systemDhcpConfig += "no option " + dhcpJson.updatedDhcp[index].deletedOptions[index1].dhcpOptionsId + "\n";
									}
								}
								dhcpJson.updatedDhcp[index].deletedOptions = [];
							}
							if (dhcpJson.updatedDhcp[index].dhcpOptions) {
								for (var index1 = 0; index1 < dhcpJson.updatedDhcp[index].dhcpOptions.length; index1++) {
									systemDhcpConfig += "option " + dhcpJson.updatedDhcp[index].dhcpOptions[index1].dhcpOptionsId + " ip " + dhcpJson.updatedDhcp[index].dhcpOptions[index1].dhcpOptionsValue + "\n";
								}
							}
						}
						systemDhcpConfig += "exit \n";
					}
				}
			}
			if(dhcpJson.deletedDhcp){
				for(var delacc = 0; delacc < dhcpJson.deletedDhcp.length; delacc++){
					systemDhcpConfig += "no ip dhcp pool " + dhcpJson.deletedDhcp[delacc].dhcpScopeName + "\n";
				}
					systemDhcpConfig += "exit\n";
			}
			$scope.deletedDhcp = [];
			$scope.deletedDhcpOptions = [];
			$scope.deletedOptions = [];
			if(systemDhcpConfig != ""){
				var result = requestRoutingService.getConfigCmdOutput(systemDhcpConfig);
				if(result==""){
					notificationService.showNotification(translate('system_dhcpsuccess_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
				if(systemDhcpConfig!=""){
					$scope.loadDhcpData();
				}
			}
			$scope.enableDhcpDeleteButton = true;
			$scope.disableDhcpCancelButton = true;
			$scope.disableDhcpApplyButton = true;
		}
	/* dhcp end here */
	/* excluded dhcp start here */
		$scope.disableExcludedDeleteButton = true;
		$scope.disableExcludedCanceledButton = true;
		var preventExcludedAddressAction = false;
		$scope.dhcpExcludedGridOptions = {
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
			sortable : true,
			editable : true,
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
				refresh : false,
				pageSizes : gridCrudService.grid_page_sizes,
				buttonCount : 5
			},
			selectable : true,
			scrollable : false,
			columns : [{
				"template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isChecked(checked,dataItem)\"  />",
				sortable : false,
				width : 10
			}, {
				"field" : "excludedAddress",
				"title" : translate('exclude_title'),
				editor : function(container, options) {
					container.append(angular.element('<input class="k-textbox form-control" id="excludedAddress" name="excludedAddress" placeholder="xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx" required data-required-msg="'+translate('dhcp_excluded_address_required')+'" data-multipleip data-ip data-reservedIp data-specialchar data-duplicatecheck data-validateip data-validateip-msg="Ip Address is required" ng-model="excludedValue" />'));
				},
				width : 30
			}
			],
			dataBound: function() {
				preventExcludedAddressAction = false;
			}
		};
		/////////////validation
		$scope.validateExcludeIpAddress = function(ipv4Address) {
							var testString;
							if ( typeof ipv4Address == 'string') {
											testString = ipv4Address;
							} else {
											testString = ipv4Address.val();
							}
							if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(testString) || testString == '') {
											return true;
							};
							return false;
					  }
		$scope.validateReservedIpAddress = function(ipv4Address) {
							var testString;
							if ( typeof ipv4Address == 'string') {
											testString = ipv4Address;
							} else {
											testString = ipv4Address.val();
							}
							if (testString == '') {
											return true;
							}
							if (testString == "0.0.0.0" || testString == "255.255.255.255") {
											return false;
							}
							return true;
					  };
		$scope.updateExcludedDHCPOptionsGrid = function() {
			$scope.dhcpExcludedGridDataSource = new kendo.data.DataSource({
				pageSize : 10,
				data : $scope.dhcpExcludedGridData,
				schema : {
					model : {
						id : "excludedAddress",
						fields : {
							excludedAddress : {
								validation : {
									multipleip : function(input) {
										if (input.is("[id=excludedAddress]") && input.filter("[data-multipleip]")) {
											var value = input.val().trim();
											var multipleip = value.split("-");
											var valid = true;
											if (multipleip.length > 2) {
												input.attr("data-multipleip-msg", translate('day0_wizard_ip_address_invalid_msg'));
												return false;
											} else if (multipleip.length == 2) {
												if (multipleip[0] == "" || multipleip[1] == "") {
													input.attr("data-multipleip-msg", translate('day0_wizard_ip_address_invalid_msg'));
													valid = false;
												} else if (!$scope.validateExcludeIpAddress(multipleip[0])) {
													input.attr("data-multipleip-msg", translate('day0_wizard_ip_address_invalid_msg'));
													valid = false;
												} else if (!$scope.validateExcludeIpAddress(multipleip[1])) {
													input.attr("data-multipleip-msg", translate('day0_wizard_ip_address_invalid_msg'));
													valid = false;
												} else if ($scope.dot2num(multipleip[0]) > $scope.dot2num(multipleip[1])) {
													input.attr("data-multipleip-msg", translate('day0_wizard_ip_address_invalid_msg'));
													valid = false;
												}
												return valid;
											}
											return true;
										}
										return true;
									},
									ip : function(input) {
										if (input.is("[id=excludedAddress]") && input.filter("[data-ip]")) {
											var value = input.val().trim();
											if (value.split("-").length == 1) {
												if (validationService.validateIPAddress(input) == false) {
													input.attr("data-ip-msg", translate('day0_wizard_ip_address_invalid_msg'));
													return false;
												}
											}
											return true;
										}
										return true;
									},
									reservedIp : function(input) {
										if (input.is("[id=excludedAddress]") && input.filter("[data-reservedIp]")) {
											var value = input.val().trim();
											if (value.split("-").length == 1) {
												if ($scope.validateReservedIpAddress(value) == false) {
													input.attr("data-reservedIp-msg", translate('day0_wizard_ip_address_invalid_msg'));
													return false;
												}
											}
											return true;
										}
										return true;
									},
									specialchar : function(input) {
										  if (input.is("[id=excludedAddress]") && input.filter("[data-specialchar]")) {
											var multipleip = input.val();
											if ($scope.validateSpecialCharacters(multipleip) == false) {
												input.attr("data-specialchar-msg", translate('user_administration_username_special'));
												return false;
											}
											return true;
										}
										return true;
									},
									duplicatecheck : function(input) {
										  if (input.is("[id=excludedAddress]") && input.filter("[data-duplicatecheck]")) {
											var value = input.val().trim();
											var duplicateValue = true;
											var newRowIndex = $scope.dhcpExcludedGridData.map(function(e) {
												return e.excludedAddress;
											}).indexOf(value);
											angular.forEach($scope.dhcpExcludedGridData, function(data, index) {
												if (data["excludedAddress"] === value && index != newRowIndex) {
													input.attr("data-duplicatecheck-msg", translate('exclude_ip_exist'));
													duplicateValue = false;
												}
											});
											return duplicateValue;
										}
										return true;
									}
								}
							}
						}
					}
				},
				requestStart: function(e) { //prevent grid navigation
					if (preventExcludedAddressAction) {
						e.preventDefault();
					}
				}
			});
			};
		$scope.showAddDhcpExcluded = function() {
			$scope.dhcpExcludedGrid.addRow();
			$scope.disableExcludedDeleteButton = true;
			$scope.disableExcludedCanceledButton = false;
			$scope.disableDhcpExcludedCancelButton = false;
			$scope.selectedExcludedArray = [];
		};
		$scope.cancelExcludedDhcp = function(){
			$scope.selectedExcludedArray = [];
			$scope.disableExcludedDeleteButton = true;
			$scope.disableExcludedCanceledButton = true;
			$scope.disableDhcpExcludedCancelButton = true;
			$scope.dhcpExcludedGrid.cancelChanges();
		}
		$scope.dot2num = function(dot) {
			var d = dot.split('.');
			return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
		};
		$scope.validateSpecialCharacters = function(value) {
			if (value.indexOf(" ") >-1 || value.indexOf("?") > -1) {
				return false;
			}
			return true;
		};
		$scope.selectedExcludedDhcpOnClick = function(data) {
			if($scope.checkDHCPExcludedAddress()){
				$scope.disableExcludedDeleteButton = true;
				return false;
			}else {
				$scope.selectedExcludedDhcp = data;
				$scope.disableExcludedDeleteButton = false;
			}
		};
		$scope.checkDHCPExcludedAddress = function (){
			$scope.disableDhcpExcludedCancelButton = false;
			var currentDataTemp = angular.copy($scope.dhcpExcludedGrid.dataSource._data);
            var emptyField = false;
			for (var currentIndex = 0; currentIndex < currentDataTemp.length; currentIndex++) {
				var currentName = currentDataTemp[currentIndex].excludedAddress;
				if(currentName == ""){
                    emptyField = true;
				}
			}
			return emptyField;
		}
		$scope.selectedExcludedArray = [];
		$scope.deleteExcludedDhcp = function() {
			$scope.deleteExcludedArray = [];
			$scope.disableExcludedDeleteButton = true;
			$scope.disableDhcpExcludedCancelButton = false;
			$scope.disableApplyButton = false;
			if ($scope.selectedExcludedArray.length > 0) {
				for (var index in $scope.selectedExcludedArray) {
					$scope.dhcpExcludedGrid.dataSource.remove($scope.selectedExcludedArray[index]);
					$scope.deleteExcludedArray.push($scope.selectedExcludedArray[index])
				}
			}
			if($scope.dhcpExcludedGrid._data.length != 0 && $scope.dhcpExcludedGrid._data[0].excludedAddress == ""){
				angular.element("#dhcpExcludedGrid table tbody tr td")[1].click();
			}
		};
		$scope.isChecked = function(checked, dataItem) {
			$scope.disableExcludedDeleteButton = false;
			if (checked == false) {
				var index = $scope.selectedExcludedArray.indexOf(dataItem);
				if (index > -1) {
					$scope.selectedExcludedArray.splice(index, 1);
				}
			} else {
				$scope.disableExcludedDeleteButton = false;
				$scope.disableExcludedCanceledButton = false;
				$scope.selectedExcludedArray.push(dataItem);
			}
			if ($scope.selectedExcludedArray.length <1) {
					$scope.disableExcludedDeleteButton = true;
		    }
		};
		  function filterCommunity(data1, data2) {
            var a = angular.copy(data1);
            var b = angular.copy(data2);
            for (var i = 0, len = a.length; i < len; i++) {
                for (var j = 0, len2 = b.length; j < len2; j++) {
                    if (a[i].excludedAddress === b[j].excludedAddress) {
                        b.splice(j, 1);
                        len2 = b.length;
                    }
                }
            }
            return b;
        }
		$scope.dhcpexcludedCommunityPristineData = {};
		$scope.apply = function(){
			var validateExcludedOptionValue = true;
				angular.forEach($scope.dhcpExcludedGrid._data, function(item) {
					if(!item.excludedAddress){
						validateExcludedOptionValue = false;
					}
			});
			if(validateExcludedOptionValue == true){
			var pristineDataCommunity = angular.copy($scope.dhcpexcludedCommunityPristineData);
			var currentDataTemp = angular.copy($scope.dhcpExcludedGrid.dataSource._data);
			var createddhcp_community = filterCommunity(pristineDataCommunity, currentDataTemp);
			var deleteddhcp_community = filterCommunity(currentDataTemp, pristineDataCommunity);
			var excludedCli = "";
			if(createddhcp_community){
				for(var exclud=0;exclud<createddhcp_community.length;exclud++){
					if(createddhcp_community[exclud].excludedAddress.indexOf("-")>-1){
						var dhcpExclud = createddhcp_community[exclud].excludedAddress.split("-");
						excludedCli +="ip dhcp excluded-address "+dhcpExclud[0]+" "+dhcpExclud[1] + "\n";

					}else{
						excludedCli +="ip dhcp excluded-address "+createddhcp_community[exclud].excludedAddress+"\n";
					}
				}
			}
			if(deleteddhcp_community){
				for(var exclud=0;exclud<deleteddhcp_community.length;exclud++){
					if(deleteddhcp_community[exclud].excludedAddress.indexOf("-")>-1){
						var dhcpExclud = deleteddhcp_community[exclud].excludedAddress.split("-");
						excludedCli +="no ip dhcp excluded-address "+dhcpExclud[0]+" "+dhcpExclud[1] + "\n";

					}else{
						excludedCli +="no ip dhcp excluded-address "+deleteddhcp_community[exclud].excludedAddress+"\n";
					}
				}
			}
			excludedCli += "exit \n";
				var result = requestRoutingService.getConfigCmdOutput(excludedCli);
				if(result==""){
					notificationService.showNotification(translate('dhcp_excludeaddress_success_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
				$scope.disableDhcpExcludedCancelButton = true;
				$scope.dhcpexcludedCommunityPristineData = {};
                $scope.dhcpexcludedCommunityPristineData = angular.copy($scope.dhcpExcludedGrid.dataSource._data);
				$scope.disableExcludedCanceledButton = true;
				$scope.loadExcludedAddress();
			}
		}
		$scope.loadExcludedAddress = function(){
			$scope.dhcpExcludedGridData = new kendo.data.ObservableArray([]);
			var dhcpEx = deviceCommunicator.getExecCmdOutput("show running-config partition common | in excluded-address");
			if(dhcpEx){
				var dhcpLinesplt = dhcpEx.split("\n");
				var excludedData = {excludedAddress:''};
				for(var i=0;i<dhcpLinesplt.length;i++){
					var spltDhcpArr = dhcpLinesplt[i].split(" ");
					if(spltDhcpArr.length < 5){
						excludedData.excludedAddress = spltDhcpArr[3];
					}else{
						excludedData.excludedAddress = spltDhcpArr[3]+"-"+spltDhcpArr[4];
					}
					$scope.dhcpExcludedGridData.push(excludedData);
				}
			}
			$scope.dhcpexcludedCommunityPristineData = angular.copy($scope.dhcpExcludedGridData);
			$scope.dhcpExcludedGridDataSource = new kendo.data.DataSource({
				pageSize : 20,
				data : $scope.dhcpExcludedGridData
			});
			$scope.$watch('dhcpExcludedGrid', function() {
				if ($scope.dhcpExcludedGrid) {
					$scope.updateExcludedDHCPOptionsGrid();
				}
		    });
		};
		/* end excluded dhcp */
}]);
