/**
 Description: Controller - Day Zero Wizard
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller("SummaryScreenCtrl", ['$scope','$rootScope', 'dayZeroStepService', '$filter','requestRoutingService', 'networkIPDetails','httpServices','dialogService','notificationService',
function ($scope, $rootScope,dayZeroStepService, $filter,requestRoutingService, networkIPDetails,httpServices,dialogService,notificationService) {
	var translate = $filter("translate");
	var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
	var controllerIP = dayZeroStepService.getControllerIP();
	$scope.version = versionInfo.ShowVersion.version.split(',')[0];
	$rootScope.deviceInfo = {
			type: versionInfo.ShowVersion.name
	};
	if(  ($rootScope.deviceInfo.type.indexOf("C2960X") != -1 && $rootScope.deviceInfo.type.indexOf("-LL") == -1) || ($rootScope.deviceInfo.type.indexOf("C3560CX") != -1) || ($rootScope.deviceInfo.type.indexOf("2960C") != -1 && $rootScope.deviceInfo.type.indexOf("-S") == -1)  || ($rootScope.deviceInfo.type.indexOf("WS-C2960+") != -1 && $rootScope.deviceInfo.type.indexOf("-S") == -1) || ($rootScope.deviceInfo.type.indexOf("2960XR") != -1)  || ($rootScope.deviceInfo.type.indexOf("2960CX") != -1) ) {
		     $scope.showDeviceStatus=true;
	}else{
		$scope.showDeviceStatus=false;
	}
	$scope.enableWirelessr = false;
	$scope.enabledStr = translate("com_enable");
	$scope.disabledStr = translate("com_disable");
	$scope.basicSummary= dayZeroStepService.getBasicConfig();
	$scope.interSummary= dayZeroStepService.getInterConfig();
	$scope.advSummary= dayZeroStepService.getAdvConfig();
	$scope.laySummary= dayZeroStepService.getLayConfig();
	$scope.ipAddressAssign= dayZeroStepService.getIpAddressAssign();
	$scope.wireless = dayZeroStepService.getWireless();
	$scope.securityTypes=dayZeroStepService.securityTypes();
	$scope.$watch(function() {
		return dayZeroStepService.getBasicConfig();
	}, function(newValue) {
		$scope.basicSummary = newValue;
	},true);
	$scope.$watch(function() {
		return dayZeroStepService.getInterConfig();
	}, function(newValue) {
		$scope.interSummary = newValue;
		$scope.convertArrayToString($scope.interSummary.accessPorts);
	}, true);
	$scope.$watch(function() {
		return dayZeroStepService.getAdvConfig();
	}, function(newValue) {
		$scope.advSummary = newValue;
	});
	$scope.$watch(function() {
		return dayZeroStepService.getLayConfig();
	}, function(newValue) {
		$scope.laySummary = newValue;
	});
	$scope.$watch(function() {
		return dayZeroStepService.getIpAddressAssign();
	}, function(newValue) {
		$scope.ipAddressAssign = newValue;
	});
	$scope.$watch(function() {
		return dayZeroStepService.getDay0ModeBool();
	}, function(nDay0Bool) {
		$scope.enableWirelessr = nDay0Bool;
	},true);
	$scope.$watch(function() {
		return dayZeroStepService.getWirelessPossible();
	}, function(_wirelesspossible) {
		$scope.wirelesspossible = _wirelesspossible;
	},true);
	$scope.$watch(function() {
		return dayZeroStepService.getWireless();
	}, function(newValue) {
		if(newValue.hasOwnProperty('wifi')){
			$scope.wireless = newValue;
			var findSecurityText = $filter('filter')($scope.securityTypes.options.data, {"securityValue":$scope.wireless.wifi.networkSecurity}, true);
			if(findSecurityText.length > 0){
				$scope.wireless.networkSecurity = findSecurityText[0].securityType;
			}
			$scope.wireless.country = $scope.wireless.wifi.country;
		}
	}, true);
	$scope.convertArrayToString = function(a){
		var o = "";
		if(a && a.length > 0){
			o = a.join();
		}
		return o;
	};
        $scope.$on("meFailedCB", function(event, data) {
		//Do nothing, continue to configure switch
		$scope.meFailed.data("kendoWindow").close();
        });

	var postMEData = function (path, params, dayzeroConfigCLI){
		angular.element("body").addClass("busy");		
		switchConfigCLI = dayzeroConfigCLI;
		var http = new XMLHttpRequest();
		var url = path;
		var dataToSend = "";
		for(var key in params) {
			if(params.hasOwnProperty(key)) {
				if(dataToSend != ""){
						dataToSend+="&";
				}
				var val = params[key];
				var comp = encodeURIComponent(key) + "=" +  encodeURIComponent(val);
				dataToSend += comp;
			}
		}

		
		http.onreadystatechange = function() {//Call a function when the state changes.
			//Handle the ME post response; and post config switch
    			if(http.readyState == 4 && http.status == 200) {
				angular.element("body.busy").removeClass("busy");
				//Even if the request says 200OK, check for any errors and show
				var res = http.responseText;
				var msgIndex = res.indexOf("err_msg");
				var errIndex = res.indexOf("VALUE=",msgIndex);
				var endIndex = res.indexOf('">',errIndex);
				var errMsg = res.substring(errIndex,endIndex);
				errMsg = errMsg.replace(/\"/g,'');
				errMsg = errMsg.replace("VALUE=",'');
				if(errMsg.length>5){ //There is an error, show the message
        				$scope.meFailed = dialogService.dialog({
                                        content : translate("me_config_fail_details") + "&#9658;" + errMsg,
                                        title : translate("me_config_fail"),
                                        messageType : "confirm",
                                        actionButtons : [{
                                                text : translate("com_ok"),
                                                callback : "meFailedCB"
                                        }]
                                	});
				} else {
					console.log("ME Configuration SUCCESS");
					var msg = translate('dayzero_wireless_config') + " " + translate('com_success');
					notificationService.showNotification(msg,translate('com_config_success_title'),'success');
				}
				if(switchConfigCLI != ""){
					dayZeroStepService.setCli(switchConfigCLI);
					switchConfigCLI = "";
				}
    			} else {
				if(http.status != 0 && http.readyState != 0){
				angular.element("body.busy").removeClass("busy");
				console.log("ME Configuration ERROR");
        			$scope.meFailed = dialogService.dialog({
                                	content : translate("me_config_fail_details"),
                                	title : translate("me_config_fail"),
                                	messageType : "confirm",
                                	actionButtons : [{
                                        	text : translate("com_ok"),
						callback : "meFailedCB"
                                	}]
                        	});
				if(switchConfigCLI != ""){
                                        dayZeroStepService.setCli(switchConfigCLI);
                                        switchConfigCLI = "";
				}
				}
			}
		}
		http.open("POST", url, false);
		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http.send(dataToSend); //POST data to ME wireless controller
	};

	$scope.$on("dayZeroWizard:nextButtonPressed", function (evt, laststep, stepNumber) {
		if (stepNumber === 6) {
			var dayzeroConfigCLI='';
			dayzeroConfigCLI+="hostname "+ $scope.basicSummary.hostName+"\n";
			dayzeroConfigCLI+="username " + $scope.basicSummary.userName+" privilege 15 password 0 "+ $scope.basicSummary.password+"\n ";
			dayzeroConfigCLI+="enable secret "+ $scope.basicSummary.enablePassword+"\n";
			dayzeroConfigCLI+="do clock set "+ $scope.basicSummary.clock+"\n";
			if($scope.interSummary.newIpAddress){
				dayzeroConfigCLI+="interface "+$scope.interSummary.vlan+"\n";
				if($scope.interSummary.newIpAddress.indexOf(":")!=-1){
					dayzeroConfigCLI+="ipv6 address "+$scope.interSummary.newIpAddress+"\n exit\n";
				}else{
					dayzeroConfigCLI+="ip address "+$scope.interSummary.newIpAddress+" "+$scope.interSummary.subnetMask+"\nexit\n";
				}			
			}
			// Data Vlan from interface config 
			if($scope.interSummary.dataVlan){
				dayzeroConfigCLI+="vlan "+$scope.interSummary.dataVlan+"\n";
				dayzeroConfigCLI+="name DataVLAN"+$scope.interSummary.dataVlan+"\nexit\n";
				dayzeroConfigCLI+="interface vlan"+$scope.interSummary.dataVlan+"\n";
				if($scope.interSummary.dataVlanIpAddress.indexOf(":")!=-1){
					dayzeroConfigCLI+="ipv6 address "+$scope.interSummary.dataVlanIpAddress+"\n";
				}else{
					dayzeroConfigCLI+="ip address "+$scope.interSummary.dataVlanIpAddress+" "+$scope.interSummary.dataVlanSubnetMask+"\n";
				}				
				dayzeroConfigCLI+="exit\n";
				
				if($scope.interSummary.vlanDhcpEnable){
					let networkIP = networkIPDetails.getNetworkIP($scope.interSummary.dataVlanIpAddress, $scope.interSummary.dataVlanSubnetMask);
					dayzeroConfigCLI+="ip dhcp pool datavlan"+$scope.interSummary.dataVlan+"pool\n";
					dayzeroConfigCLI+="network "+networkIP+" "+$scope.interSummary.dataVlanSubnetMask+"\n";
					dayzeroConfigCLI+="default-router "+$scope.interSummary.dataVlanIpAddress+"\n";
					dayzeroConfigCLI+="exit\n";
				}
			}
			// Wireless Vlan from interface config 
			if($scope.interSummary.wirelessVlan){
				if($scope.interSummary.vlanIpAddress.indexOf(":")==-1){
					dayzeroConfigCLI+="ip dhcp excluded-address " + $scope.interSummary.vlanIpAddress + " " + $scope.interSummary.vlanIpAddress + "\n";
				}
				dayzeroConfigCLI+= ($scope.wireless.wifi && $scope.wireless.wifi.mgmtIpAddress && $scope.wireless.wifi.mgmtIpAddress != "" ? 
							"ip dhcp excluded-address " + $scope.wireless.wifi.mgmtIpAddress + " " + $scope.wireless.wifi.mgmtIpAddress + "\n" : "");

				dayzeroConfigCLI+="vlan "+$scope.interSummary.wirelessVlan+"\n";
				dayzeroConfigCLI+="name WirelessVLAN"+$scope.interSummary.wirelessVlan+"\nexit\n";
				dayzeroConfigCLI+="interface vlan"+$scope.interSummary.wirelessVlan+"\n";
				if($scope.interSummary.vlanIpAddress.indexOf(":")!=-1){
					dayzeroConfigCLI+="ipv6 address "+$scope.interSummary.vlanIpAddress+"\n";
				}else{
					dayzeroConfigCLI+="ip address "+$scope.interSummary.vlanIpAddress+" "+$scope.interSummary.vlanSubnetMask+"\n";	
				}			
				dayzeroConfigCLI+="exit\n";

				if($scope.interSummary.wirelessDhcpEnable){
					let networkIP = networkIPDetails.getNetworkIP($scope.interSummary.vlanIpAddress, $scope.interSummary.vlanSubnetMask);
					dayzeroConfigCLI+="ip dhcp pool wirelessvlan"+$scope.interSummary.wirelessVlan+"pool\n";
					dayzeroConfigCLI+="network "+networkIP+" "+$scope.interSummary.vlanSubnetMask+"\n";
					dayzeroConfigCLI+="default-router "+$scope.interSummary.vlanIpAddress+"\n";
					dayzeroConfigCLI+="exit\n";
				}

				var CDPclientSwitchPort = dayZeroStepService.getCDPClientSwitchPort();
				CDPclientSwitchPort = CDPclientSwitchPort == "" ? [] : CDPclientSwitchPort;
				if(CDPclientSwitchPort && CDPclientSwitchPort.length > 0){
					for(var CDPcsp = 0; CDPcsp < CDPclientSwitchPort.length; CDPcsp++){
						dayzeroConfigCLI+="interface "+CDPclientSwitchPort[CDPcsp]+"\n";
						dayzeroConfigCLI+="switchport mode trunk\n";
						dayzeroConfigCLI+="switchport trunk allowed vlan all\n";
						dayzeroConfigCLI+="switchport trunk native vlan " + $scope.interSummary.wirelessVlan +"\n";
						dayzeroConfigCLI+="exit\n";
					}
				}
			}
			// Access port
			if($scope.interSummary.accessPorts){
				for(var index=0;index<$scope.interSummary.accessPorts.length;index++){
					if($scope.interSummary.accessPorts[index]!=translate("portconfig_options_none") && $scope.interSummary.accessPorts[index]!=undefined){
						dayzeroConfigCLI+="int "+ $scope.interSummary.accessPorts[index]+"\n";
						dayzeroConfigCLI+="switchport mode access \n";
						if($scope.interSummary.dataVlan && $scope.interSummary.dataVlan != ""){
							dayzeroConfigCLI+="switchport access vlan "+$scope.interSummary.dataVlan+"\n";
						}
						if($scope.interSummary.portfast==true){
							dayzeroConfigCLI+="spanning-tree portfast edge\n";
						}
						if($scope.interSummary.evetClass==translate("com_enable")){
							dayzeroConfigCLI+="power inline port 2-event \n";
						}
						if($scope.interSummary.perPoe==translate("com_enable")){
							dayzeroConfigCLI+="power inline port poe-ha \n";
						}
						dayzeroConfigCLI+="exit \n";
					}
				}
			}
			// uplink port
			if($scope.interSummary.uplinkPort!="none" && $scope.interSummary.uplinkPort!=translate("portconfig_options_none") && $scope.interSummary.uplinkPort!=undefined){
				dayzeroConfigCLI+="int "+ $scope.interSummary.uplinkPort+"\n";
				dayzeroConfigCLI+="switchport mode trunk \n";
				dayzeroConfigCLI+="switchport trunk allowed vlan all \nexit\n";
			}
			dayzeroConfigCLI+="ip default-gateway " + $scope.interSummary.defaultGateway +"\n";
			if($scope.interSummary.defaultRoute!='' && $scope.interSummary.defaultRoute!=undefined){
				if($scope.interSummary.defaultRoute.indexOf(":")!=-1){
					dayzeroConfigCLI+="ip routing \n ipv6 route ::/0 " + $scope.interSummary.defaultRoute+"\n";
				}else{
					dayzeroConfigCLI+="ip routing \n ip route 0.0.0.0 0.0.0.0 " + $scope.interSummary.defaultRoute+"\n";
				}			
			}
			/* for(var i3=0;i3<$scope.ipAddressAssign.length;i3++){
				if($scope.ipAddressAssign[i3].ipAddress){
					var newIpAddressAssign=($scope.ipAddressAssign[i3].vlan).replace(/\D/g,'');
					dayzeroConfigCLI+="interface vlan"+newIpAddressAssign+"\n";
					dayzeroConfigCLI+="ip address "+$scope.ipAddressAssign[i3].ipAddress+" "+$scope.ipAddressAssign[i3].subnet+"\n";
				}
			} */
			if(($scope.basicSummary.enableSSH=="Enable")&&($scope.basicSummary.enableTelnet=="Enable")) {
				// IMP! DO NOT remove the write mem. Its required.
				dayzeroConfigCLI+="do write memory\n";
				dayzeroConfigCLI+="line vty 0 10 \ntransport input all \ntransport output all\nlogin local\n";
				dayzeroConfigCLI+="exit\n";
				dayzeroConfigCLI+="ip domain-name "+$scope.basicSummary.domainName+"\n";
				dayzeroConfigCLI+="crypto key generate rsa modulus "+$scope.basicSummary.RSAKey+"\n";
			}
			else if($scope.basicSummary.enableTelnet=="Enable"){
				// IMP! DO NOT remove the write mem. Its required.
				dayzeroConfigCLI+="do write memory\n";
				dayzeroConfigCLI+="line vty 0 10 \ntransport input telnet \ntransport output telnet\nlogin local\nexit\n";
			}
			else if($scope.basicSummary.enableSSH=="Enable"){
				// IMP! DO NOT remove the write mem. Its required.
				dayzeroConfigCLI+="line vty 0 10 \ntransport input ssh \ntransport output ssh\nlogin local\n exit\n";
				dayzeroConfigCLI+="ip domain-name "+$scope.basicSummary.domainName+"\n";
				dayzeroConfigCLI+="crypto key generate rsa modulus "+$scope.basicSummary.RSAKey+"\n";
			}
			if($scope.basicSummary.enableVTPTransparent=="Enable"){
				dayzeroConfigCLI+="vtp mode transparent\n";
			}
			// adding qos phones
			/* if(($scope.advSummary.enableQosPhones==translate("com_enable"))&&($scope.interSummary.accessPorts)){
				for(var index1=0;index1<$scope.interSummary.accessPorts.length;index1++){
					if($scope.interSummary.accessPorts[index1]!=translate("portconfig_options_none") && $scope.interSummary.accessPorts[index1]!=undefined){
						var autoQoSDetails = requestRoutingService.getShowCmdOutput("show auto qos interface "+$scope.interSummary.accessPorts[index1],"showAutoQoS");
						var autoQOS=autoQoSDetails.ShowAutoQoS.wnwebdata.autoQOS;
						dayzeroConfigCLI+="int "+ $scope.interSummary.accessPorts[index1]+"\n";
						if(autoQOS!=undefined){
							var cliExist = "auto qos "+autoQOS;
							if(cliExist != $scope.advSummary.enableAutoQosCli){
								dayzeroConfigCLI+="no auto qos "+autoQOS+"\n";
								dayzeroConfigCLI+=$scope.advSummary.enableAutoQosCli+"\n";
							}
						}else{
							dayzeroConfigCLI+=$scope.advSummary.enableAutoQosCli+"\n";
						}
						dayzeroConfigCLI+="exit\n";
					}
				}
			} */
			// adding qos uplink
			if($scope.basicSummary.enableQosUplink==translate("com_enable") && $scope.interSummary.uplinkPort){
							var autoQoSDetailsUplink = requestRoutingService.getShowCmdOutput("show auto qos interface "+$scope.interSummary.uplinkPort,"showAutoQoS");
							var autoQOSupLink=autoQoSDetailsUplink.ShowAutoQoS.wnwebdata.autoQOS;
							dayzeroConfigCLI+="int "+ $scope.interSummary.uplinkPort+"\n";
							if(autoQOSupLink!=undefined){
								var cliExist_uplink = "auto qos "+autoQOSupLink;
								if(cliExist_uplink != $scope.basicSummary.enableAutoQosCli){
									dayzeroConfigCLI+="no auto qos "+autoQOSupLink+"\n";
									dayzeroConfigCLI+=$scope.basicSummary.enableAutoQosUplinkCli+"\n";
								}
							}else{
								dayzeroConfigCLI+=$scope.basicSummary.enableAutoQosUplinkCli+"\n";
							}
							dayzeroConfigCLI+="exit\n";
			}
			
			//executing default qos related CLIs CSCvc01697
			if($scope.basicSummary.enableQosPhones==translate("com_enable") || $scope.basicSummary.enableQosUplink==translate("com_enable")){
				dayzeroConfigCLI+="mls qos map policed-dscp  0 10 18 24 46 to 8\n";
				dayzeroConfigCLI+="mls qos map cos-dscp 0 8 16 24 32 46 48 56\n";
				dayzeroConfigCLI+="mls qos srr-queue output cos-map queue 1 threshold 3 4 5\n";
				dayzeroConfigCLI+="mls qos srr-queue output cos-map queue 2 threshold 1 2\n";
				dayzeroConfigCLI+="mls qos srr-queue output cos-map queue 2 threshold 2 3\n";
				dayzeroConfigCLI+="mls qos srr-queue output cos-map queue 2 threshold 3 6 7\n";
				dayzeroConfigCLI+="mls qos srr-queue output cos-map queue 3 threshold 3 0\n";
				dayzeroConfigCLI+="mls qos srr-queue output cos-map queue 4 threshold 3 1\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 1 threshold 3 32 33 40 41 42 43 44 45\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 1 threshold 3 46 47\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 16 17 18 19 20 21 22 23\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 26 27 28 29 30 31 34 35\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 36 37 38 39\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 2 threshold 2 24\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 2 threshold 3 48 49 50 51 52 53 54 55\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 2 threshold 3 56 57 58 59 60 61 62 63\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 3 threshold 3 0 1 2 3 4 5 6 7\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 4 threshold 1 8 9 11 13 15\n";
				dayzeroConfigCLI+="mls qos srr-queue output dscp-map queue 4 threshold 2 10 12 14\n";
				dayzeroConfigCLI+="mls qos queue-set output 1 threshold 1 100 100 50 200\n";
				dayzeroConfigCLI+="mls qos queue-set output 1 threshold 2 125 125 100 400\n";
				dayzeroConfigCLI+="mls qos queue-set output 1 threshold 3 100 100 100 400\n";
				dayzeroConfigCLI+="mls qos queue-set output 1 threshold 4 60 150 50 200\n";
				dayzeroConfigCLI+="mls qos queue-set output 1 buffers 15 25 40 20\n";
				dayzeroConfigCLI+="mls qos\n";
			}
			// IMP! DO NOT remove the write mem. Its required.
			dayzeroConfigCLI+="ip http authentication local\n"
			dayzeroConfigCLI+="do write memory\n"
			dayzeroConfigCLI+="exit\n";
			if($scope.enableWirelessr && $scope.wirelesspossible){
				var wirelessData = {
					username: $scope.wireless.wifi.adminUserName,
					pass: $scope.wireless.wifi.adminPassword,
					verify_pass: $scope.wireless.wifi.confirmAdminPassword,
					day0SystemName: $scope.basicSummary.hostName + "-ME-WLC",
					day0ConfigCountry: "US", //Default, change below
					countryString: "US",
					day0Date:getDate(),
					day0Time:getTime(),
					day0ConfigTimezone: getTimezone(),
					dateString:getDate(true),
					timeString:getTime(),
					timezoneString: getTimezone().substr(2),
					day0MobilityGroupName: "Default",
					day0DhcpNetwork: "", //Hard coded value, as per ME expectation
					day0DhcpMask: "", //Hard coded value, as per ME expectation
					day0DhcpFirstIp: "", //Hard coded value, as per ME expectation
					day0DhcpLastIp: "", //Hard coded value, as per ME expectation
					day0DhcpGateway: "Network", //Hard coded value, as per ME expectation
					day0DefaultGatewayIp: "", //Hard coded value, as per ME expectation
					day0DnsDomainName: "", //Hard coded value, as per ME expectation
					day0DnsNameServer: "OpenDNS", //Hard coded value, as per ME expectation
					day0NativeVlanId: "0", //Hard coded value, as per ME expectation
					day0VirtualIPAddr: "192.0.2.1", //Hard coded value, as per ME expectation
					day0GuestNetworkName: "", //Hard coded value, as per ME expectation
					day0GuestSecurity: "WebConsent", //Hard coded value, as per ME expectation
					day0GuestVlan: "NewVLANForGuest", //Hard coded value, as per ME expectation
					day0GuestVlanIpAddr: "2.2.2.2", //Hard coded value, as per ME expectation
					day0GuestVlanSubnetMask: "255.255.0.0", //Hard coded value, as per ME expectation
					day0GuestVlanDefaultGateway: "2.2.2.1", //Hard coded value, as per ME expectation
					day0GuestVlanNumber: "", //Hard coded value, as per ME expectation
					day0GuestDHCPAddr: "", //Hard coded value, as per ME expectation
					day0TrafficType: "none", //Hard coded value, as per ME expectation
					day0RfDeploymentType: "0", //Hard coded value, as per ME expectation
					servicePortPresent: "0", //Hard coded value, as per ME expectation
					indexClicked: "0", //Hard coded value, as per ME expectation
					buttonClicked: "0", //Hard coded value, as per ME expectation
					err_flag: "0", //Hard coded value, as per ME expectation
					err_msg: "", //Hard coded value, as per ME expectation
					info_flag: "0", //Hard coded value, as per ME expectation
					info_msg: "", //Hard coded value, as per ME expectation
					day0NTPServer: "", //Hard coded value, as per ME expectation
					cfg_success: "0", //Hard coded value, as per ME expectation
					day0VRRPGroupID: "1", //Hard coded value, as per ME expectation
					csp_1_checkbox:"off", //Default value, changed below
					day0CorpVlan:"MgmtVLANForCorp", //Hard coded value, as per ME expectation
					day0DefaultGateway:"" //Default value, changed below
				};
				if($scope.wireless.wifi.mgmtIpAddress != "" && $scope.wireless.wifi.mgmtSubnetMask !=""){
					wirelessData.ipConfigurationCheckbox = "on";
					wirelessData.day0MgmtIpAddr = $scope.wireless.wifi.mgmtIpAddress;
					wirelessData.day0SubnetMask = $scope.wireless.wifi.mgmtSubnetMask;
				}
				if($scope.wireless.wifi.networkName != "" && $scope.wireless.networkSecurity != ""){
					wirelessData.csp_1_checkbox = "on";
					wirelessData.day0CorpNetworkName = $scope.wireless.wifi.networkName;
					wirelessData.day0CorpSecurity = $scope.wireless.networkSecurity === "WPA2 Enterprise" ?
									"WPA2Enterprise" : "WPA2Personal";
					wirelessData.day0CorpDHCPAddr = ""; //Hard coded value, as per ME expectation
				}
				//Try to get the country code
				try{
					wirelessData.day0ConfigCountry = angular.element('#countryId').data('kendoDropDownList').
						dataSource.options.data.filter(
							function(country) { 
								return country.name === $scope.wireless.country;})[0].code.trim();
					wirelessData.countryString = wirelessData.day0ConfigCountry;

				} catch (ex){
					//console.log("Unknown country: " + $scope.wireless.country + "Setting default to US");
				}
				/* if($scope.interSummary.newIpAddress){
					//TODO: VERIFY: this is the IP of the switch 
					wirelessData.day0DefaultGateway = $scope.interSummary.newIpAddress; 
				} */
				if($scope.interSummary.vlanIpAddress){
					//This is the IP of the wireless VLAN created in interface page
					//Wireless configuration is not possible without this VLAN IP
					if($scope.interSummary.vlanIpAddress.indexOf(":")==-1){
						//Hard coded value, as per ME expectation
						wirelessData.day0DefaultGateway=""
					}else{
						wirelessData.day0DefaultGateway = $scope.interSummary.vlanIpAddress;
					}					
				}
				if($scope.wireless.wifi.networkSecurity === "enterprise"){
					angular.extend(wirelessData, {
						day0AuthServerIPAddr: $scope.wireless.wifi.radiusServer,
						day0AuthServerSecret: $scope.wireless.wifi.sharedKey,
						day0AuthServerSecretConfirm: $scope.wireless.wifi.sharedKey
					});
					if($scope.wireless.wifi.authPort){
						//wirelessData.day0AuthPort = $scope.wireless.wifi.authPort;
					}
				}else{
					angular.extend(wirelessData, {
						day0CorpPassPhrase: $scope.wireless.wifi.pskPassword,
						day0CorpPassPhraseConfirm: $scope.wireless.wifi.confirmPskPassword
					});
				}
				var url = "http://"+controllerIP+"/screens/day0-config.html";				
				postMEData(url,wirelessData,dayzeroConfigCLI);
			} else {
				//Wired Only
				dayZeroStepService.setCli(dayzeroConfigCLI);
			}
		}
	});
	$scope.tabTog = function(){
		$('#summaryTabs').find('li').removeClass('k-state-default');
	};
	var getDate = function(isYYFormat){
		var dateVal = new Date(angular.element("#clock")[0].value);
		var date = dateVal.getDate() < 10 ? "0" + dateVal.getDate() : dateVal.getDate();
		var month = dateVal.getMonth() + 1;
		month = month<10 ? "0"+month : month;
		var year = dateVal.getFullYear();
		if(isYYFormat){
			year = year.toString().substr(2);
		}
		return (month+"/"+date+"/"+year); //Date in mm/dd/yyyy format
		//return dateVal.getUTCMonth()+1 + "/" + dateVal.getUTCDate() + "/" + dateVal.getUTCFullYear(); //Date in mm/dd/yyyy format
	};
	var getTime = function(){
		var dateVal = new Date(angular.element("#clock")[0].value);
		return dateVal.toTimeString().split(" ")[0]; 
		//return dateVal.toUTCString().split(" ")[4]; //UTC Time in hh:mm:ss format 
	};	
	var getTimezone = function(){
        tmSummer = new Date(Date.UTC(2005, 6, 30, 0, 0, 0, 0));
        so = -1 * tmSummer.getTimezoneOffset();
        tmWinter = new Date(Date.UTC(2005, 12, 30, 0, 0, 0, 0));
        wo = -1 * tmWinter.getTimezoneOffset();

        if (-660 == so && -660 == wo) return 't02';
        if (-600 == so && -600 == wo) return 't03';
        if (-570 == so && -570 == wo) return 't03';
        if (-540 == so && -600 == wo) return 't04';
        if (-540 == so && -540 == wo) return 't04';
        if (-480 == so && -540 == wo) return 't04';
        if (-480 == so && -480 == wo) return 't04';
        if (-420 == so && -480 == wo) return 't05';
        if (-420 == so && -420 == wo) return 't05';
        if (-360 == so && -420 == wo) return 't06';
        if (-360 == so && -360 == wo) return 't06';
        if (-360 == so && -300 == wo) return 't06';
        if (-300 == so && -360 == wo) return 't07';
        if (-300 == so && -300 == wo) return 't07';
        if (-240 == so && -300 == wo) return 't08';
        if (-240 == so && -240 == wo) return 't09';
        if (-240 == so && -180 == wo) return 't09';
        if (-180 == so && -240 == wo) return 't09';
        if (-180 == so && -180 == wo) return 't010';
        if (-180 == so && -120 == wo) return 't010';
        if (-150 == so && -210 == wo) return 't010';
        if (-120 == so && -180 == wo) return 't010';
        if (-120 == so && -120 == wo) return 't011';
        if (-60 == so && -60 == wo) return 't012';
        if (0 == so && -60 == wo) return 't012';
        if (0 == so && 0 == wo) return 't013';
        if (60 == so && 0 == wo) return 't013';
        if (60 == so && 60 == wo) return 't014';
        if (60 == so && 120 == wo) return 't014';
        if (120 == so && 60 == wo) return 't014';
        if (120 == so && 120 == wo) return 't015';
        if (180 == so && 120 == wo) return 't015';
        if (180 == so && 180 == wo) return 't016';
        if (240 == so && 180 == wo) return 't017';
        if (240 == so && 240 == wo) return 't017';
        if (270 == so && 210 == wo) return 't017';
        if (270 == so && 270 == wo) return 't018';
        if (300 == so && 240 == wo) return 't017';
        if (300 == so && 300 == wo) return 't019';
        if (330 == so && 330 == wo) return 't020';
        if (345 == so && 345 == wo) return 't021';
        if (360 == so && 300 == wo) return 't022';
        if (360 == so && 360 == wo) return 't020';
        if (390 == so && 390 == wo) return 't023';
        if (420 == so && 360 == wo) return 't022';
        if (420 == so && 420 == wo) return 't024';
        if (480 == so && 420 == wo) return 't025';
        if (480 == so && 480 == wo) return 't025';
        if (540 == so && 480 == wo) return 't026';
        if (540 == so && 540 == wo) return 't026';
        if (570 == so && 570 == wo) return 't027';
        if (570 == so && 630 == wo) return 't028';
        if (600 == so && 540 == wo) return 't028';
        if (600 == so && 600 == wo) return 't028';
        if (600 == so && 660 == wo) return 't028';
        if (630 == so && 660 == wo) return 't029';
        if (660 == so && 600 == wo) return 't029';
        if (660 == so && 660 == wo) return 't029';
        if (690 == so && 690 == wo) return 't029';
        if (720 == so && 660 == wo) return 't030';
        if (720 == so && 720 == wo) return 't030';
        if (720 == so && 780 == wo) return 't031';
        if (765 == so && 825 == wo) return 't030';
        if (780 == so && 780 == wo) return 't030';
        if (840 == so && 840 == wo) return 't030';
        return 't05';
	};
}]);
