/**
 Description: Controller for AAA
 Copyright (c) 2017 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller('aaaCtrl', ['$scope','$rootScope','$timeout', '$filter', 'gridCrudService','requestRoutingService','dataSourceService','dialogService','notificationService','getStringLineService','executeCliCmdService','validationService','aaaService',
    function($scope,$rootScope,$timeout, $filter, gridCrudService,requestRoutingService,dataSourceService,dialogService,notificationService,getStringLineService,executeCliCmdService,validationService,aaaService) {
		var translate = $filter("translate");
		var trimVal=$filter('trimValue');
		var totalRadiusServer= 0,totalTacacsServer= 0,totalLdapServer= 0;
		var oldAAAStatus, oldServerRadiusGridData = [];
		$scope.kendoWindow = {isEditMode:true,isEditMode1:true  };
		$scope.deleteRadiusServers=true;
		$scope.LocalAuthentication1 = [{"name" : 'None' ,"value" : 'none'},{"name" : 'Method List',"value" : 'methodlist'},{"name" : 'Default',"value" : 'default'}];
		$scope.LocalAuthorization1 = [{"name" : 'None' ,"value" : 'none'},{"name" : 'Method List',"value" : 'methodlist'},{"name" : 'Default',"value" : 'default'}];
		$scope.aaaAdvancedServerGroupOptions= [{"text" : 'None' ,"value" : 'none'},{"text" : 'RADIUS Group',"value" : 'radius'},{"text" : 'TACACS+ Group',"value" : 'tacacs+'},{"text" : 'LDAP Group',"value" : 'ldap'}];
		$scope.deleteaaaPolicy=true;
		$scope.disableApplyButton=true;
		angular.extend($scope, {
			 aaa:{
				servers:{
					radius:{
						aaaProtocol:null
					},
					policy:{
						aaaProtocol:null,
						aaapolicyProt:null
					}
				}
			}
		});
		if($rootScope.deviceInfo.type.indexOf("C1000")!=-1){
			$scope.ez1kDevice = true;
		}else{
			$scope.ez1kDevice = false;
		}
		angular.element(".btnView").hide();
		angular.element(".pageLoader").show();
		// AAA server start
		$scope.serverRadiusGridOptions = {
			editable : false,
			sortable : true,
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
				"template": "<input type=\"checkbox\" ng-init=\"radiusServer=false\" ng-model=\"radiusServer\" ng-click=\"selectRows(radiusServer,dataItem)\"/>",
				sortable: false,
				width: 40
			}, {
				field : "name",
				title : translate("com_name")
			}, {
				field : "address",
				title : translate("aaa_address")
			}, {
				field : "aaaProtocol",
				title : translate("etherchannel_protocol")
			}, {
				field : "test",
				template: "<img src='../resources/images/play_icon.png' width='20' id='#= name #' class='' ng-click=\"pingIP(dataItem,'#= name #')\" />",
				title : translate("com_ping")
			}]
		};
		$scope.protocolData = new kendo.data.DataSource({
			data : [{
					protocolName  : translate('aaa_radius'),
					protocolValue : 'radius'
				},{
					protocolName  : translate('aaa_tacacs'),
					protocolValue : 'tacacs'
				},{
					 protocolName  : translate('aaa_ldap'),
					 protocolValue : 'ldap'
			}]
		});
		//Kendo Validations
		$scope.aaaValidations = {
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
						else {
							return true;
						}
					}else{
						return true;
					}
				},
				validateip : function(input) {
					if (angular.isUndefined(input.data('validateIp'))) {
						return true;
					}
					var value = input.val();
					if (validationService.validateIpAddress(value) == false && validationService.validateIpv6Address(value) == false) {
							return false;
						}
					else {
						return true;
					}
				},
				aaaservers : function(input) {
					if (angular.isUndefined(input.data('aaaservers'))) {
						return true;
					} else {
						if (input.val().toUpperCase() == "RADIUS" || input.val().toUpperCase() == "TACACS" || input.val().toUpperCase() == "LDAP") {
							return false;
						} else {
							return true;
						}
					}
				},
				radiusduplicate: function(input){
                    if (angular.isUndefined(input.data('radiusduplicate'))) {
                        return true;
                    } else {
                        for (var index = 0; index < $scope.serverRadiusGridData.length; index++) {
                            if (($scope.serverRadiusGridData[index].name === $scope.aaa.servers.radius.name) && ($scope.serverRadiusGridData[index].aaaProtocol === $scope.aaa.servers.radius.aaaProtocol)){
                                return false;
                            }
                        }
                        return true;
                    }
                }
			}
		};
		var serverWindow = angular.element("#serverWindow");
		serverWindow.kendoWindow({
			modal: true,
			width: "800px",
			title: translate("aaa_server_title"),
			visible: false,
			actions: [
				"Close"
			]
		}).data("kendoWindow").center();
		$scope.doneAddEditKendoWindow = function(btnState){
			if($scope.radiusServersValidator.validate()){
				if($scope.aaa.servers.radius.created && btnState == "save"){
					if(!$scope.aaa.servers.radius.authport) {
						$scope.aaa.servers.radius.authport = "1645";
					}
					if(!$scope.aaa.servers.radius.acctport) {
						$scope.aaa.servers.radius.acctport = "1646";
					}
					$scope.serverRadiusGridData.push($scope.aaa.servers.radius);
				}else{
					$scope.updateAAAServerChange();
				}
				serverWindow.data("kendoWindow").close();
				$scope.applyAAAServer();
			}
		}
		$scope.protocolChange = function(){
			angular.element("#radiusServersForm  span.k-tooltip-validation").hide();
			if($scope.aaa.servers.radius.aaaProtocol == "radius"){
				$scope.aaa.servers.radius.name = "Radius_"+(parseFloat(totalRadiusServer)+1);
			}else if($scope.aaa.servers.radius.aaaProtocol == "tacacs"){
				$scope.aaa.servers.radius.name = "TACACS_"+(parseFloat(totalTacacsServer)+1);
			}else if($scope.aaa.servers.radius.aaaProtocol == "ldap"){
				$scope.aaa.servers.radius.name = "LDAP_"+(parseFloat(totalLdapServer)+1);
			}
		}
		$scope.globalStatusChange = function(){
			if(oldAAAStatus != $scope.aaaStatus){
				$scope.disableApplyButton= false;
			}else{
				$scope.disableApplyButton= true;
			}
		}
		$scope.addServerRadiusRow = function(){
			$scope.disableRadiusServersName = false;
			$scope.disableProtocolName = false;
			angular.element("#radiusServersForm  span.k-tooltip-validation").hide();
			$scope.aaa.servers.radius = {};
			$scope.aaa.servers.radius.aaaProtocol = "radius";
			if($scope.aaa.servers.radius.aaaProtocol == "radius"){
				$scope.aaa.servers.radius.name = "Radius_"+(parseFloat(totalRadiusServer)+1);
			}else if($scope.aaa.servers.radius.aaaProtocol == "tacacs"){
				$scope.aaa.servers.radius.name = "TACACS_"+(parseFloat(totalTacacsServer)+1);
			}else if($scope.aaa.servers.radius.aaaProtocol == "ldap"){
				$scope.aaa.servers.radius.name = "LDAP_"+(parseFloat(totalLdapServer)+1);
			}
			$scope.hideQuickSetupRadiusServers = false;
			$scope.aaa.servers.radius.created = true;
			serverWindow.data("kendoWindow").open().center();
			$scope.kendoWindow.isEditMode = true;
		}
		$scope.cancelAddEditKendoWindow = function(){
			serverWindow.data("kendoWindow").close();
		};
		$scope.deleteConfirmation = function (callbackname) {
            $scope.dlgAAA = dialogService.dialog({
                content : translate('msg_delete_confirmation'),
                title : translate('msg_delete_confirmation_window'),
                messageType : "confirm",
                actionButtons : [{
                    text : translate('com_ok'),
                    callback : callbackname
                }, {
                    text : translate('com_cancel')
                }]
            });
        };
		$scope.$on("deleteServer", function() {
            $scope.dlgAAA.data("kendoWindow").close();
            $scope.delServerRadiusRow();
        });
        $scope.cancelAuthentication = function(){
           $scope.aaa.servers.radius = {};
            $scope.hideQuickSetupRadiusServers = true;
        }
		$scope.selectedArray = [];
		$scope.selectRows = function (checked, dataItem) {
			if (checked == false) {
				var index = $scope.selectedArray.indexOf(dataItem);
				if (index > -1) {
					$scope.selectedArray.splice(index, 1);
					if($scope.selectedArray.length === 0){
						$scope.deleteRadiusServers = true;
					}
				}
			}
			else {
				$scope.deleteRadiusServers = false;
				$scope.selectedArray.push(dataItem);
			}
		};
		$scope.delServerRadiusRow = function() {
			$scope.deleteRadiusServers = true;
			$scope.deleteStaticArray = [];
			for (var index = 0; index < $scope.selectedArray.length; index++) {
				$scope.aaaServerRadiusGrid.dataSource.remove($scope.selectedArray[index]);
				$scope.deleteStaticArray.push($scope.selectedArray[index]);
			}
			$scope.selectedArray = [];
			$timeout(function(){
				$scope.deleteAAAServer();
			},10);
		};
		$scope.deleteAAAServer = function(){
			var deleteaaaConfigCli = "";
			for (var del = 0; del < $scope.deleteStaticArray.length; del++) {
				if($scope.deleteStaticArray[del].aaaProtocol == "radius"){
					deleteaaaConfigCli += "no radius server "+$scope.deleteStaticArray[del].name+"\n";
					deleteaaaConfigCli += "aaa server radius dynamic-author \n";
					deleteaaaConfigCli += "no client "+$scope.deleteStaticArray[del].address+ " server-key "+$scope.deleteStaticArray[del].password+"\n";
				}else if($scope.deleteStaticArray[del].aaaProtocol == "tacacs"){
					deleteaaaConfigCli += "no tacacs server "+$scope.deleteStaticArray[del].name+"\n";
				}else if($scope.deleteStaticArray[del].aaaProtocol == "ldap"){
					deleteaaaConfigCli += "no ldap server "+$scope.deleteStaticArray[del].name+"\n";
				}
			}
			deleteaaaConfigCli += "exit\n";
			if(deleteaaaConfigCli != ""){
				var result = requestRoutingService.getConfigCmdOutput(deleteaaaConfigCli);
				if(result==""){
					notificationService.showNotification(translate('aaa_success_msg'),translate('com_config_success_title'),'success');
				}else if(result.indexOf("WARNING:") >=0){					
					notificationService.showNotification(result,translate('com_warning'),'warning');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
			}
			$scope.loadAAAServer();
		}
		// Refresh button trigger
		angular.element("#aaaServerRadiusGrid").delegate(".k-pager-refresh", "click", function(){
			$scope.deleteRadiusServers = true;
			$scope.selectedArray = [];
			if (!$scope.$$phase){
				$scope.$apply();
			}
		});
		$scope.manualServerGridRefresh = function(){
			$scope.deleteRadiusServers = true;
			$scope.selectedArray = [];
			if (!$scope.$$phase){
				$scope.$apply();
			}
		}
		$scope.applyAAAStatus = function(){
			var aaaStatusConfigCli = "";
			if($scope.aaaStatus == translate("com_enable")){
				aaaStatusConfigCli += "aaa new-model \n";
			}else{
				aaaStatusConfigCli += "no aaa new-model \n";
			}
			aaaStatusConfigCli += "exit\n";
			if(aaaStatusConfigCli != ""){
				var result = requestRoutingService.getConfigCmdOutput(aaaStatusConfigCli);
				if(result==""){
					notificationService.showNotification(translate('aaa_success_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
			}
			$scope.disableApplyButton = true;
			$scope.loadAAAServer();
			$scope.loadServerGroupDetails();
		}
		$scope.isPing = false;
		$scope.onSelectAAAserverHandler = function(data) {
			if(!$scope.isPing){
				$scope.disableRadiusServersName = true;
				$scope.disableProtocolName = true;
				angular.element("#radiusServersForm  span.k-tooltip-validation").hide();
				$scope.aaa.servers.radius = angular.copy(data);
				$scope.kendoWindow.isEditMode = false;
				serverWindow.data("kendoWindow").open();
				$scope.aaa.servers.radius.created = false;
			}
		};
		var deleteIndex = "";
		$scope.updateAAAServerChange = function() {
			var selSRIndex = $scope.aaaServerRadiusGrid.dataSource.indexOf($scope.aaa.servers.radius);
			deleteIndex = selSRIndex;
			$scope.serverRadiusGridData[selSRIndex].aaaProtocol = $scope.aaa.servers.radius.aaaProtocol;
			$scope.serverRadiusGridData[selSRIndex].name = $scope.aaa.servers.radius.name;
			$scope.serverRadiusGridData[selSRIndex].address = $scope.aaa.servers.radius.address;
			if($scope.aaa.servers.radius.aaaProtocol == "radius"){
				if(!$scope.aaa.servers.radius.authport) {
					$scope.aaa.servers.radius.authport = "1645";
				}
				if(!$scope.aaa.servers.radius.acctport) {
					$scope.aaa.servers.radius.acctport = "1646";
				}
				$scope.serverRadiusGridData[selSRIndex].password = $scope.aaa.servers.radius.password;
				$scope.serverRadiusGridData[selSRIndex].authport = $scope.aaa.servers.radius.authport;
				$scope.serverRadiusGridData[selSRIndex].acctport = $scope.aaa.servers.radius.acctport;
			}else if($scope.aaa.servers.radius.aaaProtocol == "tacacs"){
				$scope.serverRadiusGridData[selSRIndex].password = $scope.aaa.servers.radius.password;
				$scope.serverRadiusGridData[selSRIndex].port = $scope.aaa.servers.radius.port;
			}else if($scope.aaa.servers.radius.aaaProtocol == "ldap"){
				$scope.serverRadiusGridData[selSRIndex].port = $scope.aaa.servers.radius.port;
				$scope.serverRadiusGridData[selSRIndex].ldapServerUserBaseDN = $scope.aaa.servers.radius.ldapServerUserBaseDN;
			}
		}
		$scope.pingIP = function(dataItem,curID){
			$scope.isPing = true;
			var pingConfigCli = "";
			if(dataItem.address){
				angular.element("#"+curID).attr("src", "");
				angular.element("#"+curID).attr("class", "fa fa-refresh fa-spin spinCust");
				$timeout(function(){
					 pingConfigCli = requestRoutingService.getShowCmdOutput("ping "+dataItem.address+" \n");
					 angular.element("#"+curID).attr("class", "");
					 if(pingConfigCli.indexOf("Success rate is")!=-1){
	           	            var successStatusPer = executeCliCmdService.getNextString(pingConfigCli,["Success rate is "],["percent"]);
							if(successStatusPer == 0){
								angular.element("#"+curID).attr("src", "../resources/images/play_icon.png");
								notificationService.showNotification(pingConfigCli,translate('trouble_shoot_noreply_received'),'error');
							}else{
								angular.element("#"+curID).attr("src", "../resources/images/play_icon_on.png");
								notificationService.showNotification(pingConfigCli,translate("trouble_shoot_success_rate")+":"+successStatusPer+" %",'success');
							}
					 }else{
						  angular.element("#"+curID).attr("src", "../resources/images/play_icon.png");
						  notificationService.showNotification(pingConfigCli,translate('trouble_shoot_noreply_received'),'error');
					 }
					 $scope.isPing = false;
				 },100);
			}
		}
		$scope.applyAAAServer = function(){
			var aaaConfigCli = "";
			if($scope.aaa.servers.radius.aaaProtocol == "radius"){
				aaaConfigCli += "radius server "+ $scope.aaa.servers.radius.name+"\n";
				if($scope.aaa.servers.radius.address.indexOf(':')==-1 && $scope.aaa.servers.radius.address.indexOf('::')==-1){
				aaaConfigCli += "address ipv4 "+$scope.aaa.servers.radius.address+" auth-port "+$scope.aaa.servers.radius.authport+" acct-port "+
				$scope.aaa.servers.radius.acctport+"\n";
				}else{
				aaaConfigCli += "address ipv6 "+$scope.aaa.servers.radius.address+" auth-port "+$scope.aaa.servers.radius.authport+" acct-port "+
				$scope.aaa.servers.radius.acctport+"\n";	
				}
				if($scope.aaa.servers.radius.password){
					aaaConfigCli += "key "+ $scope.aaa.servers.radius.password+"\n";
				}
				aaaConfigCli += "exit\n";
				aaaConfigCli += "aaa server radius dynamic-author \n";
				if(deleteIndex.toString() != "" && oldServerRadiusGridData.length > 0){
					aaaConfigCli += "no client "+oldServerRadiusGridData[deleteIndex].address+" server-key "+oldServerRadiusGridData[deleteIndex].password+ "\n";
				}
				aaaConfigCli += "client "+$scope.aaa.servers.radius.address+" server-key "+$scope.aaa.servers.radius.password+ "\n";
			}else if($scope.aaa.servers.radius.aaaProtocol == "tacacs"){
				aaaConfigCli += "tacacs server "+ $scope.aaa.servers.radius.name+"\n";
				if($scope.aaa.servers.radius.address.indexOf(':')==-1 && $scope.aaa.servers.radius.address.indexOf('::')==-1){
					aaaConfigCli += "address ipv4 "+$scope.aaa.servers.radius.address+"\n";
				}else{
					aaaConfigCli += "address ipv6 "+$scope.aaa.servers.radius.address+"\n";
				}
				
				if($scope.aaa.servers.radius.port){
					aaaConfigCli += "port "+$scope.aaa.servers.radius.port+"\n";
				}
				if($scope.aaa.servers.radius.password){
					aaaConfigCli += "key "+ $scope.aaa.servers.radius.password+"\n";
				}
			}else if($scope.aaa.servers.radius.aaaProtocol == "ldap"){
				aaaConfigCli += "ldap server "+ $scope.aaa.servers.radius.name+"\n";
				if($scope.aaa.servers.radius.address.indexOf(':')==-1 && $scope.aaa.servers.radius.address.indexOf('::')==-1){
				aaaConfigCli += "ipv4 "+$scope.aaa.servers.radius.address+"\n";
				}else{
				aaaConfigCli += "ipv6 "+$scope.aaa.servers.radius.address+"\n";	
				}
				aaaConfigCli += "base-dn "+$scope.aaa.servers.radius.ldapServerUserBaseDN+"\n";
				if($scope.aaa.servers.radius.port){
					aaaConfigCli += "transport port "+$scope.aaa.servers.radius.port+"\n";
				}
			}
			aaaConfigCli += "exit\n";
			if(aaaConfigCli != ""){
				var result = requestRoutingService.getConfigCmdOutput(aaaConfigCli);
				if(result==""){
					notificationService.showNotification(translate('aaa_success_msg'),translate('com_config_success_title'),'success');
				}else if(result.indexOf("WARNING:") >=0){					
					notificationService.showNotification(result,translate('com_warning'),'warning');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
			}
			$scope.loadAAAServer();
		}
		var aaaServerDataChk = [];
		$scope.loadAAAServer = function(){
			$scope.aaaServerRadiusName = [];
			$scope.aaaServerTacacsName = [];
			$scope.aaaServerLdapName = [];
			totalRadiusServer= 0,totalTacacsServer= 0,totalLdapServer= 0;
			$scope.serverRadiusGridData = new kendo.data.ObservableArray([]);
			aaaServerDataChk = deviceCommunicatorCLI.getExecCmdOutput("show running-config aaa\n show running-config aaa radius-server\n show running-config aaa tacacs-server\n show running-config aaa ldap");
			var aaaStatus = aaaServerDataChk[0].indexOf("no aaa new-model");
			if(aaaStatus != -1){
				$scope.aaaStatus = translate("com_disable");
				oldAAAStatus = translate("com_disable");
			}else{
				$scope.aaaStatus = translate("com_enable");
				oldAAAStatus = translate("com_enable");
			}
			var radiusServerData = aaaServerDataChk[1].split("radius server");
			if(!angular.isUndefined(radiusServerData)){
				for(var i = 1; i < radiusServerData.length; i++){
					totalRadiusServer++;
					var intShowRun="radius server "+radiusServerData[i];
					var ipaddress= ""
					if(intShowRun.indexOf("address ipv6")!=-1){
						ipaddress = executeCliCmdService.getNextString(intShowRun,["address ipv6"],["\n"]).trim().split(" ")[0];
					}else{
						ipaddress = executeCliCmdService.getNextString(intShowRun,["address ipv4"],["\n"]).trim().split(" ")[0];
					}
					$scope.aaaServerRadiusName.push({'sName':executeCliCmdService.getNextString(intShowRun,["radius server"],["\n"]).trim(),'sValue':executeCliCmdService.getNextString(intShowRun,["radius server"],["\n"]).trim()})
					$scope.serverRadiusGridData.push({
							"name":executeCliCmdService.getNextString(intShowRun,["radius server"],["\n"]).trim(),
							"address": ipaddress,
							"aaaProtocol":"radius",
							"password": executeCliCmdService.getNextString(intShowRun,["key"],["\n"]).trim(),
							"authport":executeCliCmdService.getNextString(intShowRun,["address ipv4"],["\n"]).trim().split(" ")[2],
							"acctport":executeCliCmdService.getNextString(intShowRun,["address ipv4"],["\n"]).trim().split(" ")[4]
						}
					);
				}
			}
			var tacacsServerData = aaaServerDataChk[2].split("tacacs server");
			if(!angular.isUndefined(tacacsServerData)){
				for(var i = 1; i < tacacsServerData.length; i++){
					totalTacacsServer++;
					var intShowRun="tacacs server "+tacacsServerData[i];
					var ipaddressTacacs = "";
					if(intShowRun.indexOf("address ipv6")!=-1){
						ipaddressTacacs = executeCliCmdService.getNextString(intShowRun,["address ipv6"],["\n"]).trim().split(" ")[0];
					}else{
						ipaddressTacacs = executeCliCmdService.getNextString(intShowRun,["address ipv4"],["\n"]).trim().split(" ")[0];
					}
					$scope.aaaServerTacacsName.push({'sName':executeCliCmdService.getNextString(intShowRun,["tacacs server"],["\n"]).trim(),'sValue':executeCliCmdService.getNextString(intShowRun,["tacacs server"],["\n"]).trim()})
					$scope.serverRadiusGridData.push({
							"name":executeCliCmdService.getNextString(intShowRun,["tacacs server"],["\n"]).trim(),
							"address": ipaddressTacacs,
							"aaaProtocol":"tacacs",
							"password": executeCliCmdService.getNextString(intShowRun,["key"],["\n"]).trim(),
							"port": executeCliCmdService.getNextString(intShowRun,["port"],["\n"]).trim()
						}
					);
				}
			}
			var ldapServerData = aaaServerDataChk[3].split("ldap server");
			if(!angular.isUndefined(ldapServerData)){
				for(var i = 1; i < ldapServerData.length; i++){
					totalLdapServer++;
					var intShowRun="ldap server "+ldapServerData[i];
					var ipaddressLdap = "";
					if(intShowRun.indexOf("ipv6")!=-1){
						ipaddressLdap = executeCliCmdService.getNextString(intShowRun,["ipv6"],["\n"]).trim().split(" ")[0];
					}else{
						ipaddressLdap = executeCliCmdService.getNextString(intShowRun,["ipv4"],["\n"]).trim().split(" ")[0];
					}
					$scope.aaaServerLdapName.push({'sName':executeCliCmdService.getNextString(intShowRun,["ldap server"],["\n"]).trim(),'sValue':executeCliCmdService.getNextString(intShowRun,["ldap server"],["\n"]).trim()})
					$scope.serverRadiusGridData.push({
							"name":executeCliCmdService.getNextString(intShowRun,["ldap server"],["\n"]).trim(),
							"address": ipaddressLdap,
							"aaaProtocol":"ldap",
							"ldapServerUserBaseDN": executeCliCmdService.getNextString(intShowRun,["base-dn"],["\n"]).trim(),
							"port": executeCliCmdService.getNextString(intShowRun,["transport port"],["\n"]).trim()
						}
					);
				}
			}
			$scope.aaaServerNameRadiusData = angular.copy($scope.aaaServerRadiusName);
				$scope.aaaServerNameRadius = new kendo.data.DataSource({
					data: $scope.aaaServerNameRadiusData
				});
			$scope.aaaServerNameTacacsData = angular.copy($scope.aaaServerTacacsName);
				$scope.aaaServerNameTacacs = new kendo.data.DataSource({
					data: $scope.aaaServerNameTacacsData
				});
			$scope.aaaServerNameLdapData = angular.copy($scope.aaaServerLdapName);
				$scope.aaaServerNameLdap = new kendo.data.DataSource({
					data: $scope.aaaServerNameLdapData
				});
			oldServerRadiusGridData = angular.copy($scope.serverRadiusGridData);
			$scope.serverRadiusGridDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.serverRadiusGridData
			});
			angular.element(".pageLoader").hide();
			angular.element(".btnView").show();		
			$scope.manualServerGridRefresh();
		}
		$scope.loadAAAServer();
		// AAA server end
		
		
		//AAA Server Groups Start
		var isServerGroupEditModeFlag = false;
		$scope.loadServerGroupDetails = function(){
			$scope.deleteServerGroups = true;
			var radiusServerGoup = [], serverGroupCLIData = [], showServerGroupList = [],groupNameAndType,boolValue = false,splittedServerGroup = [];
			serverGroupCLIData = aaaServerDataChk[0];
			radiusServerGoup = serverGroupCLIData.split("aaa group server ");
			if(radiusServerGoup.length > 1){
				for(var i=1;i<radiusServerGoup.length;i++){
					var groupList="aaa group server "+radiusServerGoup[i];
					var groupDetails = executeCliCmdService.getNextString(groupList, ["aaa group server "], ["\n"]).trim();
					groupType = groupDetails.split(" ")[0];
					groupName = groupDetails.split(" ")[1];
					deadtime = executeCliCmdService.getNextString(groupList, ["deadtime "], ["\n"]).trim();
					if("tacacs+" == groupType){
						groupType = "tacacs";
					}
					var serverList=[];
					 var strLines = getStringLineService.getLines(groupList,["server"]);
		                if (strLines != null) {
		                    for (var m=0; m<strLines.length; m++) {
		                    	serverList.push(executeCliCmdService.getNextString(strLines[m], ["server "], ["\n"]).trim())
		                    }
		                }
						var serverNameRadius = '';
						var serverNameTacacs = '';
						var serverNameLdap = '';
						$scope.oldserverNameRadius = '';
						$scope.oldserverNameTacacs = '';
						$scope.oldserverNameLdap = '';
						if($scope.ez1kDevice){
							var strLines1 = getStringLineService.getLines(groupList,[" server name"]);
							if (strLines != null) {
							for (var m=0; m<=strLines1.length; m++) {
		                    	
								if(groupType == 'radius'){
									serverNameRadius = executeCliCmdService.getNextString(strLines[m], [" server name "], ["\n"]).trim();
									$scope.oldserverNameRadius = serverNameRadius;
								}else if(groupType == 'tacacs'){
									serverNameTacacs = executeCliCmdService.getNextString(strLines[m], [" server name "], ["\n"]).trim();
									$scope.oldserverNameTacacs = serverNameTacacs;
								}else if(groupType == 'ldap'){
									serverNameLdap = executeCliCmdService.getNextString(strLines[m], [" server name "], ["\n"]).trim();
									$scope.oldserverNameLdap = serverNameLdap;
								}
		                      }	
							}
						}
						
						
						
					var items = {
	    					"groupName"   : groupName,
	    					"groupType" : groupType,
	    					"deadtime" : deadtime,
	    					"serverNameRadius" : serverNameRadius,
	    					"serverNameTacacs" : serverNameTacacs,
	    					"serverNameLdap" : serverNameLdap,
	    					"assignedGrpServerList" :serverList
	    			};
			    	showServerGroupList.push(items);
				}
				
			}
			$scope.serverGroupData = new kendo.data.ObservableArray(showServerGroupList);
			$scope.serverGroupDataSource = new kendo.data.DataSource({
				pageSize : 10,
				data : $scope.serverGroupData
			});
			$scope.servergroupsGridOptions = {
					dataSource: $scope.serverGroupDataSource,
					editable : false,
					sortable : true,
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
						"template": "<input type=\"checkbox\" ng-init=\"radiusServer=false\" ng-model=\"groupServerChecked\" ng-click=\"isServerGrpDeleteChecked(groupServerChecked,dataItem)\"/>",
						sortable: false,
						width: 40
					}, {
						field : "groupName",
						title : translate("aaa_serverGroup_name")
					}, {
						field : "groupType",
						title : translate("etherchannel_protocol")
					}]
				};
		}
		
		
		$scope.onClickAAAServerGroupTab = function(){
			$scope.loadServerGroupDetails();
			angular.element("#groupTypeName").data('kendoDropDownList').refresh();
		}
		
		
		var serverGroupsWindow = angular.element("#serverGroupsWindow");
		serverGroupsWindow.kendoWindow({
			modal: true,
			width: "800px",
			title: translate("Server Groups"),
			visible: false,
			actions: [
				"Close"
			]
		}).data("kendoWindow").center();
		
		$scope.serverGroup = {
				groupName: null,
				groupType: "radius",
				deadTime: null,
				availableServer : null,
				selectedServerList : null,
				availableGrpServerList:[],
				assignedGrpServerList:[],
				serverNameRadius:null,
				serverNameTacacs:null,
				serverNameLdap:null
		};
		
		var serverGroupConfigCLI="";
		$scope.onSelectAAAServerGroupData = function(data) {
			angular.element("#serverGroupsForm  span.k-tooltip-validation").hide();
			$scope.isServerGroupEditModeFlag = true;
			$scope.serverGroup = angular.copy(data);
			$scope.availableGroupOptions = [];
			$scope.filterAvailabledServerGrps($scope.serverRadiusGridData,$scope.serverGroup.groupType);
			$scope.selectedServerGroupOptions = $scope.serverGroup.assignedGrpServerList;
			$scope.selectedServerGroupOptions.splice(0, 1);
			if($scope.selectedServerGroupOptions.length > 0){
				$scope.filterAssignedServerGrps($scope.selectedServerGroupOptions);
				$scope.filterAvailOrignalList($scope.availableGroupOptions,$scope.selectedServerGroupOptions);
			}else{
				$scope.selectedServerGroupOptions = [];
			}
			$timeout(function(){
				serverGroupsWindow.data("kendoWindow").open().center();;
				$scope.serverGroupShowEditSection = true;
			});
		};
		
		$scope.filterAssignedServerGrps = function(value) {
			for(i=0; i<value.length;i++){
			    for(j=0; j<$scope.serverRadiusGridData.length;j++){
			        if(value[i] === $scope.serverRadiusGridData[j].address){
			        	$scope.selectedServerGroupOptions[i] = value[i]+"("+$scope.serverRadiusGridData[j].name+")";
			        }
			    }
		    }
		}
		
		$scope.filterAvailabledServerGrps = function(value,groupType) {
			for(i=0; i<value.length;i++){
				if(value[i].aaaProtocol == groupType && value[i].address != ""){
					$scope.availableGroupOptions.push(value[i].address+"("+value[i].name+")");
				}
		    }
		}
		
		$scope.filterAvailOrignalList = function(availableServerGrp,assignedServerGrp) {
			for(i=0; i<availableServerGrp.length;i++){
			    for(j=0; j<assignedServerGrp.length;j++){
			        if(availableServerGrp[i] === availableServerGrp[j]){
			        	availableServerGrp.splice(i,1);
			        }
			    }
			}
		}
		
		/*$scope.loadServerGroupDetails();*/
		$scope.addServerGroupsRow = function(){
			$scope.serverGroup.groupName = ""
			$scope.serverGroup.deadtime = ""
			$scope.availableGroupOptions = [];
			$scope.selectedServerGroupOptions = [];
			angular.element("#serverGroupsForm  span.k-tooltip-validation").hide();
			if($scope.serverRadiusGridData.length > 0){
				for(var i=0;i<$scope.serverRadiusGridData.length;i++){
					if($scope.serverRadiusGridData[i].aaaProtocol == "radius" && $scope.serverRadiusGridData[i].address != "" && $scope.serverRadiusGridData[i].address.indexOf(':') == -1){
						$scope.availableGroupOptions.push($scope.serverRadiusGridData[i].address+"("+$scope.serverRadiusGridData[i].name+")");
					}
				}
			}
			angular.element("#serverNameRadius").data('kendoDropDownList').value($scope.serverGroup.serverNameRadius);
			 angular.element("#serverNameTacacs").data('kendoDropDownList').value($scope.serverGroup.serverNameTacacs);
			 angular.element("#serverNameLdap").data('kendoDropDownList').value($scope.serverGroup.serverNameLdap);
			$scope.serverGroupShowEditSection = true;
			$scope.isServerGroupEditModeFlag = false;
			serverGroupsWindow.data("kendoWindow").open().center();
		}
		
		$scope.cancelServerGroupsWindow = function(){
			serverGroupsWindow.data("kendoWindow").close();
		};
		
		$scope.updateAssignedServers = function(protocolType){
			$scope.availableGroupOptions = [];
			if($scope.serverRadiusGridData.length > 0){
				for(var i=0;i<$scope.serverRadiusGridData.length;i++){
					if($scope.serverRadiusGridData[i].aaaProtocol == protocolType && $scope.serverRadiusGridData[i].address != ""){
						$scope.availableGroupOptions.push($scope.serverRadiusGridData[i].address+"("+$scope.serverRadiusGridData[i].name+")");
					}
				}
			}
		};
		
		// Server Group Form validation
		var serverGroupValidations = angular.element("#serverGroupsForm").kendoValidator({
			rules: {
				duplicate:function(input){
					var valMsg = input.data('duplicateMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(!$scope.rmonDirty){
						return true;
					}
					return true;
				},
				range: function (input) {
					if(input.val() != ""){
						var valMsg = input.data('rangeMsg');
						if ((valMsg==undefined)) {
							return true;
						}
						var min= input.prop('min');
						var max= input.prop('max');
						if(parseFloat(input.val())>=min && parseFloat(input.val())<=max){
							return true;
						}
						return false;
					}else{
						return true;
					}
					
				}
			}
		}).data("kendoValidator");
		

		
		//Save and Update Server Group Data
		$scope.doneAddEditServerGrpKendoWindow = function(btnState){
			if(serverGroupValidations.validate()){
					if($scope.selectedServerGroupOptions.length > 0 || $scope.ez1kDevice){
						$scope.assignedServerCheck = false;
						if(btnState == "save"){
							serverGroupConfigCLI += "aaa group server "+$scope.serverGroup.groupType+" "+$scope.serverGroup.groupName+"\n";
							if($scope.ez1kDevice){
								$scope.oldserverNameRadius = '';
								$scope.oldserverNameTacacs = '';
								$scope.oldserverNameLdap = '';
								if($scope.serverGroup.groupType == "radius"){
									if($scope.oldserverNameRadius){
									serverGroupConfigCLI += "no server name "+$scope.oldserverNameRadius+"\n";
									}
									serverGroupConfigCLI += "server name "+$scope.serverGroup.serverNameRadius+"\n";
								}else if($scope.serverGroup.groupType == "tacacs"){
									if($scope.oldserverNameTacacs){
									serverGroupConfigCLI += "no server name "+$scope.oldserverNameTacacs+"\n";
									}
									serverGroupConfigCLI += "server name "+$scope.serverGroup.serverNameTacacs+"\n";
								}else{
									if($scope.oldserverNameLdap){
									serverGroupConfigCLI += "no server name "+$scope.oldserverNameLdap+"\n";
									}
									serverGroupConfigCLI += "server name "+$scope.serverGroup.serverNameLdap+"\n";
								}
							}else{
								if($scope.selectedServerGroupOptions.length > 0){
									for(var i=0;i<$scope.selectedServerGroupOptions.length;i++){
										var splittedIp = $scope.selectedServerGroupOptions[i].split("(")[0];
										serverGroupConfigCLI += "server "+splittedIp+"\n";
									}
								}
							}
							if($scope.serverGroup.groupType == "radius"){
								if ($scope.serverGroup.deadtime != undefined && $scope.serverGroup.deadtime != "") {
									serverGroupConfigCLI += "deadtime "+$scope.serverGroup.deadtime+"\n";
								}
							}
						}else{
							serverGroupConfigCLI += "aaa group server "+$scope.serverGroup.groupType+" "+$scope.serverGroup.groupName+"\n";
							if($scope.ez1kDevice){
								if($scope.serverGroup.groupType == "radius"){
									if($scope.oldserverNameRadius){
									serverGroupConfigCLI += "no server name "+$scope.oldserverNameRadius+"\n";
									}
									serverGroupConfigCLI += "server name "+$scope.serverGroup.serverNameRadius+"\n";
								}else if($scope.serverGroup.groupType == "tacacs"){
									if($scope.oldserverNameTacacs){
									serverGroupConfigCLI += "no server name "+$scope.oldserverNameTacacs+"\n";
									}
									serverGroupConfigCLI += "server name "+$scope.serverGroup.serverNameTacacs+"\n";
								}else{
									if($scope.oldserverNameLdap){
									serverGroupConfigCLI += "no server name "+$scope.oldserverNameLdap+"\n";
									}
									serverGroupConfigCLI += "server name "+$scope.serverGroup.serverNameLdap+"\n";
								}
							}else{
								if($scope.selectedServerGroupOptions.length > 0){
									for(var i=0;i<$scope.selectedServerGroupOptions.length;i++){
										var splittedIp = $scope.selectedServerGroupOptions[i].split("(")[0];
										serverGroupConfigCLI += "server "+splittedIp+"\n";
									}
								}
							}
							if($scope.serverGroup.groupType == "radius"){
								if ($scope.serverGroup.deadtime != undefined && $scope.serverGroup.deadtime != "") {
									serverGroupConfigCLI += "deadtime "+$scope.serverGroup.deadtime+"\n";
								}
							}
							
						}
						$scope.applyServerGroup();
						serverGroupsWindow.data("kendoWindow").close();
						$scope.serverGroupShowEditSection = false;
					}else{
						$scope.assignedServerCheck = true;
					}
				}
		}
		
		$scope.applyServerGroup=function(){
			var result = requestRoutingService.getConfigCmdOutput(serverGroupConfigCLI);
			if(result==""){
				notificationService.showNotification('Server Group Data is successfully Applied',translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
			serverGroupConfigCLI="";
			isServerGroupEditModeFlag = true;
			$scope.assignedServerCheck = false;
			$scope.loadAAAServer();
			$scope.loadServerGroupDetails();
			
		}
		
		$scope.moveToServerGroupOption = function() {
            $scope.moveItemsBetweenLists($scope.availableGroupOptions, $scope.selectedServerGroupOptions, $scope.serverGroup.availableServer);
		};
	
		$scope.moveFromServerGroupOption = function() {
	            $scope.moveItemsBetweenLists($scope.selectedServerGroupOptions, $scope.availableGroupOptions, $scope.serverGroup.selectedServerList);
	            if($scope.selectedServerGroupOptions.length == 0){
	            	$scope.selectedServerGroupOptions = [];
	            	$scope.assignedServerCheck = true;
	            }
		};
		
		$scope.$on("okDeleteServerGroup", function() {
		        $scope.serverGrpDlg.data("kendoWindow").close();
		        $scope.deleteServerGrpRow();
		});
		    
	    $scope.$on("cancel", function() {
	    	isServerGroupEditModeFlag = true;
			$scope.serverGrpDlg.data("kendoWindow").close();
			angular.element('#aaaServerGroupsGrid').data('kendoGrid').refresh();
			$scope.delServerGrpArray = [];
	    });
		
		//Confirmation Window For Delete Server Group Data.
	    $scope.serverGroupDeleteConfirm = function() {
	    	$scope.serverGrpDlg = dialogService.dialog({
	            content: translate('msg_delete_confirmation'),
	            title: translate('msg_delete_confirmation_window'),
	            messageType: "confirm",
	            actionButtons: [{
	                text: translate('com_ok'),
	                callback: "okDeleteServerGroup"
	            }, {
	                text: translate('com_cancel'),
	                callback: "cancel"
	            }]
	        });
	    };
	    
	    $scope.delServerGrpArray = [];
	    $scope.isServerGrpDeleteChecked = function(checked, dataItem) {
	        if (checked == false) {
	            var index = $scope.delServerGrpArray.indexOf(dataItem);
	            if (index > -1) {
	            	$scope.delServerGrpArray.splice(index, 1);
	            }
	        } else {
	            $scope.delServerGrpArray.push(dataItem);
	        }
	        if ($scope.delServerGrpArray.length > 0) {
	        	$scope.deleteServerGroups = false;
	        } else {
	        	$scope.deleteServerGroups = true;
	        }
	    };
	    
	  //Delete Server Group Data.
	    $scope.deleteServerGrpRow = function() {
	        var selectedItem = $scope.delServerGrpArray;
	        $scope.delServerGrpArray = [];
	        for (var i = 0; i < selectedItem.length; i++) {
	        	serverGroupConfigCLI += "no aaa group server  " + selectedItem[i].groupType + " " +selectedItem[i].groupName+ " \n";
	            $scope.aaaServerGroupsGrid.dataSource.remove(selectedItem[i]);
	        }
	        $scope.deleteServerGroups =true;
	        $scope.applyServerGroup();
			$scope.cancelServerGroupsWindow();
	    }
		
		$timeout(function(){
	        angular.element("#aaaServerGroupsGrid").find('.k-pager-refresh').click(function(){
	            $scope.manualServerGroupGridRefresh();
	        });
	    },10);
		 $scope.manualServerGroupGridRefresh = function(){
			angular.element("#aaaServerGroupsGrid  span.k-tooltip-validation").hide();
			$scope.serverGroupShowEditSection = false;
			$scope.deleteServerGroups = true;
		 }
		//AAA Server Groups End
		
		 
		
		 
		$scope.aaaAdvanced = {
			retransmitInterval:null,
			timeoutInterval:null,
			deadtime:null,
			commit:false,
			discard:false,
			clear:false,
			localAuthentication:'none',
			localAuthorization:'none',
			radiusServerLoadBalance:translate("com_disable"),
			consoleAuthMethod:'none',
			defaultAuthMethod:'none',
			mschapAuthMethod:'none',
			retransmitIntervalOld:null,
			timeoutIntervalOld:null,
			deadtimeOld:null,
			commit:false,
			discard:false,
			clear:false,
			localAuthenticationOld:'none',
			localAuthorizationOld:'none',
			radiusServerLoadBalanceOld:translate("com_disable"),
			consoleAuthMethodOld:'none',
			defaultAuthMethodOld:'none',
			mschapAuthMethodOld:'none'
			
		 }
		 
		 var aaaAdvancedConfigCLI="";
		 $scope.$watch('$scope.disableApplyRadiusFallback', $scope.validateForAAAAdvancedConfig);
					$scope.validateForAAAAdvancedConfig = function() {
						 $scope.disableApplyRadiusFallback = false;
					 };
		 $scope.checkStatus = function() {
			 $scope.disableApplyRadiusFallback = false;
		 };
		 
		 
		 $scope.onClickAAAAdvanceTab = function(){
			 //$scope.aaaAdvanced = angular.copy(aaaAdvanced);
			 $scope.loadAAAServer();
			 $scope.loadAAAAdvanceData();
			 $scope.disableApplyRadiusFallback = true;
		     angular.element("#aaaAdvancedLocalAuthentication").data('kendoDropDownList').value($scope.aaaAdvanced.localAuthentication);
			 angular.element("#aaaAdvancedLocalAuthorization").data('kendoDropDownList').value($scope.aaaAdvanced.localAuthorization);
			 angular.element("#consoleConfAuthMethod").data('kendoDropDownList').value($scope.aaaAdvanced.consoleAuthMethod);
			 angular.element("#defaultConfAuthMethod").data('kendoDropDownList').value($scope.aaaAdvanced.defaultAuthMethod);
			 angular.element("#mschapConfAuthMethod").data('kendoDropDownList').value($scope.aaaAdvanced.mschapAuthMethod);
		 }
		 
		 // AAA Configuration Validation
		 var aaaConfServerValidation = angular.element("#aaaConfServerId").kendoValidator({
			rules: {
				range: function (input) {
					if(input.val() != ""){
						var valMsg = input.data('rangeMsg');
						if ((valMsg==undefined)) {
							return true;
						}
						var min= input.prop('min');
						var max= input.prop('max');
						if(parseFloat(input.val())>=min && parseFloat(input.val())<=max){
							return true;
						}
						return false;
					}else{
						return true;
					}
				}
			}
		 }).data("kendoValidator");
		 
		 $scope.loadAAAAdvanceData = function(){
			 var radiusServerAdvanceCLIData = [],radiusServerAdvList = [],localAAAConfList = [],localAAAMethodList = [];
			 radiusServerAdvanceCLIData = aaaServerDataChk[1];
			 localAAAConfList = aaaServerDataChk[0].split("aaa local ");
			 localAAAMethodList = aaaServerDataChk[0].split("aaa authentication login ");
			 radiusServerAdvList = radiusServerAdvanceCLIData.split("radius-server ");
			 if(radiusServerAdvList.length > 1){
				 for(var i=1;i<radiusServerAdvList.length;i++){
					 if(radiusServerAdvList[i].indexOf("retransmit ") != -1){
						 $scope.aaaAdvanced.retransmitInterval = executeCliCmdService.getNextString(radiusServerAdvList[i], ["retransmit "], ["\n"]).trim();
						 $scope.aaaAdvanced.retransmitIntervalOld = angular.copy($scope.aaaAdvanced.retransmitInterval);
					 }
					 if(radiusServerAdvList[i].indexOf("timeout ") != -1){
						 $scope.aaaAdvanced.timeoutInterval = executeCliCmdService.getNextString(radiusServerAdvList[i], ["timeout "], ["\n"]).trim();
						 $scope.aaaAdvanced.timeoutIntervalOld = angular.copy($scope.aaaAdvanced.timeoutInterval);
					 }
					 if(radiusServerAdvList[i].indexOf("deadtime ") != -1){
						 $scope.aaaAdvanced.deadtime = executeCliCmdService.getNextString(radiusServerAdvList[i], ["deadtime "], ["\n"]).trim();
						 $scope.aaaAdvanced.deadtimeOld = angular.copy($scope.aaaAdvanced.deadtime);
					 }
					 if(radiusServerAdvList[i].indexOf("load-balance method least-outstanding") != -1){
						 $scope.aaaAdvanced.radiusServerLoadBalance = translate("com_enable");
						 $scope.aaaAdvanced.radiusServerLoadBalanceOld = angular.copy($scope.aaaAdvanced.radiusServerLoadBalance);
					 }
				 }
			 }
			 if(localAAAMethodList.length > 1){
				 for(var i=1;i<localAAAMethodList.length;i++){
					 if(localAAAMethodList[i].indexOf("default group ") != -1 && localAAAMethodList[i].indexOf("dot1x") == -1 && localAAAMethodList[i].indexOf("network") == -1&& localAAAMethodList[i].indexOf("auth-proxy") == -1 ){
						 $scope.aaaAdvanced.defaultAuthMethod = executeCliCmdService.getNextString(localAAAMethodList[i], ["default group "], [" local"]).trim();
						 $scope.aaaAdvanced.defaultAuthMethodOld = angular.copy($scope.aaaAdvanced.defaultAuthMethod);
					 }
					 if(localAAAMethodList[i].indexOf("console group ") != -1){
						 $scope.aaaAdvanced.consoleAuthMethod = executeCliCmdService.getNextString(localAAAMethodList[i], ["console group "], [" local"]).trim();
						 $scope.aaaAdvanced.consoleAuthMethodOld = angular.copy($scope.aaaAdvanced.consoleAuthMethod);
					 }
					 if(localAAAMethodList[i].indexOf("mschap group ") != -1){
						 $scope.aaaAdvanced.mschapAuthMethod = executeCliCmdService.getNextString(localAAAMethodList[i], ["mschap group "], [" local"]).trim();
						 $scope.aaaAdvanced.mschapAuthMethodOld = angular.copy($scope.aaaAdvanced.mschapAuthMethod);
					 }
				 }
			 }
			 if(localAAAConfList.length > 1){
				 if(executeCliCmdService.getNextString(localAAAConfList[1], ["authentication "], [" "]).trim() != "attempts"){
				 $scope.aaaAdvanced.localAuthentication = executeCliCmdService.getNextString(localAAAConfList[1], ["authentication "], [" "]).trim();
				 $scope.aaaAdvanced.localAuthenticationOld = angular.copy($scope.aaaAdvanced.localAuthentication);
				 $scope.aaaAdvanced.localAuthorization = executeCliCmdService.getNextString(localAAAConfList[1], ["authorization "], ["\n"]).trim();
				 $scope.aaaAdvanced.localAuthorizationOld = angular.copy($scope.aaaAdvanced.localAuthorization);
				 }
			 }
		 }
		 
		 $scope.aaaAdvancedConfigDataApply = function(){
			 if(aaaConfServerValidation.validate()){
				 if($scope.aaaAdvanced.localAuthenticationOld != $scope.aaaAdvanced.localAuthentication || 
						 $scope.aaaAdvanced.localAuthorizationOld != $scope.aaaAdvanced.localAuthorization){
					 if($scope.aaaAdvanced.localAuthentication == "none" || $scope.aaaAdvanced.localAuthorization == "none" ){                                                                       
						 aaaAdvancedConfigCLI +="no aaa local authentication default authorization default \n";                                                                               
			         }if($scope.aaaAdvanced.localAuthentication == "default" && $scope.aaaAdvanced.localAuthorization == "default" ){    
			        	 aaaAdvancedConfigCLI +="aaa local authentication default authorization default \n";
			         }if($scope.aaaAdvanced.localAuthentication == "default" && $scope.aaaAdvanced.localAuthorization == "methodlist" ){             
			        	 aaaAdvancedConfigCLI +="aaa local authentication default authorization methodlist \n";
			         }if($scope.aaaAdvanced.localAuthentication == "methodlist" && $scope.aaaAdvanced.localAuthorization == "default" ){    
			        	 aaaAdvancedConfigCLI +="aaa local authentication methodlist authorization default \n";
			         }if($scope.aaaAdvanced.localAuthentication == "methodlist" && $scope.aaaAdvanced.localAuthorization == "methodlist" ){             
			        	 aaaAdvancedConfigCLI +="aaa local authentication methodlist authorization methodlist \n";
			         }
				 }
		         if($scope.aaaAdvanced.retransmitIntervalOld != $scope.aaaAdvanced.retransmitInterval){
		        	 if($scope.aaaAdvanced.retransmitInterval != null && $scope.aaaAdvanced.retransmitInterval != ''){
			        	 aaaAdvancedConfigCLI += "radius-server retransmit "+$scope.aaaAdvanced.retransmitInterval+"\n";
			         }else{
			        	 aaaAdvancedConfigCLI += "no radius-server retransmit \n";
			         }
		         }
		         if($scope.aaaAdvanced.timeoutIntervalOld != $scope.aaaAdvanced.timeoutInterval){
		        	 if($scope.aaaAdvanced.timeoutInterval != null && $scope.aaaAdvanced.timeoutInterval != ''){
			        	 aaaAdvancedConfigCLI += "radius-server timeout "+$scope.aaaAdvanced.timeoutInterval+"\n";
			         }else{
			        	 aaaAdvancedConfigCLI += "no radius-server timeout \n";
			         }
		         }
		         if($scope.aaaAdvanced.deadtimeOld != $scope.aaaAdvanced.deadtime){
		        	 if($scope.aaaAdvanced.deadtime != null && $scope.aaaAdvanced.deadtime != ''){
			        	 aaaAdvancedConfigCLI += "radius-server deadtime "+$scope.aaaAdvanced.deadtime+"\n";
			         }else{
			        	 aaaAdvancedConfigCLI += "no radius-server deadtime \n";
			         }
		         }
				 if($scope.aaaAdvanced.commit){
					 aaaAdvancedConfigCLI += "radius commit"+"\n";
				 }
				 if($scope.aaaAdvanced.discard){
					 aaaAdvancedConfigCLI += "radius abort"+"\n";
				 }
				 if($scope.aaaAdvanced.clear){
					 aaaAdvancedConfigCLI += "clear radius session"+"\n";
				 }
				 if($scope.aaaAdvanced.consoleAuthMethodOld != $scope.aaaAdvanced.consoleAuthMethod){
					 if($scope.aaaAdvanced.consoleAuthMethod != "none"){
						 aaaAdvancedConfigCLI += "aaa authentication login console group "+$scope.aaaAdvanced.consoleAuthMethod+" local"+"\n";
					 }else{
						 aaaAdvancedConfigCLI += "no aaa authentication login console group \n";
					 }
				 }
				 if($scope.aaaAdvanced.defaultAuthMethodOld != $scope.aaaAdvanced.defaultAuthMethod){
					 if($scope.aaaAdvanced.defaultAuthMethod != "none"){
						 aaaAdvancedConfigCLI += "aaa authentication login default group "+$scope.aaaAdvanced.defaultAuthMethod+" local"+"\n";
					 }else{
						 aaaAdvancedConfigCLI += "no aaa authentication login default group \n";
					 }
				 }
				 if($scope.aaaAdvanced.mschapAuthMethodOld != $scope.aaaAdvanced.mschapAuthMethod){
					 if($scope.aaaAdvanced.mschapAuthMethod != "none"){
						 aaaAdvancedConfigCLI += "aaa authentication login mschap group "+$scope.aaaAdvanced.mschapAuthMethod+" local"+"\n";
					 }else{
						 aaaAdvancedConfigCLI += "no aaa authentication login mschap group \n";
					 }
				 }
					 if($scope.aaaAdvanced.radiusServerLoadBalance == translate("com_enable")){
						 aaaAdvancedConfigCLI += "radius-server load-balance method least-outstanding \n";
					 }else{
						 aaaAdvancedConfigCLI += "no radius-server load-balance method least-outstanding \n";
					 }
				 $scope.applyAAAAdvancedConfigCLI();
			 }
		 }
		 
		 
		 $scope.applyAAAAdvancedConfigCLI=function(){
				var result = requestRoutingService.getConfigCmdOutput(aaaAdvancedConfigCLI);
				if(result==""){
					notificationService.showNotification('AAA Advanced Configuration is successfully Applied',translate('com_config_success_title'),'success');
					
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
				$scope.loadAAAServer();
				$scope.loadAAAAdvanceData();
				aaaAdvancedConfigCLI="";
				$scope.disableApplyRadiusFallback = true;
				
		 }
		 //Radius Fallback Advanced End
		 
		
		
		// Access Policy start
		$scope.disablepolicyName=true;
		$scope.aaaPolicyGridOptions = {
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
                "template": "<input type=\"checkbox\"  ng-init=\"policyServer=false\" ng-model=\"policyServer\" ng-click=\"isPolicyChecked(policyServer,dataItem)\"  />",
                sortable: false,
                width: 40
            }, {
                field : "name",
                title : translate("com_name")
            }, {
                field : "aaapolicyProt",
                title : translate("etherchannel_protocol")
            }, {
                field : "aaaProtocol",
                title : translate("aaa_server")
            },{
                field : "interface",
                title : translate("portconfig_general_interface")
            }]
        };
		$scope.policyDataObj = new kendo.data.ObservableArray([{
			policyprotocolName  : translate('aaa_radius'),
			policyprotocolValue : 'radius'
		},{
			policyprotocolName  : translate('aaa_tacacs'),
			policyprotocolValue : 'tacacs'
		},{
			policyprotocolName  : translate('aaa_ldap'),
			policyprotocolValue : 'ldap'
		}]);
		
		$scope.policyDataWOObj = new kendo.data.ObservableArray([{
			policyprotocolName  : translate('aaa_radius'),
			policyprotocolValue : 'radius'
		},{
			policyprotocolName  : translate('aaa_ldap'),
			policyprotocolValue : 'ldap'
		}]);		
		$scope.policyProtocolData = new kendo.data.DataSource({
			pageSize: 10,
			data: $scope.policyDataObj
		});
		$scope.aaaPolicyValidations = {
			rules : {
				policyduplicate: function(input){
                    if (angular.isUndefined(input.data('policyduplicate'))) {
                        return true;
                    } else {
                        for (var index = 0; index < $scope.serverPolicyGridData.length; index++) {
                            if ($scope.serverPolicyGridData[index].aaapolicyProt === $scope.aaa.servers.policy.aaapolicyProt){
                                return false;
                            }
                        }
                        return true;
                    }
                }
			}
		};
		$scope.policyProtData = new kendo.data.DataSource({
			data : [{
					policyProtName  : translate('aaa_auth_type_dot1x'),
					policyProtValue : 'dot1x'
				},{
					policyProtName  : translate('aaa_policy_prot_mab'),
					policyProtValue : 'mab'
				},{
					policyProtName  : translate('aaa_policy_prot_web'),
					policyProtValue : 'web'
				}]
		});
		$scope.formatInt = function (intName) {
            if (intName.indexOf("TenGigabitEthernet") != -1) {
                intName = intName.replace("TenGigabitEthernet", "Te");
            } else if (intName.indexOf("FastEthernet") != -1) {
                intName = intName.replace("FastEthernet", "Fa");
            } else if (intName.indexOf("GigabitEthernet") != -1) {
                intName = intName.replace("GigabitEthernet", "Gi");
            } else if (intName.indexOf("Bluetooth") != -1) {
                intName = intName.replace("Bluetooth", "Bl");
            } else if (intName.indexOf("Loopback") != -1) {
                intName = intName.replace("Loopback", "Lo");
            }
            return intName;
        }
		$scope.routedSwitch = function(){
            var op = shRunIntCLIOP[0].split("interface");
            var rSwitch =[];
            for(var i = 1; i < op.length; i++){
                var portsObj = {};
                var intShowRun="interface "+op[i];
                if(intShowRun.indexOf("no switchport") != -1){
                    var inOutBoundsOP =executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
                    rSwitch.push($scope.formatInt(inOutBoundsOP));
                }
            }
            return rSwitch;
        }
		//Getting List of Available interface
		$scope.availableAuthMethodListOptions = [];
		var interfaceList=[];
		var oneTime = true;
		$scope.loadPolicyTab = function(){
			if(oneTime){
				oneTime = false;
				angular.element(".pagePolicyLoader").show();
				$timeout(function(){
					$scope.loadAAAPolicy();
				},250);
			}
		}
		var policyWindow = angular.element("#policyWindow");
		policyWindow.kendoWindow({
			modal: true,
			width: "900px",
			title: translate("aaa_access_policy"),
			visible: false,
			actions: [
				"Close"
			]
		}).data("kendoWindow").center();
		$scope.addaaaPolicyRow = function(){
			$scope.availableAuthMethodListOptions = angular.copy($scope.interfacesLists);
			$scope.authSelectedServerGroupOptions = [];
			$scope.disablepolicyProtocolName = false;
			$scope.disablepolicyName = true;
            angular.element("#aaaPolicyForm  span.k-tooltip-validation").hide();
			$scope.aaa.servers.policy = {};
			$scope.aaa.servers.policy.created = true;
			$scope.aaa.servers.policy.aaapolicyProt = "dot1x";
			$scope.aaa.servers.policy.aaaProtocol = "radius";
			$scope.policyProtocolChange();
			policyWindow.data("kendoWindow").open().center();
			$scope.kendoWindow.isEditMode1 = true;
        }
		$scope.cancelAddEditpolicyWindow = function(){
			policyWindow.data("kendoWindow").close();
		};
		$scope.doneAddEditpolicyWindow = function(name){
			if($scope.aaaPolicyValidator.validate()){
				if($scope.aaa.servers.policy.created && name == "save"){
					$scope.serverPolicyGridData.push($scope.aaa.servers.policy);
				}else{
					$scope.updateAAAPolicyChange();
				}
				policyWindow.data("kendoWindow").close();
				$scope.applyAAAPolicy();
			}
		}
		$scope.authSelectedServerGroupOptions = [];
		$scope.moveToAAAServerGroup = function() {
             $scope.moveItemsBetweenLists($scope.availableAuthMethodListOptions, $scope.authSelectedServerGroupOptions, $scope.aaa.methodList.auth.groupMethods);
        };
        $scope.moveFromAAAServerGroup = function() {
             $scope.moveItemsBetweenLists($scope.authSelectedServerGroupOptions, $scope.availableAuthMethodListOptions, $scope.aaa.methodList.auth.list);
        };
		$scope.moveItemsBetweenLists = function(fromList, toList, itemsToMove) {
			if ( typeof itemsToMove != "undefined") {
				while (itemsToMove.length > 0) {
					var item = itemsToMove.pop();
					toList.push(item);
					var index = fromList.indexOf(item);
					if (index != -1) {
						fromList.splice(index, 1);
					}
				}
			}
		}
		$scope.policyProtocolChange = function(){
			var policyProto = false;
			if($scope.aaa.servers.policy.aaapolicyProt == "dot1x"){	
				$scope.policyProtocolData = $scope.policyDataWOObj;			
				$scope.aaa.servers.policy.name = "POLICY_DOT1X";
			}else if($scope.aaa.servers.policy.aaapolicyProt == "mab"){	
				$scope.policyProtocolData = $scope.policyDataWOObj;
				$scope.aaa.servers.policy.name = "POLICY_MAB";
			}else if($scope.aaa.servers.policy.aaapolicyProt == "web"){
				$scope.policyProtocolData = $scope.policyDataObj;				
				$scope.aaa.servers.policy.name = "POLICY_WEB";
			}
		}
		$scope.onSelectAAAPolicyHandler = function(data) {
			$scope.authSelectedServerGroupOptions = [];
			if(data.interface != ""){
				var dataInt = data.interface.split(",");
				for(var i = 0; i < dataInt.length; i++){
					inOBOPs = $scope.formatInt(dataInt[i]);
					$scope.authSelectedServerGroupOptions.push(inOBOPs);
				}
			}
			$scope.availableAuthMethodListOptions = angular.copy($scope.interfacesLists);
			$scope.availableAuthMethodListOptions = $scope.availableAuthMethodListOptions.filter(function(val) {
				return $scope.authSelectedServerGroupOptions.indexOf(val) == -1;
			});
			$scope.disablepolicyProtocolName = true;
			$scope.disablepolicyName = true;
			angular.element("#aaaPolicyForm  span.k-tooltip-validation").hide();
			$scope.aaa.servers.policy = angular.copy(data);
			if($scope.aaa.servers.policy.aaaProtocol == "tacacs+"){
				$scope.aaa.servers.policy.aaaProtocol = "tacacs"
			}
			$scope.policyProtocolChange();
			$scope.kendoWindow.isEditMode1 = false;
			policyWindow.data("kendoWindow").open();
			$scope.aaa.servers.policy.created = false;
		};
		function filterCommunity(data1, data2) {
			var a = angular.copy(data1);
			var b = angular.copy(data2);
			for (var i = 0, len = a.length; i < len; i++) {
				for (var j = 0, len2 = b.length; j < len2; j++) {
					if (a[i] == b[j]) {
						b.splice(j, 1);
						len2 = b.length;
					}
				}
			}
			return b;
		}
		$scope.delInterface = [];
		$scope.updateAAAPolicyChange = function() {
			var selSRIndex = $scope.aaaPolicyGrid.dataSource.indexOf($scope.aaa.servers.policy);
			$scope.serverPolicyGridData[selSRIndex].aaapolicyProt = $scope.aaa.servers.policy.aaapolicyProt;
			$scope.serverPolicyGridData[selSRIndex].name = $scope.aaa.servers.policy.name;
			$scope.serverPolicyGridData[selSRIndex].aaaProtocol = $scope.aaa.servers.policy.aaaProtocol;
			$scope.serverPolicyGridData[selSRIndex].interface = $scope.authSelectedServerGroupOptions.toString();
			$scope.delInterface = filterCommunity($scope.authSelectedServerGroupOptions, $scope.oldServerPolicyGridData[selSRIndex].intArr);
		}
		$scope.deletePolicyConfirmation = function (callbackname) {
            $scope.dlgAAAPolicy = dialogService.dialog({
                content : translate('msg_delete_confirmation'),
                title : translate('msg_delete_confirmation_window'),
                messageType : "confirm",
                actionButtons : [{
                    text : translate('com_ok'),
                    callback : callbackname
                }, {
                    text : translate('com_cancel')
                }]
            });
        };
		$scope.$on("deletePolicyServer", function() {
            $scope.dlgAAAPolicy.data("kendoWindow").close();
            $scope.delPolicyRow();
        });
		$scope.selectedPolicyArray = [];
		$scope.isPolicyChecked = function (checked, dataItem) {
			if (checked == false) {
				var index = $scope.selectedPolicyArray.indexOf(dataItem);
				if (index > -1) {
					$scope.selectedPolicyArray.splice(index, 1);
					if($scope.selectedPolicyArray.length === 0){
						$scope.deleteaaaPolicy = true;
					}
				}
			}
			else {
				$scope.deleteaaaPolicy = false;
				$scope.selectedPolicyArray.push(dataItem);
			}
		};
		$scope.delPolicyRow = function() {
			$scope.deleteaaaPolicy = true;
			$scope.deletePolicyArray = [];
			for (var index = 0; index < $scope.selectedPolicyArray.length; index++) {
				$scope.deletePolicyArray.push($scope.selectedPolicyArray[index]);
			}
			$scope.selectedPolicyArray = [];
			$timeout(function(){
				$scope.deleteAAAPolicyServer();
			},10);
		};
		// Refresh button trigger
		angular.element("#aaaPolicyGrid").delegate(".k-pager-refresh", "click", function(){
			$scope.deleteaaaPolicy = true;
			$scope.selectedPolicyArray = [];
			if (!$scope.$$phase){
				$scope.$apply();
			}
		});

		$scope.manualPolicyGridRefresh = function(){
			$scope.deleteaaaPolicy = true;
			$scope.selectedPolicyArray = [];
			if (!$scope.$$phase){
				$scope.$apply();
			}
		}
		$scope.deleteAAAPolicyServer = function(){
			var delPolicyConfCli = "", forMab = 0;
			for(var d=0;d<$scope.deletePolicyArray.length;d++){
				if($scope.deletePolicyArray[d].aaapolicyProt == "dot1x"){
					var findINT = [];
					if($scope.deletePolicyArray[d]["interface"].indexOf(",") != -1){
						findINT = $scope.deletePolicyArray[d]["interface"].split(",");
					}else{
						findINT[0] = $scope.deletePolicyArray[d]["interface"];
					}
					for(var ds = 0; ds < findINT.length; ds++){
						if(findINT[ds] != ""){
							delPolicyConfCli += "interface "+ findINT[ds] + "\n";
							delPolicyConfCli += "no authentication port-control auto \n no dot1x pae authenticator \n ";
							delPolicyConfCli += "exit \n";
						}
					}
				}
				if($scope.deletePolicyArray[d].aaapolicyProt == "mab"){
					var findINT = [];
					if($scope.deletePolicyArray[d]["interface"].indexOf(",") != -1){
						findINT = $scope.deletePolicyArray[d]["interface"].split(",");
					}else{
						findINT[0] = $scope.deletePolicyArray[d]["interface"];
					}
					for(var ds = 0; ds < findINT.length; ds++){
						if(findINT[ds] != ""){
							delPolicyConfCli += "interface "+ findINT[ds] + "\n";
							delPolicyConfCli += "no authentication port-control auto \n no mab \n ";
							delPolicyConfCli += "exit \n";
						}
					}
				}
				if($scope.deletePolicyArray[d].aaapolicyProt == "web"){
					var findINT = [];
					if($scope.deletePolicyArray[d]["interface"].indexOf(",") != -1){
						findINT = $scope.deletePolicyArray[d]["interface"].split(",");
					}else{
						findINT[0] = $scope.deletePolicyArray[d]["interface"];
					}
					for(var ds = 0; ds < findINT.length; ds++){
						if(findINT[ds] != ""){
							delPolicyConfCli += "interface "+ findINT[ds] + "\n";
							delPolicyConfCli += "no ip admission web \n no authentication port-control auto \n";
							delPolicyConfCli += "exit \n";
						}
					}
				}
				if($scope.deletePolicyArray[d].aaapolicyProt == "dot1x"){
					var mabIndex = $scope.serverPolicyGridData.map(function(e) {
						return e.aaapolicyProt;
					}).indexOf("mab");
					if(mabIndex != -1){
						forMab++;
						delPolicyConfCli += $scope.serverPolicyGridData[mabIndex]["interface"] == "" ? "no aaa authentication dot1x default group "+$scope.deletePolicyArray[d].aaaProtocol+" \n no aaa authorization network default group "+$scope.deletePolicyArray[d].aaaProtocol+"\n" : "";
					}
				}
				if($scope.deletePolicyArray[d].aaapolicyProt == "mab"){
					var mabIndex = $scope.serverPolicyGridData.map(function(e) {
						return e.aaapolicyProt;
					}).indexOf("mab");
					if(mabIndex != -1){
						forMab++;
						delPolicyConfCli += $scope.serverPolicyGridData[mabIndex]["interface"] == "" ? "no aaa authentication dot1x default group "+$scope.deletePolicyArray[d].aaaProtocol+"\n no aaa authorization network default group "+$scope.deletePolicyArray[d].aaaProtocol+"\n" : "";
					}
				}
				if($scope.deletePolicyArray[d].aaapolicyProt == "web"){
					delPolicyConfCli += "no aaa authentication login default group "+$scope.deletePolicyArray[d].aaaProtocol+" \n no aaa authorization auth-proxy default group "+$scope.deletePolicyArray[d].aaaProtocol+"\n no ip admission name web proxy http \n";
				}
				if(forMab == 2){
					delPolicyConfCli += "no aaa authentication dot1x default group "+$scope.deletePolicyArray[d].aaaProtocol+"\n no aaa authorization network default group "+$scope.deletePolicyArray[d].aaaProtocol+"\n";
				}
			}
			delPolicyConfCli += "exit\n";
			if(delPolicyConfCli != ""){
				var result = requestRoutingService.getConfigCmdOutput(delPolicyConfCli);
				if(result==""){
					notificationService.showNotification(translate('aaa_access_policy_success_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
			}
			$scope.loadAAAPolicy();
			var grid = angular.element("#aaaPolicyGrid").data("kendoGrid");
            grid.dataSource = $scope.aaaPolicyGridDataSource;
            $scope.aaaPolicyGridDataSource.read();
            grid.refresh();
		}
		$scope.applyAAAPolicy = function(){
			var aaaPolicyConfigCli = "";
			aaaPolicyConfigCli += "no aaa local authentication default authorization default \n";
			if($scope.aaa.servers.policy.aaapolicyProt == "dot1x"){
				aaaPolicyConfigCli += "dot1x system-auth-control \n";
				aaaPolicyConfigCli += "aaa authentication dot1x default group "+ $scope.aaa.servers.policy.aaaProtocol+"\n";
				aaaPolicyConfigCli += "aaa authorization network default group "+$scope.aaa.servers.policy.aaaProtocol+"\n";
				for(var delD = 0; delD < $scope.delInterface.length; delD++){
					aaaPolicyConfigCli += "interface "+ $scope.delInterface[delD] +"\n";
					aaaPolicyConfigCli += "no authentication port-control auto \n no dot1x pae authenticator \n";
				}
				if($scope.authSelectedServerGroupOptions.length > 0){
					for(var d=0;d<$scope.authSelectedServerGroupOptions.length;d++){
						aaaPolicyConfigCli += "interface "+ $scope.authSelectedServerGroupOptions[d] +"\n";
						aaaPolicyConfigCli += "switchport mode access \n";
						aaaPolicyConfigCli += "authentication port-control auto \n";
						aaaPolicyConfigCli += "dot1x pae authenticator \n";
					}
				}
			}else if($scope.aaa.servers.policy.aaapolicyProt == "mab"){
				aaaPolicyConfigCli += "aaa authentication dot1x default group "+ $scope.aaa.servers.policy.aaaProtocol+"\n";
				aaaPolicyConfigCli += "aaa authorization network default group "+ $scope.aaa.servers.policy.aaaProtocol+"\n";
				for(var delM = 0; delM < $scope.delInterface.length; delM++){
					aaaPolicyConfigCli += "interface "+ $scope.delInterface[delM] +"\n";
					aaaPolicyConfigCli += "no authentication port-control auto \n no mab \n";
				}
				if($scope.authSelectedServerGroupOptions.length > 0){
					for(var m=0;m<$scope.authSelectedServerGroupOptions.length;m++){
						aaaPolicyConfigCli += "interface "+ $scope.authSelectedServerGroupOptions[m] +"\n";
						aaaPolicyConfigCli += "switchport mode access \n";
						aaaPolicyConfigCli += "authentication port-control auto \n";
						aaaPolicyConfigCli += "mab \n";
					}
				}
			}else if($scope.aaa.servers.policy.aaapolicyProt == "web"){
				aaaPolicyConfigCli += "aaa authentication login default group "+$scope.aaa.servers.policy.aaaProtocol+"\n";
				aaaPolicyConfigCli += "aaa authorization auth-proxy default group "+ $scope.aaa.servers.policy.aaaProtocol+"\n";
				aaaPolicyConfigCli += "ip admission name web proxy http \n";
				for(var delW = 0; delW < $scope.delInterface.length; delW++){
					aaaPolicyConfigCli += "interface "+ $scope.delInterface[delW] +"\n";
					aaaPolicyConfigCli += "no ip admission web \n no authentication port-control auto \n";
				}
				if($scope.authSelectedServerGroupOptions.length > 0){
					for(var w=0;w<$scope.authSelectedServerGroupOptions.length;w++){
						aaaPolicyConfigCli += "interface "+ $scope.authSelectedServerGroupOptions[w] +"\n";
						aaaPolicyConfigCli += "switchport mode access \n";
						aaaPolicyConfigCli += "authentication port-control auto \n";
						aaaPolicyConfigCli += "ip admission web \n";
					}
				}
			}
			aaaPolicyConfigCli += "exit\n";
			if(aaaPolicyConfigCli != ""){
				var result = requestRoutingService.getConfigCmdOutput(aaaPolicyConfigCli);
				if(result==""){
					notificationService.showNotification(translate('aaa_access_policy_success_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
			}
			$scope.loadAAAPolicy();
		}
		$scope.loadAAAPolicy = function(){
			var dot1xInterfaceList = [],mabInterfaceList = [], webInterfaceList = [];
			$scope.interfacesLists = [];
			interfaceList=[];
			var interfaceListOP = deviceCommunicatorCLI.getExecCmdOutput("show running-config | section interface"),
				interfaceListOPArr = interfaceListOP[0].split("interface"),
				intShowRun;
			for (var i=0; i < interfaceListOPArr.length; i++) {
				intShowRun="interface "+interfaceListOPArr[i];
				var arrInterfaceName = executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
				var portsObj = {};
				if(arrInterfaceName.indexOf("Port") != -1 || arrInterfaceName.indexOf("Vlan") != -1 || arrInterfaceName.indexOf("Bluetooth") != -1 || arrInterfaceName.indexOf("Loopback") != -1 || arrInterfaceName.indexOf("input") != -1 || arrInterfaceName.indexOf("collect") != -1){
					continue;
				}
				intShowRun="interface "+interfaceListOPArr[i];
				if(intShowRun.indexOf("no switchport") == -1){
					if(intShowRun.indexOf("channel-group") == -1){
						if(arrInterfaceName && arrInterfaceName !="FastEthernet0"){
							portsObj["portName"] = arrInterfaceName;
							interfaceList.push(portsObj);
						}
					}
				}
				if(intShowRun.indexOf("dot1x pae authenticator") != -1){
					dot1xInterfaceList.push($scope.formatInt(arrInterfaceName));
				}
				if(intShowRun.indexOf("mab") != -1){
					mabInterfaceList.push($scope.formatInt(arrInterfaceName));
				}
				if(intShowRun.indexOf("ip admission web") != -1){
					webInterfaceList.push($scope.formatInt(arrInterfaceName));
				}
			}
			angular.forEach(interfaceList, function (inter) {
					var intNameAttr = $scope.formatInt(inter.portName);
					$scope.interfacesLists.push(intNameAttr);
			});
			var protocolName = "", serverGroup = "", policyName = "", associatedInterface = "";
			$scope.serverPolicyGridData = new kendo.data.ObservableArray([]);
			var aaaAuthOP = deviceCommunicator.getExecCmdOutput("show run aaa authentication");
			if(aaaAuthOP.indexOf("aaa authentication login default group") != -1){
				var serverGrp = executeCliCmdService.getNextString(aaaAuthOP,["aaa authentication login default group"],["\n"]).trim();
				serverGroup = serverGrp;
				protocolName = "web";
				policyName = "POLICY_WEB";
				$scope.serverPolicyGridData.push({
					"name" : policyName,
					"aaapolicyProt" : protocolName,
					"aaaProtocol" : serverGroup,
					"interface" : webInterfaceList == "" ? "" : webInterfaceList.join(),
					"intArr" : webInterfaceList == "" ? [] : webInterfaceList
				})
			}
			if(aaaAuthOP.indexOf("aaa authentication dot1x default group") != -1){
				var serverGrp = executeCliCmdService.getNextString(aaaAuthOP,["aaa authentication dot1x default group"],["\n"]).trim();
				serverGroup = serverGrp;
				protocolName = "dot1x";
				policyName = "POLICY_DOT1X";
				$scope.serverPolicyGridData.push({
					"name" : policyName,
					"aaapolicyProt" : protocolName,
					"aaaProtocol" : serverGroup,
					"interface" : dot1xInterfaceList == "" ? "" : dot1xInterfaceList.join(),
					"intArr" : dot1xInterfaceList == "" ? [] : dot1xInterfaceList
				})
			}
			if(aaaAuthOP.indexOf("aaa authentication dot1x default group") != -1){
				var serverGrp = executeCliCmdService.getNextString(aaaAuthOP,["aaa authentication dot1x default group"],["\n"]).trim();
				serverGroup = serverGrp;
				protocolName = "mab";
				policyName = "POLICY_MAB";
				$scope.serverPolicyGridData.push({
					"name" : policyName,
					"aaapolicyProt" : protocolName,
					"aaaProtocol" : serverGroup,
					"interface" : mabInterfaceList == "" ? "" : mabInterfaceList.join(),
					"intArr" : mabInterfaceList == "" ? [] : mabInterfaceList
				})
			}
			$scope.oldServerPolicyGridData = angular.copy($scope.serverPolicyGridData);
			$scope.aaaPolicyGridDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.serverPolicyGridData
			});
			angular.element(".pagePolicyLoader").hide();
			$scope.manualPolicyGridRefresh();
		}
}]);
