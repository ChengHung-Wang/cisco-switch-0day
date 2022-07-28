/**
 Description: Wi-Fi Configuration Controller - routing Day Zero
 Copyright (c) 2018 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller("wifiCtrl", ['$scope', 'dayZeroStepService', 'validationService', 'networkIPDetails', '$filter','$timeout',
	function($scope, dayZeroStepService, validationService, networkIPDetails, $filter, $timeout) {
		var translate=$filter("translate");
		var trimVal=$filter('trim');
		$scope.helpAndTipsOriginal=dayZeroStepService.helpAndTips().wifiScreen;
		// Country lists dropdown options
		var controllerIP = dayZeroStepService.getControllerIP();
		var countriesLists = dayZeroStepService.countryDataSource(controllerIP);
		$scope.wirelessPossible = false;
		dayZeroStepService.setWirelessPossible($scope.wirelessPossible);
		$scope.wzModel={
			wifi:{
				wifiEnabled:'Off',
				adminUserName:'',
				adminPassword:'',
				confirmAdminPassword:'',
				mgmtDhcpScope:'NO',
				createEmployeeNetwork:'YES',
				networkName:'',
				networkSecurity:null,
				pskPassword:'',
				confirmPskPassword:'',
				mgmtInterfaceIpAddress:'',
				mgmtInterfaceNetworkMask:'',
				mgmtInterfaceDefaultRouter:'',
				wirelessVlan: 'defaultVlan',
				networkVlan:null,
				sameAsRouter:true,
				defaultVlans : {},
				authPort: '1812'
			}
		};
		$scope.wzModel.wifi.country = null;
                countriesLists.then(function(_countriesList){
                              if(_countriesList && _countriesList.data){
                                           $scope.countriesList=new kendo.data.DataSource({
                                           data : _countriesList.data.countries
                                 });
				$scope.wzModel.wifi.country = $scope.countriesList.options.data[0].name;
                              }
                }); 

		$scope.wzModel.wifi.networkSecurity = 'enterprise';
		$scope.useSwitchCredentials = false;
		// Security Type dropdown options
		$scope.securityTypes=dayZeroStepService.securityTypes();
		
		$scope.wirelessVlan=dayZeroStepService.wirelessVlan();
		$scope.interConfig=dayZeroStepService.getInterConfig();
		$scope.wzModel.wifi.mgmtSubnetMask = "255.255.255.0"; 
		$scope.$watch(function() {
			return dayZeroStepService.getInterConfig();
		}, function(newValue) {
			$scope.interConfig = newValue;
			if(($scope.interConfig.hasOwnProperty('wirelessVlan')) && ($scope.interConfig.wirelessVlan  != "" && $scope.interConfig.wirelessVlan != undefined)){
				$scope.wirelessPossible = true;
			}else{
				$scope.wirelessPossible = false;
			}
			dayZeroStepService.setWirelessPossible($scope.wirelessPossible);
			$scope.wzModel.wifi.defaultGateway = $scope.interConfig.vlanIpAddress;
		},true);
		$scope.$watch(function() {
			return dayZeroStepService.getBasicConfig();
		}, function(newValue) {
			$scope.getRouterAccount();	// load username and password in default
		},true);
		var clearAllHelpMsg = function(){
			$scope.wirelessReenterPhasspharseTip = false;
			$scope.wirelessPhassPharseTip = false;
			$scope.wirelessAuthPortTip = false;
			$scope.wirelessSharedKeyTip =false;
			$scope.wirelessRadiusServerTip = false;
			$scope.wirelessHelpCommonTip=false;
			$scope.wirelessCopyCredential=false;
			$scope.wirelessUserNameTip=false;
			$scope.wirelessPasswordTip=false;
			$scope.wirelessReenterPasswordTip=false;
			$scope.wirelessCountryTip=false;			
			$scope.wirelessMgmtIpaddressTip=false;
			$scope.wirelessEnableDHCPTip=false;
			$scope.wirelessNetworkNameTip=false;
			$scope.wirelessNetworkSecurityTip=false;
		}
		$scope.defaultVlans = dayZeroStepService.getIpAddressAssign();
		$scope.changeWifiMode = function(){
			if($scope.wzModel.wifi.wifiEnabled === translate('toggle_on')){
				$scope.wzModel.wifi.defaultVlans = dayZeroStepService.getIpAddressAssign()[0];
			}
		}
		var ipAddressReg=/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		var subnetRegex = /^(255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252)$/;
		$scope.wizardValidations = {
			rules: {
				validateip:function(input){
					var valMsg = input.data('validateipMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					var ipAddress=input.val();
					if (ipAddress=="0.0.0.0" || '') {
						return false;
					}
					if (ipAddressReg.test(ipAddress)) {
						return true;
					};
					return false;
				},
				duplicatewirelessip: function(input){
					var valMsg = input.data('duplicatewirelessipMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if($scope.interConfig.hasOwnProperty("vlanIpAddress") && $scope.interConfig.vlanIpAddress == input.val()){
						return false;	
					}
					return true;
				},
				invalidwirelessip: function(input){
					var valMsg = input.data('invalidwirelessipMsg');
					if ((valMsg==undefined)) {
                                                return true;
                                        }
					var wirelessVlanSubnet = $scope.interConfig.vlanSubnetMask;
					var wirelessVlanNW = networkIPDetails.getNetworkIP($scope.interConfig.vlanIpAddress, wirelessVlanSubnet);
                                        if(!$scope.validateIPForNetwork(input.val(),wirelessVlanNW,wirelessVlanSubnet)){
						var range = $scope.getNetworkRange(wirelessVlanNW+"/"+wirelessVlanSubnet); 
						var errorMsg = translate('wireless_mgmt_ip_address_invalid');
						errorMsg = errorMsg.replace("{0}",range[0]);
						errorMsg = errorMsg.replace("{1}",range[1]);
						input[0].dataset.invalidwirelessipMsg = errorMsg;
                                                return false;
                                        }
                                        return true;
				},
				routevalidate:function(input){
					var valMsg = input.data('routevalidateMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					//One of the IP addresses is mandatory
					//IP can be on default vlan1, data vlan or voice vlan
					if(angular.element("#newIpAddress1").val()){
						if(angular.element("#newIpAddress").val() == "" &&
						angular.element("#newIpAddress0").val() == "" && angular.element("#newIpAddress1").val() == ""){
							return false;
						}
					}
					else if(angular.element("#newIpAddress").val() == "" &&
						angular.element("#newIpAddress0").val() == ""){
						return false;
					}
					if (input.val()==''){
						return true;
					}
					if (input.val()=="0.0.0.0"){
						return false;
					}
					if (ipAddressReg.test(input.val()) && input.val()!='') {
						return true;
					};
					return false;
				},
				submaskvalidate:function(input){
					var valMsg = input.data('submaskvalidateMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					//check for its corresponding IP. If the IP is not empty, the subnet should be validated
					var subnetId = input[0].id;
					var myIp = "";
					if(subnetId == "subnetMask"){
						myIp = angular.element("#newIpAddress").val();
					} else if (subnetId == "subnetMask0"){
						myIp = angular.element("#newIpAddress0").val();
					} else {
						myIp = angular.element("#newIpAddress1").val();
					}
					if(input.val()==""){
						if(myIp != ""){
							return false;
						} else {
							return true;
						}
					}
					if (input.val()=="0.0.0.0"){
						return false;
					}
					if (subnetRegex.test(input.val()) && input.val()!='') {
						return true;
					};
					return false;
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
						else return true;
					}else{
						return true;
					}
				},
				minchar: function(input){
					var field = input.val(); 
					var minlen = input.data('minchar');
					var valMsg = input.data('mincharMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(minlen && field.length >= minlen){
						return true;
					}
					return false;
				},
				pwdvalid: function(input){
					var field = input.val(); 
					var minlen = input.data('pwdmin');
					if(minlen){
						var valMsg = input.data('pwdvalidMsg');
						if ((valMsg==undefined)) {
							return true;
						}
						if(field.length >= minlen)
						{ 
							var pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]/;
							return pwdReg.test(field);
						}
						return false;	
					}
					return true;
				},
				pwdmatch: function(input){
					var pwd = input.val();
					var valMsg = input.data('pwdmatchMsg');
					var matchModel = input.data('pwdmatch');
					if ((valMsg==undefined)) {
						return true;
					}
					if($scope.wzModel.wifi[matchModel] === pwd){
						return true;
					}
					return false;
				}
			}
		};

		$scope.IPnumber = function(IPaddress) {
    			var ip = IPaddress.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    			if(ip) {
        			return (+ip[1]<<24) + (+ip[2]<<16) + (+ip[3]<<8) + (+ip[4]);
    			}
    			// else ... ?
    			return null;
		};
		$scope.IPmask = function(mask) {
			//convert mask to prefix;
			var maskSize = (mask.split('.').map(Number).map(part => (part >>> 0).toString(2)).join('')).split('1').length -1;
    			return -1<<(32-maskSize)
		}
		$scope.validateIPForNetwork = function(inputIP,wirelessVlanNW,wirelessVlanSubnet){
			return (($scope.IPnumber(inputIP) & $scope.IPmask(wirelessVlanSubnet)) == 
					($scope.IPnumber(wirelessVlanNW) & $scope.IPmask(wirelessVlanSubnet)));	
		};
		$scope.getNetworkRange = function(networkSubnet) {
			var part = networkSubnet.split("/"); // part[0] = base address, part[1] = netmask
  			var ipaddress = part[0].split('.');
  			var netmaskblocks = ["0","0","0","0"];
  			if(!/\d+\.\d+\.\d+\.\d+/.test(part[1])) {
    				// part[1] has to be between 0 and 32
    				netmaskblocks = ("1".repeat(parseInt(part[1], 10)) + "0".repeat(32-parseInt(part[1], 10))).match(/.{1,8}/g);
    				netmaskblocks = netmaskblocks.map(function(el) { return parseInt(el, 2); });
  			} else {
    				// xxx.xxx.xxx.xxx
    				netmaskblocks = part[1].split('.').map(function(el) { return parseInt(el, 10) });
  			}
  			// invert for creating broadcast address (highest address)
  			var invertedNetmaskblocks = netmaskblocks.map(function(el) { return el ^ 255; });
  			var baseAddress = ipaddress.map(function(block, idx) { return block & netmaskblocks[idx]; });
  			var broadcastaddress = baseAddress.map(function(block, idx) { return block | invertedNetmaskblocks[idx]; });
  			return [baseAddress.join('.'), broadcastaddress.join('.')];
		};

		$scope.$on("dayZeroWizard:intialload", function() {
			var userData=dayZeroStepService.getData();
			$scope.wzModel.wifi.adminUserName=userData.user.username;
			$scope.wzModel.wifi.adminPassword=atob(userData.user.password);
			$scope.wzModel.wifi.confirmAdminPassword=atob(userData.user.password);
			$scope.wzModel.wifi.sameAsRouter=false;
		});
		$scope.getRouterAccount=function(){
			if($scope.wzModel.wifi.sameAsRouter){
				$scope.useSwitchCredentials = true;
				var userData=dayZeroStepService.getBasicConfig();
				$scope.wzModel.wifi.adminUserName=userData.userName;
				$scope.wzModel.wifi.adminPassword=userData.password;
				$scope.wzModel.wifi.confirmAdminPassword=userData.password;
			}else{
				$scope.useSwitchCredentials = false;
				var userData=dayZeroStepService.getBasicConfig();
				$scope.wzModel.wifi.adminUserName="";
				$scope.wzModel.wifi.adminPassword="";
				$scope.wzModel.wifi.confirmAdminPassword="";
			}
			angular.element("#wifiPageForm  span.k-tooltip-validation").hide();
		}
		$scope.changeSecurityType = function(){
			$timeout(function(){
				clearAllHelpMsg();
				$scope.wirelessNetworkSecurityTip=true;   
			},0);
		}
		$scope.changeCountry = function(){
			$timeout(function(){
				clearAllHelpMsg();
				$scope.wirelessCountryTip=true;           
			},0);
		}
		$scope.loadInputsOnBlurEvent = function(){
			angular.element("input, select").on("blur", function () {
				$timeout(function(){
					clearAllHelpMsg();
					$scope.wirelessHelpCommonTip=true;
				},0);
			});
		}
		$scope.InitLoadWireless = function name(params) {
			$scope.loadInputsOnBlurEvent();
			angular.element("input, select").on("focus", function () {
				$timeout(function(){
					$scope.wirelessHelpCommonTip=false;
				},0);
			});
			angular.element("#switchPassCheck").on("focus", function () {
				$timeout(function(){
					$scope.wirelessCopyCredential=true;      
				},0);
			});
			angular.element("#adminUserName").on("focus", function () {
				$timeout(function(){
					$scope.wirelessUserNameTip=true;         
				},0);
			});
			angular.element("#adminPassword").on("focus", function () {
				$timeout(function(){
					$scope.wirelessPasswordTip=true;          
				},0);
			});
			angular.element("#confirmAdminPassword").on("focus", function () {
				$timeout(function(){
					$scope.wirelessReenterPasswordTip=true;   
				},0);
			});
			angular.element("#mgmtIpAddress , #mgmtSubnetMask").on("focus", function () {
				$timeout(function(){
					clearAllHelpMsg();
					$scope.wirelessMgmtIpaddressTip=true;     
				},0);
			});
			angular.element("#enableDHCP").on("focus", function () {
				$timeout(function(){
					$scope.wirelessEnableDHCPTip=true;        
				},0);
			});
			angular.element("#networkName").on("focus", function () {
				$timeout(function(){
					$scope.wirelessNetworkNameTip=true;       
				},0);
			});
		}
		$scope.loadEnterpriseOptionElements = function(){
			angular.element("#radiusServer").on("focus", function () {
				$timeout(function(){
					clearAllHelpMsg();
					$scope.wirelessRadiusServerTip = true;
				},0);
			});
			angular.element("#sharedKey").on("focus", function () {
				$timeout(function(){
					clearAllHelpMsg();
					$scope.wirelessSharedKeyTip =true;
				},0);
			});
			angular.element("#authPort").on("focus", function () {
				$timeout(function(){
					clearAllHelpMsg();
					$scope.wirelessAuthPortTip = true;
				},0);
			});
		}
		$scope.$watch("wzModel.wifi.networkSecurity", function(newVal){
			$timeout(function(){
				angular.element("#radiusServer").on("focus", function () {
					$timeout(function(){
						clearAllHelpMsg();
						$scope.wirelessRadiusServerTip = true;
					},0);
				});
				angular.element("#sharedKey").on("focus", function () {
					$timeout(function(){
						clearAllHelpMsg();
						$scope.wirelessSharedKeyTip =true;
					},0);
				});
				angular.element("#authPort").on("focus", function () {
					$timeout(function(){
						clearAllHelpMsg();
						$scope.wirelessAuthPortTip = true;
					},0);
				});
				angular.element("#pskPassword").on("focus", function () {
					$timeout(function(){
						clearAllHelpMsg();
						$scope.wirelessPhassPharseTip = true;
					},10);
				});
				angular.element("#confirmPskPassword").on("focus", function () {
					$timeout(function(){
						clearAllHelpMsg();
						$scope.wirelessReenterPhasspharseTip = true;					
					},10);
				});
			},100);
		});
		$scope.$on("dayZeroWizard:nextButtonPressed", function(evt, laststep, stepNumber) {
			if (stepNumber === 4) {
				$scope.wifiValidator = $scope.wifiPageValidator;
				validationService.addValidator($scope.wifiPageValidator, 3);
				validationService.setWirelessPossible($scope.wirelessPossible);
				if ( ($scope.wirelessPossible) || ($scope.wifiValidator && $scope.wifiValidator.validate()) ) {
					dayZeroStepService.setWireless($scope.wzModel);
				}
			}
		});
	}
]);
