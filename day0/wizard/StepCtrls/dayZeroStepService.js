/**
 Description: Controller - Day Zero Wizard
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service('dayZeroStepService', function($filter, $http, $q, $timeout, requestRoutingService) {
	var translate=$filter("translate");
	var data = {};
	//private to the service
	var basicConfig={};
	var interConfig={};
	var advConfig={};
	var layConfig={};
	var summary={};
	var cli='';
	var vlanInter={};
	var interfaceOptions=[];
	var ipAddressAssign=[];
	var allvalns={};
      var wirelessOptions={};
      var controllerIP='';
      var day0AjaxCall= "";
	var CDPClientSwitchPort = [];
	var countryLists = "";
	var wirelessPossible = "";
	var day0Bool = false;
	//APIs to access the private data variable
	return {
            ajaxCall: function(_url){
                  var result = undefined;
                  // create deferred object using $q
                  var deferred = $q.defer();
                  // get posts form backend
                  var headers = {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'};
                        var config = {
                              headers:headers
                        }
                  $http.get(_url, config)
                  .then(function(res) {
                        result = res;
                        // resolve the deferred
                        deferred.resolve(result);
                  }, function(error) {
                        result = error;
                        deferred.reject(error);
                  });
                  // set the posts object to be a promise until result comeback
                  result = deferred.promise;
                  return $q.when(result);
		},
            setControllerIP: function(ip){
		  if(ip != undefined && ip === ""){
			controllerIP = ip;
                  	return controllerIP;
		  }
                  var showCli = requestRoutingService.getShowCmdOutput("show ip dhcp binding | inc 0100.005e.0001.01");
                       //showCli = "10.0.0.18        0100.005e.0001.01       Feb 23 2018 01:14 AM    Automatic  Active     Vlan1";
                  if(showCli){
                        controllerIP = showCli.split(" ")[0].trim();
                  }
                  return controllerIP;
            },
            setDay0Mode: function(ctrlIP){
                  if(ctrlIP){
                        var url = "http://"+ctrlIP+"/data/version_info.html";
                        day0AjaxCall = this.ajaxCall(url);
                  } 
                  return day0AjaxCall;
            },
            getControllerIP: function(){
                  return controllerIP;
		},
		setWirelessPossible:function(_wirelessPossible){
			wirelessPossible = _wirelessPossible;
		},
		getWirelessPossible:function(){
			return wirelessPossible;
		},
            wirelessMode: function(){
                  var wirelessMode = false;
                  if(controllerIP){
                        wirelessMode = true;
                  }
                  return wirelessMode;
            },
            getDay0Mode: function(){
                  return day0AjaxCall;
		},
		setDay0ModeBool: function(mode){
			day0Bool = mode;
		},
		getDay0ModeBool: function(){
			return day0Bool;
		},
		getData: function() {
			return data;
            },
		addJSON: function(dataObj) {
			angular.extend(data, dataObj);
		},
		setBasicConfig:function(newBasicConfig){
			basicConfig=newBasicConfig;
		},
		getBasicConfig:function(){
			return basicConfig;
		},
		setInterConfig:function(newInterConfig){
			interConfig=newInterConfig;
		},
		getInterConfig:function(){
			return interConfig;
		},
		setAdvConfig:function(newAdvConfig){
			advConfig=newAdvConfig;
		},
		getAdvConfig:function(){
			return advConfig;
		},
		setLayConfig:function(newLayConfig){
			layConfig=newLayConfig;
		},
		getLayConfig:function(){
			return layConfig;
		},
		setSummary:function(newSummary){
			summary=newSummary;
		},
		getSummary:function(){
			return summary;
		},
		setCli:function(newCli){
			cli=newCli;
		},
		getCli:function() {
			return cli;
		},
		setVlanInter:function(newVlanInter){
		vlanInter=newVlanInter;
		},
		getVlanInter:function(){
			return vlanInter;
		},
		setAllValns:function(newvlans){
			allvalns=newvlans;
		},
		getAllValns:function(){
			return allvalns;
		},
		setInterOption:function(newOptions){
		interfaceOptions=newOptions;
		},
		getInterOption:function(){
			return interfaceOptions;
		},
		setIpAddressAssign:function(newIpAddressAssign){
			ipAddressAssign=newIpAddressAssign;
		},
		getIpAddressAssign:function(){
			return ipAddressAssign;
		},
		setWireless:function(wireless){
			wirelessOptions = wireless;
		},
		getWireless:function(wireless){
			return wirelessOptions;
		},
		helpAndTips: function() {
			return{
				"basicScreen": [
					{
						"key": "domainNamehelpDiv",
						"Message": translate("dayzero_set_device_uniquely_identified")
					},
					{
						"key": "timeModeDivhelp",
						"Message": translate("dayzero_difference_time_set")
					}
				],
				"wifiScreen": [
					{
						"key": "wifi_config",
						"Message": translate("wifi_config_message")
					},
					{
						"key": "furher_config",
						"Message": translate("ap_config_message")
					}
				]
			}
		},
		securityTypes: function() {
			return new kendo.data.DataSource({
				data: [
					{
						securityType:translate("wireless_wpa2_enterprise"),
						securityValue:"enterprise"
					},
					{
						securityType:translate("wireless_wpa2_personal"),
						securityValue:"personal"
					}
				]
			});
		},
		wirelessVlan: function() {
			return new kendo.data.DataSource({
				data: [
					{
						key:translate("day0_wizard_default_vlan"),
						value:"defaultVlan"
					},
					{
						key:translate("vlan_add_new"),
						value:"new"
					}
				]
			});
            },
            setCDPClientSwitchPort: function(_CDPClientSwitchPort){
                  CDPClientSwitchPort = _CDPClientSwitchPort;
            },
            getCDPClientSwitchPort: function(){
                  return CDPClientSwitchPort;
            },
            countryDataSource : function(ctrlIP) {
                  if(ctrlIP){
                        var url = "http://"+ctrlIP+"/data/supported_country_code.html";
                        countryLists = this.ajaxCall(url);
                  }
                  return countryLists;
       	}
	};
});

