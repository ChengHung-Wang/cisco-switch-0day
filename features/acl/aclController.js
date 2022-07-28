/**
 Description: ACL Controller
 August 2017
 Copyright (c) 2017 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';
app.register.controller('aclCtrl', ['$scope', 'dataSourceService', 'validationService','$window','dialogService','$filter','$routeParams','gridCrudService','requestRoutingService','notificationService','$timeout','executeCliCmdService','getStringLineService','$rootScope',
    function($scope, dataSourceService, validationService,window,dialogService,$filter,$routeParams,gridCrudService,requestRoutingService,notificationService,$timeout,executeCliCmdService,getStringLineService,$rootScope) {
        var trimVal=$filter('trimValue');
        var translate = $filter("translate");
        var aclCLI="show access-list\n";
        $scope.displayLater = false;
        angular.element(".pageLoader").show();
        var shRunInterface = "show running-config | section interface\n show ip interface brief\n show access-list\n";
		var shRunIntCLIOP;
		$timeout(function(){
			shRunIntCLIOP = deviceCommunicatorCLI.getExecCmdOutput(shRunInterface);
		}, 10);
        $scope.aclMainGridData = new kendo.data.ObservableArray([]);
        $scope.inAceView = false;
        $scope.inAclView = true;
        $scope.acl = {  aclType: null,
            aclAction: 'permit',
            aclProtocol: 'ahp',
            destinationType: null,
            sourceType: null,
            sourceIp: '',
            sourceMask: '',
            destinationIp: '',
            destinationMask: '',
            destinationHostName: '',
            sourceHostName: '',
            sourceIpv6: '',
            sourceIpv6Mask: '',
            destinationIpv6: '',
            destinationIpv6Mask: '',
            aclDSCP: translate('ntp_none'),
            aclSourcePort: null,
            aclDestinationPort: null,
            aclSrcPortValue: '',
            aclSrcPort2Value: '',
            aclDestPort2Value: '',
            aclDestPortValue: '',
            outboundAssociatedOptions:[],
            inboundAssociatedOptions:[],
            dhcpRelayInfo: translate("toggle_down")
        };
        $scope.outBoundSupporting =  ($rootScope.deviceInfo.type.indexOf("S5960") != -1 && $rootScope.deviceInfo.type.indexOf("S5960L") == -1) || ($rootScope.deviceInfo.type.indexOf('C3560CX') != -1) ? true : false;
        $scope.VlanSupporting = ($rootScope.deviceInfo.type.indexOf('C2960X') != -1) || ($rootScope.deviceInfo.type.indexOf("S5960") != -1 && $rootScope.deviceInfo.type.indexOf("S5960L") == -1) || ($rootScope.deviceInfo.type.indexOf('C3560CX') != -1) ? true : false;
        $scope.displayACLFields = true;
        $scope.displayACLAssFields = false;
        $scope.inboundAvailablePortsOption = [];
        $scope.outboundAvailablePortsOption = [];
        $scope.selectedAcls = [];
        $scope.selectedAces = [];
        $scope.aclActionOptions = [{"text":translate('acl_permit'),"value":'permit'},{"text":translate('acl_deny'),"value":'deny'}];
        $scope.loadAclSourceTypeOptions = function(){
            $timeout(function(){
                $scope.aclSourceTypeOptions = [{"text" : translate('acl_any'),"value" : 'any'},{"text" : translate('acl_host'),"value" : 'Host'},{"text":  translate('clients_ip'),"value" : 'IP'}];
                $scope.acl.sourceType = 'any';
				$scope.arpDestinationTypeOptions = [{"text" : translate('acl_any'),"value" : 'any'},{"text" : translate('acl_host'),"value" : 'Host'}];
            },1000);
        };
        $scope.loadAclDestinationTypeOptions = function(){
            $timeout(function(){
                $scope.acl.destinationType = 'any';
            },1000);
        };
        $scope.loadAclPortOptions = function() {
            $timeout(function() {
                $scope.aclPortOptions = [{"text": translate('ntp_none'), "value": 'None'}, {
                    "text": translate('acl_eq'),
                    "value": 'eq'
                }, {"text": translate('acl_gt'), "value": 'gt'}, {
                    "text": translate('acl_lt'),
                    "value": 'lt'
                }, {"text": translate('acl_neq'), "value": 'neq'}, {"text": translate('acl_range'), "value": 'range'}];
                $scope.acl.aclSourcePort = $scope.aclPortOptions[0].text;
            },1000);
        }
        $scope.loadAclDestPortOptions = function() {
            $timeout(function() {
                $scope.aclPortOptions = [{"text": translate('ntp_none'), "value": 'None'}, {
                    "text": translate('acl_eq'),
                    "value": 'eq'
                }, {"text": translate('acl_gt'), "value": 'gt'}, {
                    "text": translate('acl_lt'),
                    "value": 'lt'
                }, {"text": translate('acl_neq'), "value": 'neq'}, {"text": translate('acl_range'), "value": 'range'}];
                $scope.acl.aclDestinationPort = $scope.aclPortOptions[0].text;
            },1000);
        }
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
        var aclProtocolOptions = function() {
                return new kendo.data.DataSource({
                    data : [
                        {
                            protocolType : 'ahp',
                            protoVal : 'ahp'
                        }, {
                            protocolType : 'eigrp',
                            protoVal : 'eigrp'
                        }, {
                            protocolType : 'gre',
                            protoVal : 'gre'
                        }, {
                            protocolType : 'icmp',
                            protoVal : 'icmp'
                        }, {
                            protocolType : 'igmp',
                            protoVal : 'igmp'
                        }, {
                            protocolType : 'ip',
                            protoVal : 'ip'
                        }, {
                            protocolType : 'ipinip',
                            protoVal : 'ipinip'
                        }, {
                            protocolType : 'nos',
                            protoVal : 'nos'
                        }, {
                            protocolType : 'ospf',
                            protoVal : 'ospf'
                        }, {
                            protocolType : 'pcp',
                            protoVal : 'pcp'
                        }, {
                            protocolType : 'pim',
                            protoVal : 'pim'
                        }, {
                            protocolType : 'tcp',
                            protoVal : 'tcp'
                        }, {
                            protocolType : 'udp',
                            protoVal : 'udp'
                        }]
                });
            },
            aclIPv6ProtocolOptions = function() {
                return new kendo.data.DataSource({
                    data : [
                        {
                            protocolType : 'ahp',
                            protoVal : 'ahp'
                        }, {
                            protocolType : 'esp',
                            protoVal : 'esp'
                        }, {
                            protocolType : 'icmp',
                            protoVal : 'icmp'
                        }, {
                            protocolType : 'ipv6',
                            protoVal : 'ipv6'
                        }, {
                            protocolType : 'pcp',
                            protoVal : 'pcp'
                        }, {
                            protocolType : 'sctp',
                            protoVal : 'sctp'
                        }, {
                            protocolType : 'tcp',
                            protoVal : 'tcp'
                        }, {
                            protocolType : 'udp',
                            protoVal : 'udp'
                        }]
                });
            },
            aclPortOptions = function() {
                return new kendo.data.DataSource({
                    data : [
                        {
                            portType : '0-65535',
                            portVal : '0-65535'
                        }, {
                            portType : 'bgp(179)',
                            portVal : 'bgp'
                        }, {
                            portType : 'chargen(19)',
                            portVal : 'chargen'
                        }, {
                            portType : 'rcmd(514)',
                            portVal : 'cmd'
                        }, {
                            portType : 'daytime(13)',
                            portVal : 'daytime'
                        }, {
                            portType : 'discard(9)',
                            portVal : 'discard'
                        }, {
                            portType : 'domain(53)',
                            portVal : 'domain'
                        }, {
                            portType : 'echo',
                            portVal : 'echo'
                        }, {
                            portType : 'exec(rsh(512))',
                            portVal : '512'
                        }, {
                            portType : 'finger(79)',
                            portVal : 'finger'
                        }, {
                            portType : 'ftp(21)',
                            portVal : 'ftp'
                        }, {
                            portType : 'gopher(70)',
                            portVal : 'gopher'
                        }, {
                            portType : 'hostname(101)',
                            portVal : 'hostname'
                        }, {
                            portType : 'indent(113)',
                            portVal : 'indent'
                        }, {
                            portType : 'irc(194)',
                            portVal : 'irc'
                        }, {
                            portType : 'klogin(543)',
                            portVal : 'klogin'
                        }, {
                            portType : 'kshell(544)',
                            portVal : 'kshell'
                        }, {
                            portType : 'login(513)',
                            portoVal : 'login'
                        }, {
                            portType : 'lpd(515)',
                            portVal : 'lpd'
                        }, {
                            portType : 'nntp(119)',
                            portVal : 'nntp'
                        }, {
                            portType : 'pim-auto-rp(496)',
                            portVal : 'pim-auto-rp'
                        }, {
                            portType : 'pop2(109)',
                            portVal : 'pop2'
                        }, {
                            portType : 'pop3(110)',
                            portVal : 'pop3'
                        }, {
                            portType : 'smtp(25)',
                            portVal : 'smtp'
                        }, {
                            portType : 'sunrpc(111)',
                            portVal : 'sunrpc'
                        }, {
                            portType : 'syslog(514)',
                            portVal : 'syslog'
                        }, {
                            portType : 'tacacs(49)',
                            portVal : 'tacacs'
                        }, {
                            portType : 'talk(517)',
                            portVal : 'talk'
                        }, {
                            portType : 'telnet(23)',
                            portVal : 'telnet'
                        }, {
                            portType : 'time(37)',
                            portVal : 'time'
                        }, {
                            portType : 'uucp(540)',
                            portVal : 'uucp'
                        }, {
                            portType : 'whois(43)',
                            portVal : 'whois'
                        }, {
                            portType : 'www((http)80)',
                            portVal : 'www'
                        }]
                });
            },
            aclIPv6PortOptions = function() {
                return new kendo.data.DataSource({
                    data : [
                        {
                            portType : '0-65535',
                            portVal : '0-65535'
                        }, {
                            portType : 'biff(512)',
                            portVal : 'biff'
                        }, {
                            portType : 'bootpc(68)',
                            portVal : 'bootpc'
                        }, {
                            portType : 'bootps(67)',
                            portVal : 'bootps'
                        }, {
                            portType : 'discard(9)',
                            portVal : 'discard'
                        }, {
                            portType : 'dnsix(195)',
                            portVal : 'dnsix'
                        }, {
                            portType : 'domain(53)',
                            portVal : 'domain'
                        }, {
                            portType : 'echo',
                            portVal : 'echo'
                        }, {
                            portType : 'isakmp(500)',
                            portVal : 'isakmp'
                        }, {
                            portType : 'mobile-ip',
                            portVal : 'mobile-ip'
                        }, {
                            portType : 'nameserver',
                            portVal : 'nameserver'
                        }, {
                            portType : 'netbios-dgm(1328)',
                            portVal : 'netbios-dgm'
                        }, {
                            portType : 'netbios-ns(137)',
                            portVal : 'netbios-ns'
                        }, {
                            portType : 'netbios-ss(139)',
                            portVal : 'netbios-ss'
                        }, {
                            portType : 'non500-isakmp',
                            portVal : 'non500-isakmp'
                        }, {
                            portType : 'ntp(123)',
                            portVal : 'ntp'
                        }, {
                            portType : 'pim-auto-rp(496)',
                            portVal : 'pim-auto-rp'
                        }, {
                            portType : 'rip(520)',
                            portVal : 'rip'
                        }, {
                            portType : 'ripv6(521)',
                            portVal : 'ripv6'
                        }, {
                            portType : 'snmp(161)',
                            portVal : 'snmp'
                        }, {
                            portType : 'snmptrap(162)',
                            portVal : 'snmptrap'
                        }, {
                            portType : 'sunrpc(111)',
                            portVal : 'sunrpc'
                        }, {
                            portType : 'syslog(514)',
                            portVal : 'syslog'
                        }, {
                            portType : 'tacacs(49)',
                            portVal : 'tacacs'
                        }, {
                            portType : 'talk(517)',
                            portVal : 'talk'
                        }, {
                            portType : 'tftp(69)',
                            portVal : 'tftp'
                        }, {
                            portType : 'time(37)',
                            portVal : 'time'
                        }, {
                            portType : 'who(513)',
                            portVal : 'who'
                        }, {
                            portType : 'xdmcp(177)',
                            portVal : 'xdmcp'
                        }]
                });
            };
        $scope.aclValidations = {
            rules: {
                ip : function(input) {
                    return input.data('ipMsg') ? validationService.validateIpAddress(input.val()) : true;
                },
                space : function(input) {
                    return input.data('spaceMsg') ? validationService.validateSpecialCharacters(input.val()) : true;
                },
                maximum : function(input) {
                    return input.data('maximum') ? validationService.validateMaximumLength(input.val(), input.data('maximum')) : true;
                },
                minimum : function(input) {
                    return input.data('minimum') ? validationService.validateMinimumLength(input.val(), input.data('minimum')) : true;
                },
                range: function (input) {
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
				},
                reservedIp : function(input) {
                    return input.data('reservedipMsg') ? validationService.validateReservedIpAddress(input.val()) : true;
                },
                ipv6 : function(input) {
                    return input.data('ipv6Msg') ? validationService.validateIpv6Address(input.val()) : true;
                },
                aclsequencevalidation : function(input) {
                    if (input.data('aclsequencevalidationMsg')) {
                        var range = "1-2147483647";
                        if ($scope.currentAclType === "IPv6") {
                            range = "1-4294967294";
                        }
                        if (validationService.validateNumericRange(input.val(), range)) {
                            for (var index = 0; index < $scope.aceGrid.dataSource._data.length; index++) {
                                if (($scope.aceGrid.dataSource._data[index+""].Sequence === input.val())) {
                                    input.attr("data-aclsequencevalidation-msg", translate('acl_seq_exist'));
                                    return false;
                                }

                            }
                        } else {
                            if ($scope.currentAclType === "IPv6") {
                                input.attr("data-aclsequencevalidation-msg", translate('acl_seq_range1'));
                            } else {
                                input.attr("data-aclsequencevalidation-msg", translate('acl_seq_range2'));
                            }
                            return false;
                        }
                    }
                    return true;
                },
                aclsrcportvalidation: function (input) {
                    if (input.is("[name='aclSrcPortValue']") || input.is("[name='aclSrcPort2Value']") || input.is("[name='aclDestPortValue']") || input.is("[name='aclDestPort2Value']")) {
                        if (input.val() != "") {
                            var val = input.val().trim().toLowerCase();
                            if (input.val().match(/^[0-9]+$/)) {
                                input.attr("data-aclsrcportvalidation-msg", translate('acl_port_range65535'));
                                var range = "0-65535";
                                return validationService.validateNumericRange(input.val(), range);
                            } else {
                                input.attr("data-aclsrcportvalidation-msg", translate('acl_invalid_portString'));
                                if(['TCP','tcp','6',6].getIndexBy($scope.acl.aclProtocol)!=-1) {
                                    return(["bgp", "chargen", "cmd", "daytime", "discard",
                                        "domain", "echo", "exec", "finger", "ftp", "gopher", "hostname", "indent",
                                        "irc", "klogin", "kshell", "login", "lpd", "nntp", "pim-auto-rp", "pop2",
                                        "pop3", "smtp", "sunrpc", "syslog", "tacacs", "talk", "telnet",
                                        "time", "uucp", "whois", "www"].getIndexBy(val) != -1);
                                }
                                else {
                                    return(["biff", "bootpc", "bootps", "discard", "dnsix",
                                        "domain", "echo", "isakmp", "mobile-ip", "nameserver", "netbios-dgm",
                                        "netbios-ns", "netbios-ss", "non500-isakmp", "ntp", "pim-auto-rp", "rip",
                                        "ripv6", "snmp", "snmptrap", "sunrpc", "syslog", "tacacs", "talk", "tftp",
                                        "time", "who", "xdmcp"].getIndexBy(val) != -1);
                                }
                            }
                            return true;
                        } else {
                            input.attr("data-aclsrcportvalidation-msg", translate('com_field_mandatory'));
                        }
                    }
                    else  {
                        return true;
                    }
                },
				isvalidmacaddress: function(input) {
					if (angular.isUndefined(input.data('isvalidmacaddress'))) {
						return true;
					} else {
						var testString;
						var RegEx='';
						if ( typeof input == 'string') {
							testString = input;
						} else {
							testString = input.val();
						}if(testString.indexOf(".")!=-1){
							RegEx = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
							if (RegEx.test(testString) || testString== "") {
								return true;
							} else {
								return false;
							}
						}
					}
				},
                nameorip: function(input){
                    if (input.data('nameoripMsg')) {
                        var val = input.val();
                        if(validationService.validateIpAddress(input.val())){
                            return true;
                        }
                        if(val.split(".").length == 1){
                            return true;
                        }
                        return false;
                    }else  {
                        return true;
                    }
                }
            }
        };
        $scope.loadAclTypeOptions = function(){
            $timeout(function(){
                if($rootScope.deviceInfo.type.indexOf('C2960C-') != -1 || $rootScope.deviceInfo.type.indexOf('C2960+') != -1){
                    $scope.aclTypeOptions = [{"text" : translate('acl_ipv4_standard'),"value" : 'IPv4 Standard'},{"text" : translate('acl_ipv4_extended'),"value" : 'IPv4 Extended'}];
                }else{
                    $scope.aclTypeOptions = [{"text" : translate('acl_ipv4_standard'),"value" : 'IPv4 Standard'},{"text" : translate('acl_ipv4_extended'),"value" : 'IPv4 Extended'},{"text":translate('portconfig_adv_ipv6label'),"value":'IPv6'},{"text":translate('switch_mac'),"value":'MAC'},{"text":translate('common_arp'),"value":'ARP'}];
                }
                $scope.acl.aclType = 'IPv4 Standard';
            },1000);
        };
        // Method for edit ACL Data
        $scope.isEdit = false;
        var editExistACL = function () {
            angular.element(".popupDone").text(translate("com_update_and_apply"));
            angular.element("#aclQuicksetupForm  span.k-tooltip-validation").hide();
            $scope.isEdit = true;
            $scope.displayACLFields = false;
            $scope.displayACLAssFields = !$scope.displayACLFields;
            $scope.tempInboundAssociatedOptions = [];
            $scope.tempOutboundAssociatedOptions = [];
            $scope.inboundAvailablePortsOption = [];
            $scope.outboundAvailablePortsOption = [];
            var selectedACL = this.dataItem(this.select());
            $scope.acl = {  aclName:selectedACL.Name,
                inbound:{},
                outbound:{},
                inboundAssociatedOptions:[],
                outboundAssociatedOptions:[]
            };
            $scope.acl.aclType = selectedACL.Type;
            angular.element("#aclTypeDropDown").data('kendoDropDownList').value($scope.acl.aclType);
            var op = shRunIntCLIOP[0].split("interface");
            for(var i = 1; i < op.length; i++){
                var portsObj = {};
                var intShowRun="interface "+op[i],
                    arrIntShowRun=	intShowRun.split("\n");
                if( arrIntShowRun[0].indexOf("Ethernet")!=-1 || arrIntShowRun[0].indexOf("Te")!=-1|| arrIntShowRun[0].indexOf("Bluetooth")!=-1 || arrIntShowRun[0].indexOf("Loopback")!=-1 || arrIntShowRun[0].indexOf("Vlan")!=-1){
                    var inOutBoundsOP =executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim(),
                    inOBOPs = "";
                    if(inOutBoundsOP.indexOf("input") == -1){
                        inOBOPs = $scope.formatInt(inOutBoundsOP);
                        $scope.inboundAvailablePortsOption.push(inOBOPs);
                    }
                    var dhcpRelay =executeCliCmdService.getNextString(intShowRun,["ip dhcp relay information"],["\n"]).trim();
                    if(intShowRun.indexOf("ip access-group "+selectedACL.Name) != -1 || intShowRun.indexOf("ipv6 traffic-filter "+selectedACL.Name) != -1){
                        $scope.acl.dhcpRelayInfo = (dhcpRelay == "trusted" ? translate("toggle_up") : translate("toggle_down"));
                        $scope.acl.OnEditdhcpRelayInfo = $scope.acl.dhcpRelayInfo;
                        if(intShowRun.indexOf("ip access-group "+selectedACL.Name+" in") != -1 || intShowRun.indexOf("ipv6 traffic-filter "+selectedACL.Name+" in") != -1){
                            $scope.acl.inbound.selectedAssociatedPorts = [inOBOPs];
                            $scope.acl.inboundAssociatedOptions.push(inOBOPs);
                            $scope.tempInboundAssociatedOptions.push(inOBOPs);
                        }
                        if(intShowRun.indexOf("ip access-group "+selectedACL.Name+" out") != -1 || intShowRun.indexOf("ipv6 traffic-filter "+selectedACL.Name+" out") != -1){
                            $scope.acl.outbound.selectedAssociatedPorts = [inOBOPs];
                            $scope.acl.outboundAssociatedOptions.push(inOBOPs);
                            $scope.tempOutboundAssociatedOptions.push(inOBOPs);
                        }
                    }
                }
                $scope.inboundAvailablePortsOption = $scope.inboundAvailablePortsOption.filter(function(val) {
                    return $scope.acl.inboundAssociatedOptions.indexOf(val) == -1;
                });
                if($scope.outBoundSupporting){
                    $scope.outboundAvailablePortsOption = $scope.routedSwitch().filter(function(val) {
                        return $scope.acl.outboundAssociatedOptions.indexOf(val) == -1;
                    });
                }
            }
            $scope.$broadcast('openAddDialog:aclMainWindow',translate('acl_add_acl'));
        };
        $scope.translateAclType = function(_type){
            var op = "";
            if(_type == "IPv4 Standard"){
                op = translate('acl_ipv4_standard');
            }else if(_type == "IPv4 Extended"){
                op = translate('acl_ipv4_extended');
            }else if(_type == "IPv6"){
                op = "IPv6";
            }else if(_type == "ARP"){
                op = "ARP";
            }else if(_type == "MAC"){
                op = "MAC";
            }
            return op;
        }
        $scope.aclProtocolOptions = aclProtocolOptions();
        $scope.aclDSCPOptions = [{"text" : 'AF11',"value" : 'AF11'},{"text" : 'AF12',"value" : 'AF12'},{"text" : 'AF13',"value" : 'AF13'}, {"text" : 'AF21',"value" : 'AF21'},{"text" : 'AF22',"value" : 'AF22'}, {"text" : 'AF23',"value" : 'AF23'}, {"text" : 'AF31',"value" : 'AF31'},{"text" : 'AF32',"value" : 'AF32'}, {"text" : 'AF33',"value" : 'AF33'},{"text" : 'AF41',"value" : 'AF41'}, {"text" : 'AF42',"value" : 'AF42'}, {"text" : 'AF43',"value" : 'AF43'},{"text" : 'CS1',"value" : 'CS1'}, {"text" : 'CS2',"value" : 'CS2'},{"text" : 'CS3',"value" : 'CS3'}, {"text" : 'CS4',"value" : 'CS4'}, {"text" : 'CS5',"value" : 'CS5'},{"text" : 'CS6',"value" : 'CS6'}, {"text" : 'CS7',"value" : 'CS7'},{"text" : translate('port_config_default'),"value" : 'DEFAULT'},{"text" : 'EF',"value" : 'EF'}];
        $scope.aclGridOptions = {
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
                refresh: false,
                pageSizes: gridCrudService.grid_page_sizes, // This page size variable is written in datasourceService.js file.
                buttonCount: 4
            },
            change : editExistACL,
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
            scrollable:false,
            selectable: true,
            columns: [
                {
                    "template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-change=\"isChecked(checked,dataItem,selectedAcls)\"  />",
                    sortable: false,
                    width: 40
                },
                {
                    field: "Name",
                    title: translate("com_name")
                },
                {
                    field: "Type",
                    title : translate("management_snmp_host_type"),
                    template : "{{ translateAclType(dataItem.Type) }}",
                },
                {
                    field: "aceCount",
                    template: "<div class='padding-left-4'><div class='aceCount' ng-click='flipToAces(\"#=Name#\",\"#=Type#\", $event)'>#=aceCount#</div></div>",
                    title : translate("acl_count")
                },
                {
                    field: "interfaces",
                    title : translate("portconfig_general_interface")
                }
            ]
        };
        var comparingArray = function (a1, a2) {
            var com = a1.filter(function(obj) {
                return a2.indexOf(obj) == -1;
            });
            return com;
        }
        var accessListsConfigurations = function(params){
            this.params = params;
            this.cli = "";
            this.config = function(){
                // formation ACL and ACE CLI for Create new ACL
                if(this.params.hasOwnProperty('createdAcl')){
                    if(this.params.createdAcl.aclType == "IPv4 Standard"){
                        this.cli += "ip access-list standard "+this.params.createdAcl.aclName+" \n"
                    }else if(this.params.createdAcl.aclType == "IPv4 Extended"){
                        this.cli += "ip access-list extended "+this.params.createdAcl.aclName+" \n"
                    }else if(this.params.createdAcl.aclType == "IPv6"){
                        this.cli += "ipv6 access-list "+this.params.createdAcl.aclName+" \n"
                    }else if(this.params.createdAcl.aclType == "MAC"){
                        this.cli += "mac access-list extended "+this.params.createdAcl.aclName+" \n"
                    }else if(this.params.createdAcl.aclType == "ARP"){
                        this.cli += "arp access-list "+this.params.createdAcl.aclName+" \n"
                    }
                    // formation Acl Sequence number
                    if((this.params.createdAcl.aclType != "IPv6") && (this.params.createdAcl.Sequence)){
                            this.cli += this.params.createdAcl.Sequence+" ";
                    }
                    this.cli += this.params.createdAcl.aclAction+" ";
                    if(this.params.createdAcl.aclType == "IPv4 Standard"){
                        if(this.params.createdAcl.sourceType == 'any'){
                            this.cli +="any \n";
                        }else if(this.params.createdAcl.sourceType == 'Host'){
                            this.cli +="host "+this.params.createdAcl.hostSourceName;
                        }else if(this.params.createdAcl.sourceType == 'IP'){
                            this.cli += " "+ this.params.createdAcl.sourceIp + " " + this.params.createdAcl.sourceMask + " \n";
                        }
                    }else if(this.params.createdAcl.aclType == "MAC" || this.params.createdAcl.aclType == "ARP"){
						if(this.params.createdAcl.aclType == "MAC"){
							if (this.params.createdAcl.sourceType == 'any'){
								this.cli += " any ";
							}else if(this.params.createdAcl.sourceType == 'Host'){
                               this.cli += this.params.createdAcl.macSourceIp+" "+this.params.createdAcl.macSourceMask+" ";
                            }
							if (this.params.createdAcl.destinationType == 'any'){
								this.cli += " any \n";
							}else if (this.params.createdAcl.destinationType == 'Host'){
							 this.cli +=" "+ this.params.createdAcl.macDestinationIp+" "+this.params.createdAcl.macDestinationMask+"\n ";	
							}
						}else{
							if (this.params.createdAcl.sourceType == 'any'){
								this.cli += "ip any ";
							}else if(this.params.createdAcl.sourceType == 'Host'){
                               this.cli +="ip host "+ this.params.createdAcl.hostSourceName+" ";
                            }else if(this.params.createdAcl.sourceType == 'IP'){
                               this.cli +="ip "+ this.params.createdAcl.senderArpIp+" "+ this.params.createdAcl.senderArpMask+" ";
                            }
							
							if (this.params.createdAcl.arpDestinationType == 'any'){
								this.cli += "mac any \n";
							}else if (this.params.createdAcl.arpDestinationType == 'Host' || this.params.createdAcl.arpDestinationType == 'IP'){
							 this.cli +="mac "+ this.params.createdAcl.macDestinationIp+" "+this.params.createdAcl.macDestinationMask+"\n ";	
							}
							if (this.params.createdAcl.vlan){
								this.cli += "ip arp inspection filter arpacl vlan "+this.params.createdAcl.vlan+" \n";
							}
						}
					}else{
                        this.cli += " "+ this.params.createdAcl.aclProtocol+ " ";
                        if (this.params.createdAcl.sourceType == 'any'){
                            this.cli += " any ";
                        }
                        else if(this.params.createdAcl.sourceType == 'Host'){
                            this.cli += " host " + this.params.createdAcl.hostSourceName+" "
                        }
                        else if(this.params.createdAcl.sourceType == 'IP'){
                            if (this.params.createdAcl.aclType == "IPv6"){
                                if (this.params.createdAcl.sourceIpv6Mask.indexOf("%:") == -1){
                                    this.cli +=this.params.createdAcl.sourceIpv6+"/"+this.params.createdAcl.sourceIpv6Mask+" ";
                                }else{
                                    this.cli +=this.params.createdAcl.sourceIpv6+" "+this.params.createdAcl.sourceIpv6Mask+" ";
                                }
                            }else{
                                this.cli +=this.params.createdAcl.sourceIp+" "+this.params.createdAcl.sourceMask+" ";
                            }
                        }
                        if(this.params.createdAcl.aclSourcePort != "None"){
                            this.cli +=this.params.createdAcl.aclSourcePort+" "+ this.params.createdAcl.aclSrcPortValue+" ";
                            if(this.params.createdAcl.aclSourcePort == "range"){
                                this.cli +=this.params.createdAcl.aclSrcPort2Value+" ";
                            }
                        }
                        if(this.params.createdAcl.destinationType == 'any'){
                            this.cli +=" any ";
                        }else if(this.params.createdAcl.destinationType == 'Host'){
                            this.cli +=" host "+this.params.createdAcl.hostDestinationName +" ";
                        }else if(this.params.createdAcl.destinationType == 'IP'){
                            if (this.params.createdAcl.aclType == "IPv6"){
                                if (this.params.createdAcl.destinationIpv6Mask.indexOf("%:") == -1) {
                                    this.cli +=" "+this.params.createdAcl.destinationIpv6+"/"+ this.params.createdAcl.destinationIpv6Mask +" ";
                                }else{
                                    this.cli +=" "+ this.params.createdAcl.destinationIpv6 +" "+this.params.createdAcl.destinationIpv6Mask+" ";
                                }
                            }else{
                                this.cli +=" "+ this.params.createdAcl.destinationIp+" "+this.params.createdAcl.destinationMask+" ";
                            }
                        }
                        if(this.params.createdAcl.aclDestinationPort != 'None'){
                            this.cli += this.params.createdAcl.aclDestinationPort +" "+ this.params.createdAcl.aclDestPortValue+" ";
                            if(this.params.createdAcl.aclDestinationPort == "range"){
                                this.cli += this.params.createdAcl.aclDestPort2Value+ " ";
                            }
                        }
                        if (this.params.createdAcl.aclDSCP != translate('ntp_none')){
                            this.cli +=" dscp "+ this.params.createdAcl.aclDSCP+" ";
                        }
                        if((this.params.createdAcl.aclType == "IPv6") && (this.params.createdAcl.Sequence)){
                                this.cli += " sequence "+this.params.createdAcl.Sequence+" \n";
                        }
                    }
                    if(this.params.createdAcl.hasOwnProperty('inboundAssociatedOptions')){
                        for(var inbound = 0; inbound < this.params.createdAcl.inboundAssociatedOptions.length; inbound++){
                            this.cli += "\n";
                            this.cli += "interface "+this.params.createdAcl.inboundAssociatedOptions[inbound]+"\n";
							if(this.params.createdAcl.aclType == "ARP"){
								this.cli += "no ip arp inspection trust \n";
								
							}else if(this.params.createdAcl.aclType == "IPv6"){
                                this.cli += "ipv6 traffic-filter "+this.params.createdAcl.aclName+" in \n";
                            }else{
                                this.cli += "ip access-group "+this.params.createdAcl.aclName+" in \n";
                            }
                            if(this.params.createdAcl.dhcpRelayInfo === translate("toggle_up")){
                                this.cli += "ip dhcp relay information trusted \n";
                            }else{
                                this.cli += "no ip dhcp relay information trusted \n";
                            }
                            this.cli += "exit \n";
                        }

                    }
                    if($scope.outBoundSupporting){
                        if(this.params.createdAcl.hasOwnProperty("outboundAssociatedOptions")){
                            for(var outbound = 0; outbound < this.params.createdAcl.outboundAssociatedOptions.length; outbound++){
                                this.cli += "\n";
                                this.cli += "interface "+this.params.createdAcl.outboundAssociatedOptions[outbound]+"\n";
                                if(this.params.createdAcl.aclType == "IPv6"){
                                    this.cli += "ipv6 traffic-filter "+this.params.createdAcl.aclName+" out \n";
                                }else{
                                    this.cli += "ip access-group "+this.params.createdAcl.aclName+" out \n";
                                }
                                if(this.params.createdAcl.dhcpRelayInfo === translate("toggle_up")){
                                    this.cli += "ip dhcp relay information trusted \n";
                                }else{
                                    this.cli += "no ip dhcp relay information trusted \n";
                                }
                                this.cli += "exit \n";
                            }
                        }
                    }
                }else if(this.params.hasOwnProperty('deletedAcl')){
                    var _this = this;
                    // formation CLI for Delete Exisiting ACL Record
                    angular.forEach(this.params.deletedAcl, function (acls) {
                        if(acls.hasOwnProperty('associatedACL')){
                            for(var aAcl = 0; aAcl < acls.associatedACL.length; aAcl++){
                                _this.cli += " interface "+acls.associatedACL[aAcl].interface+" \n";
                                _this.cli += " no ip access-group "+acls.Name+" "+acls.associatedACL[aAcl].inout+" \n";
                                if(acls.associatedACL[aAcl].hasOwnProperty('dhcpRelay') && acls.associatedACL[aAcl].dhcpRelay){
                                    _this.cli += " no ip dhcp relay information trusted \n";
                                }
                                _this.cli += " exit \n";
                            }
                        }
                        if(acls["Type"] == "IPv4 Standard" ){
                            _this.cli += "no ip access-list standard "+acls["Name"]+" \n";
                        }else if(acls["Type"] == "IPv4 Extended"){
                            _this.cli += "no ip access-list extended "+acls["Name"]+" \n";
                        }else if(acls["Type"] == "MAC"){
							_this.cli += "no mac access-list extended "+acls["Name"]+" \n";
						}else if(acls["Type"] == "ARP"){
							_this.cli += "no arp access-list  "+acls["Name"]+" \n";
						}else{
                            _this.cli += "no ipv6 access-list "+acls["Name"]+" \n";
                        }
                    });
                    this.cli = _this.cli;
                }else if(this.params.hasOwnProperty('deletedAce')){
                    if(this.params.currentAclName && this.params.currentAclType){
                        if(this.params.currentAclType == "IPv4 Standard"){
                            this.cli += "ip access-list standard "+this.params.currentAclName+" \n";
                        }else if(this.params.currentAclType == "IPv4 Extended"){
                            this.cli +="ip access-list extended "+this.params.currentAclName+" \n";
                        }else if(this.params.currentAclType == "IPv6"){
                            this.cli +="ipv6 access-list "+this.params.currentAclName+" \n"
                        }else if(this.params.currentAclType == "MAC"){
                            this.cli +="mac access-list extended "+this.params.currentAclName+" \n"
                        }else if(this.params.currentAclType == "ARP"){
                            this.cli +="arp access-list "+this.params.currentAclName+" \n"
                        }
                        var _this = this;
                        angular.forEach(this.params.deletedAce, function (aces) {
							if (_this.params.currentAclType == "MAC"){
								 if(aces["DstMask"]){
								_this.cli +="no "+aces["Action"]+" "+aces["SrcIP"]+" "+aces["SrcMask"]+" "+aces["DstIP"]+" "+aces["DstMask"]+ " \n";
								 }else{
								_this.cli +="no "+aces["Action"]+" "+aces["SrcIP"]+" "+aces["SrcMask"]+" "+aces["DstIP"]+ " \n";	 
								 }
                            }else if (_this.params.currentAclType == "ARP"){
								_this.cli +="no "+aces["Action"]+" "+"ip "+aces["SrcIP"]+" "+aces["SrcMask"]+" "+"mac "+aces["DstIP"]+" "+aces["DstMask"]+ " \n";
								 
                            }else{
								if(aces["Sequence"]){
									if (_this.params.currentAclType == "IPv6"){
										_this.cli +="no sequence "+aces["Sequence"]+" \n";
									}else{
										_this.cli +="no "+aces["Sequence"]+" \n";
									}
								}
							}
                        });
                        this.cli = _this.cli;
                    }
                }else if(this.params.hasOwnProperty('editAcl')){
                    var a = this.params.editAcl.inboundAssociatedOptions,
                        b = $scope.tempInboundAssociatedOptions,
                        c = this.params.editAcl.outboundAssociatedOptions,
                        d = $scope.tempOutboundAssociatedOptions;
                    $scope.addedInbounds = comparingArray(a,b);
                    $scope.removedInbounds = comparingArray(b,a);
                    $scope.addedOutbounds = comparingArray(c,d);
                    $scope.removedOutbounds = comparingArray(d,c);
                    // InBound Cli formations
                    for(var aI = 0; aI < $scope.addedInbounds.length; aI++){
                        this.cli +="interface "+$scope.addedInbounds[aI]+" \n";
                        if(this.params.editAcl.aclType == "IPv6"){
                            this.cli += "ipv6 traffic-filter "+this.params.editAcl.aclName+" in \n";
                        }else{
                            this.cli +="ip access-group "+this.params.editAcl.aclName+" in \n";
                        }
                        this.cli +="exit \n";
                    }
                    for(var rI = 0; rI < $scope.removedInbounds.length; rI++){
                        this.cli +="interface "+$scope.removedInbounds[rI]+" \n";
                        if(this.params.editAcl.aclType == "IPv6"){
                            this.cli += "no ipv6 traffic-filter "+this.params.editAcl.aclName+" in \n";
                        }else{
                            this.cli +="no ip access-group "+this.params.editAcl.aclName+" in \n";
                        }
                        this.cli +="exit \n";
                    }
                    // OutBound Cli formations
                    if($scope.outBoundSupporting) {
                        for (var aO = 0; aO < $scope.addedOutbounds.length; aO++) {
                            this.cli += "interface " + $scope.addedOutbounds[aO] + " \n";
                            this.cli += "ip access-group " + this.params.editAcl.aclName + " out \n";
                            this.cli += "exit \n";
                        }
                        for (var rO = 0; rO < $scope.removedOutbounds.length; rO++) {
                            this.cli += "interface " + $scope.removedOutbounds[rO] + " \n";
                            this.cli += "no ip access-group " + this.params.editAcl.aclName + " out \n";
                            this.cli += "exit \n";
                        }
                    }
                    for (var a1 = 0; a1 < a.length; a1++) {
                        if(this.params.editAcl.dhcpRelayInfo != $scope.acl.OnEditdhcpRelayInfo){
                            this.cli += "interface " + a[a1] + " \n";
                            if (this.params.editAcl.dhcpRelayInfo === translate("toggle_up")) {
                                this.cli += "ip dhcp relay information trusted \n";
                            } else {
                                this.cli += "no ip dhcp relay information trusted \n";
                            }
                            this.cli += "exit \n";
                        }
                    }
                }
                return this.cli;
            }
        }
        $scope.protocolChange = function() {
            if(['TCP','UDP','tcp','udp','17','6',17,6].getIndexBy($scope.acl.aclProtocol)!=-1){
                $scope.showPortOptions = true;
                if(['TCP','tcp','6',6].getIndexBy($scope.acl.aclProtocol)!=-1) {
                    $scope.aclSrcPortOptions = aclPortOptions();
                }
                else {
                    $scope.aclSrcPortOptions = aclIPv6PortOptions();
                }
            }
            else{
                $scope.showPortOptions = false;
            }
        };
        $scope.applyNewAcl = function(){
            if ($scope.aclValidator.validate()) {
                // apply acl grid
                $scope.$broadcast('closeAddEditKendoWindow:aclMainWindow');
                if(!$scope.isEdit){
                    // To create a New ACL
                    var postData = {
                        "createdAcl": {}
                    };
                    postData.createdAcl = angular.copy($scope.acl);
                    var ALConfig = new accessListsConfigurations(postData);
                    var aclCliConfig = ALConfig.config();
                    var result = requestRoutingService.getConfigCmdOutput(aclCliConfig);
                    if(result==""){
                        notificationService.showNotification(translate('acl_success_msg'),translate('com_config_success_title'),'success');
                    }else{
                        notificationService.showNotification(result,translate('com_config_fail_title'),'error');
                    }
                    shRunIntCLIOP = deviceCommunicatorCLI.getExecCmdOutput(shRunInterface);
                    var acl = new $scope.aclConstructor();
                    // display ACL Grid
                    acl.aclMainGrid(shRunIntCLIOP[2], shRunIntCLIOP[0]);
                    $scope.updateAceGrid();
                }else{
                    // To update a Exist ACL and Interfaces Association
                    var postData = {
                        "editAcl": {}
                    };
                    postData.editAcl = angular.copy($scope.acl);
                    postData.editAcl.inboundAvailablePortsOption = $scope.inboundAvailablePortsOption;
                    postData.editAcl.inboundAssociatedOptions = $scope.acl.inboundAssociatedOptions;

                    postData.editAcl.outboundAvailablePortsOption = $scope.outboundAvailablePortsOption;
                    postData.editAcl.outboundAssociatedOptions = $scope.acl.outboundAssociatedOptions;
                    var ALConfig = new accessListsConfigurations(postData);
                    var aclCliConfig = ALConfig.config();
                    var result = requestRoutingService.getConfigCmdOutput(aclCliConfig);
                    if(!angular.isUndefined(result)){
                        if(result==""){
                            notificationService.showNotification(translate('acl_success_msg'),translate('com_config_success_title'),'success');
                        }else{
                            notificationService.showNotification(result,translate('com_config_fail_title'),'error');
                        }
                        shRunIntCLIOP = deviceCommunicatorCLI.getExecCmdOutput(shRunInterface);
                        var acl = new $scope.aclConstructor();
                        // display ACL Grid
                        acl.aclMainGrid(shRunIntCLIOP[2], shRunIntCLIOP[0]);
                        $scope.updateAceGrid();
                    }
                }
            }
        }
        // ACE Grid
        $scope.aceGridOptions = {
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
                refresh: false,
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
            scrollable:false,
            selectable: true,
            columns : [{
                "template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-change=\"isChecked(checked,dataItem,selectedAces)\"  />",
                width : 10
            }, {
                field : "Sequence",
                title : translate('acl_sequence')
            }, {
                field : "Action",
                title : translate('acl_action')
            }, {
                field : "SrcIP",
                title : translate('acl_source_ip')
            }, {
                field : "SrcMask",
                title : translate('acl_source_mask')
            }, {
                field : "DstIP",
                title : translate('acl_destination_ip')
            }, {
                field : "DstMask",
                title : translate('acl_destination_mask')
            }, {
                field : "Protocol",
                title :  translate('etherchannel_protocol')
            }, {
                field : "SrcPort",
                title : translate('acl_source_port')
            }, {
                field : "DstPort",
                title : translate('acl_destination_port')
            }, {
                field : "DSCP",
                title : translate('acl_dscp')
            }]
        };
        $scope.aclMainGridDataSource = new kendo.data.DataSource({
            pageSize : 10,
            schema: {
                model: {
                    fields: {
                        Name: {
                            type: "string"
                        },
                        Type: {
                            type: "string"
                        },
                        aceCount: {
                            type: "string"
                        }
                    }
                }
            }
        });
        $scope.aceGridDataSource = new kendo.data.DataSource({
            pageSize : 10,
            sort : {
                field : "Sequence",
                dir : "asc",
                compare : function(a, b) {
                    return Number(a.Sequence) - Number(b.Sequence);
                }
            }

        });

        $scope.flipperClasses = [];
        Array.prototype.getIndexBy = function (value) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == value) {
                    return i;
                }
            }
            return -1;
        };
        $scope.aclConstructor = function() {
            var aclCon = this;
            aclCon.resetOnlyACE = function(myacls) {
                myacls.Sequence = "";
                myacls.Action = "";
                myacls.SrcIP = "";
                myacls.SrcMask = "";
                myacls.SrcPort = "";
                myacls.DstIP = "";
                myacls.DstMask = "";
                myacls.DstPort = "";
                myacls.DSCP = "";
                myacls.Protocol = "";
            };
            aclCon.aclMainGrid = function(aclCLIUpOP, aclAssInts){
                $scope.selectedAcls = [];
                $scope.aclMainGridData = this.ipv4AndIpV6AccessLists(aclCLIUpOP.split("\n"), aclAssInts);
                $scope.aclMainGridDataSource.data($scope.aclMainGridData);
                angular.element(".pageLoader").hide();
                $scope.displayLater = true;
            };
            aclCon.moveItemsBetweenLists = function(fromList, toList, itemsToMove) {
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
        };
        $scope.aclConstructor.prototype.ipv4AndIpV6AccessLists = function(data, aclAssInts) {
            /* To get data parsed output */
            $scope.parsedAcls = [];
            var i,index = 0;
            var temp = 0;
            var aclwithace = 0;
            var myacls 

            /* Check if valid ACL data is present in text
             * by testing first line */
            if (data && data.length) {
                var dataCheck = data[0].split(" ");
                if (dataCheck[0] != "Standard" && dataCheck[0] != "Extended" && dataCheck[0] != "IPv6") {
                    // Invalid Data in acl rest read
                    return ($scope.parsedAcls);
                }
            } else {
                return ($scope.parsedAcls);
            }
            /* ACL without ACE is handled here */

            for (var i = 0; i < data.length; i++) {
				myacls = {
					/* for ACL table fields */
					Name: "",
					Type: "",
					aceCount: 0,
					interfaces:[]
				};
                var arr = data[i].split(" ");
                var next = 0;
                /* ACL without ACE is handled here */
                if (arr[0] == "Standard" || arr[0] == "Extended" || arr[0] == "IPv6") {
                    myacls.Name = "";
                    myacls.Type = "";
                    myacls.aceCount = 0;
                }
                if (arr[0] != ""){
                    if (aclwithace != 0) {
                        temp = $scope.parsedAcls.length-1;
                        $scope.parsedAcls[temp].aceCount = aclwithace;
                    }
                    /* Now type based check for ACLs*/
                    if (arr[0] == "Standard") {
                        // Reached  an ACL
                        myacls.Type = "IPv4 Standard";
                        next += 4;
                        //  Standard IP access list

                        myacls.Name = arr[next].trim();
                        aclwithace = 0;
                        // verify if needed till eof
                    } else if (arr[0] == "Extended") {
                        // Reached  an ACL
						if(arr[1] == "MAC"){
						myacls.Type = "MAC"	
						next += 4;
						}
						else{
                        myacls.Type = "IPv4 Extended";
                        next += 4;
						}
                        // Extended IP access list
                        myacls.Name = arr[next].trim();
                        aclwithace = 0;
                        // verify if needed till eof
                    } else if (arr[0] == "IPv6") {
                        // Reached  an ACL
                        myacls.Type = "IPv6";
                        next += 3;
                        // IPv6 access list
                        myacls.Name = arr[next].trim();
                        aclwithace = 0;
                        // verify if needed till eof
                    }else if (arr[0] == "ARP") {
                        // Reached  an ACL
                        myacls.Type = "ARP";
                        next += 3;
                        // IPv6 access list
                        myacls.Name = arr[next].trim();
                        aclwithace = 0;
                        // verify if needed till eof
                    } else if (arr[0] == "Role-based" || myacls.Type == "Role-based") {
                        myacls.Type = "Role-based";
                        aclwithace = 0;
                        continue;
                    }
                    myacls.aceCount = aclwithace;
					if(myacls.Type !=""){
						$scope.parsedAcls[index++] = angular.copy(myacls);
					}
                }
                else{
                    // empty
                    // Reached an ACE
                    aclwithace += 1;
                    myacls.aceCount = aclwithace;
                    if($scope.parsedAcls) {
                        temp = $scope.parsedAcls.length-1;
                        $scope.parsedAcls[temp].aceCount = aclwithace;
                    }
                }

            }
            var op = aclAssInts.split("interface");
            for(var i = 1; i < op.length; i++){
                var portsObj = {};
                var intShowRun="interface "+op[i];
                for(var aclName = 0; aclName < $scope.parsedAcls.length; aclName++){
                    if(intShowRun.indexOf("ip access-group "+$scope.parsedAcls[aclName].Name+" in") != -1 || intShowRun.indexOf("ipv6 traffic-filter "+$scope.parsedAcls[aclName].Name+" in") != -1){
                        var intName = executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim(),
                            intNames="";
                        if(intName.indexOf("input") == -1){
                            intNames = $scope.formatInt(intName);
                        }
                        if($scope.parsedAcls[aclName].Type == "IPv6"){
                            var AssAclname = executeCliCmdService.getNextString(intShowRun,["ipv6 traffic-filter"],["in"]).trim();
                        }else{
                            var AssAclname = executeCliCmdService.getNextString(intShowRun,["ip access-group"],["in"]).trim();
                        }
                        var aclIndex = $scope.parsedAcls.map(function(e) {
                            return e.Name;
                        }).indexOf(AssAclname);
						if(aclIndex !=-1){
							if($scope.parsedAcls[aclIndex].interfaces.indexOf(intNames) == -1) {
								$scope.parsedAcls[aclIndex].interfaces.push(intNames);
							}
                        }
                    }else if(intShowRun.indexOf("ip access-group "+$scope.parsedAcls[aclName].Name+" out") != -1 || intShowRun.indexOf("ipv6 traffic-filter "+$scope.parsedAcls[aclName].Name+" out") != -1){
                        var intName = executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim(),
                            intNames="";
                        if(intName.indexOf("input") == -1){
                            intNames = $scope.formatInt(intName);
                        }
                        if($scope.parsedAcls[aclName].Type == "IPv6"){
                            var AssOutAclname = executeCliCmdService.getNextString(intShowRun,["ipv6 traffic-filter"],["out"]).trim();
                        }else{
                            var AssOutAclname = executeCliCmdService.getNextString(intShowRun,["ip access-group"],["out"]).trim();
                        }
                        var aclIndex = $scope.parsedAcls.map(function(e) {
                            return e.Name;
                        }).indexOf(AssOutAclname);
                        if($scope.parsedAcls[aclIndex].interfaces.indexOf(intNames) == -1) {
                            $scope.parsedAcls[aclIndex].interfaces.push(intNames);
                        }
                    }
                }
            }
            for(var aclInd = 0; aclInd < $scope.parsedAcls.length; aclInd++){
                if($scope.parsedAcls[aclInd].interfaces.length > 0){
                    $scope.parsedAcls[aclInd].interfaces = $scope.parsedAcls[aclInd].interfaces.toString();
                }else{
                    $scope.parsedAcls[aclInd].interfaces = "";
                }
            }
            /* Final  Json array */
            return ($scope.parsedAcls);
        };
        $scope.aclConstructor.prototype.aceFormatGrid = function(data) {
            $scope.parsedAcls = [];
            var i,
                temp,
                index = 0;
            var aclwithace = 0;
            var wildcardIP;
            var myacls = {
                GroupByType : "",
                Sequence : "",
                Name : "",
                Type : "",
                Action : "",
                SrcIP : "",
                SrcMask : "",
                SrcPort : "",
                DstIP : "",
                DstMask : "",
                DstPort : "",
                DSCP : "",
                Protocol : "",
                Interfaces : [],
                id : ""
            };
            var aclPorts = ["bgp", "chargen", "cmd", "daytime", "discard", "domain", "echo", "exec", "finger", "ftp", "gopher", "hostname", "indent", "irc", "klogin", "kshell", "login", "lpd", "nntp", "pim-auto-rp", "pop2", "pop3", "smtp", "sunrpc", "syslog", "tacacs", "talk", "telnet", "time", "uucp", "whois", "www", "HHTP", "biff", "bootpc", "bootps", "discard", "dnsix", "domain", "DNS", "echo", "isakmp", "mobile-ip", "nameserver", "obsolete", "netbios-ns", "netbios-ss", "non500-isakmp", "ntp", "pim-auto-rp", "rip", "router", "in.routed", "snmp", "snmptrap", "sunrpc", "syslog", "tftp", "time", "who", "rwho", "xdmcp"];
            var aclUDPPorts = ["biff", "bootpc", "bootps", "discard", "dnsix", "domain", "echo", "isakmp", "mobile-ip", "nameserver", "netbios-dgm", "netbios-ns", "netbios-ss", "non500-isakmp", "ntp", "pim-auto-rp", "rip", "ripv6", "snmp", "snmptrap", "sunrpc", "syslog", "tacacs", "talk", "tftp", "time", "who", "xdmcp"];
            if (data && data.length) {
                var dataCheck = data[0].split(" ");
                if (dataCheck[0] != "Standard" && dataCheck[0] != "Extended" && dataCheck[0] != "IPv6") {
                    return ($scope.parsedAcls);
                }
            } else {
                return ($scope.parsedAcls);
            }
            for (var i = 0; i < data.length; i++) {
                var arr = data[i].split(" ");
                var next = 0,
                    j = 0;
                if (arr[0] == "Standard" || arr[0] == "Extended" || arr[0] == "IPv6"|| arr[0] == "ARP"|| arr[0] == "MAC") {
                    if (arr[1] != "IP" && arr[0] != "IPv6"&& arr[0] != "ARP"&& arr[1] != "MAC") {
                        break;
                    }
                    if (!aclwithace && myacls.Name != "" && arr[0] != "") {
                        myacls.id = index;
                        if (myacls.Name == $scope.currentAclName){
                            if (myacls.Sequence != ""){
                                $scope.parsedAcls[index++] = angular.copy(myacls);}}
                    }
                    aclwithace = 0; 
                }
                if (arr[0] == "Standard") {
                    myacls.GroupByType = 1;
                    myacls.Type = "IPv4 Standard";
                    next += 4;

                    myacls.Name = arr[next];
                } else if (arr[0] == "Extended") {
					if(arr[1] == "MAC"){
						myacls.GroupByType = 4;
                    myacls.Type = "MAC";
                    next += 4;

                    myacls.Name = arr[next];
					}else{
                    myacls.GroupByType = 2;
                    myacls.Type = "IPv4 Extended";
                    next += 4;

                    myacls.Name = arr[next];
					}
                } else if (arr[0] == "IPv6") {
                    myacls.GroupByType = 3;
                    myacls.Type = "IPv6";
                    next += 3;

                    myacls.Name = arr[next];
                } else if (arr[0] == "ARP") {
                    myacls.GroupByType = 3;
                    myacls.Type = "ARP";
                    next += 3;

                    myacls.Name = arr[next];
                } else if (arr[0] == "Role-based" || myacls.Type == "Role-based") {
                    myacls.Type = "Role-based";
                    continue;
                } else if (arr[0] == "") {
                    aclwithace = 1;
                    j += 4;
                    next += 4;

                    if (myacls.Type != "IPv6" && myacls.Type != "ARP"&& myacls.Type != "MAC") {
                        myacls.Sequence = arr[next];
                        next++;
                    }

                    if (myacls.Type == "IPv4 Standard") {
                        myacls.Action = arr[next];
                        if (myacls.Action == "deny") {

                            next += 2;
                        }
                        next++;
                        myacls.SrcIP = arr[next];

                        if (myacls.SrcIP == "any") {
                        } else if (arr.length > next + 3) {
                            myacls.SrcMask = arr[next + 3];
                            wildcardIP = myacls.SrcIP.split(",");
                            myacls.SrcIP = wildcardIP[0];
                        }

                        myacls.id = index;
                        if ($scope.currentAclName && (myacls.Name.trim() == $scope.currentAclName.trim())){
                            if (myacls.Sequence != ""){
                                $scope.parsedAcls[index++] = angular.copy(myacls);
                            }
                        }
                        this.resetOnlyACE(myacls);
                        continue;
                    } else {
                        if(myacls.Type == "ARP"){
							myacls.Action = arr[next];
							next = next+2;
							myacls.SrcIP = arr[next]
							if (myacls.SrcIP == "any") {
								myacls.SrcMask = "";
								next++;
							}else{
								next++;
								myacls.SrcMask = arr[next]
								next++;
							}
							next++;
							myacls.DstIP = arr[next];
							if (myacls.DstIP == "any") {
								myacls.DstMask = "";
								next++;
							}else{
								next++;
								myacls.DstMask = arr[next];
								next++;
							}
							 if ($scope.currentAclName && (myacls.Name.trim() == $scope.currentAclName.trim())){
								if (myacls.Type == "ARP"){
									$scope.parsedAcls[index++] = angular.copy(myacls);
								}
							}
						}else if(myacls.Type == "MAC"){
							myacls.Action = arr[next];
							next++;
							myacls.SrcIP = arr[next]
							if (myacls.SrcIP == "any") {
								myacls.SrcMask = "";
								next++;
							}else{
								next++
								myacls.SrcMask = arr[next]
								next++;
							}
							myacls.DstIP = arr[next];
							if (myacls.DstIP == "any") {
								myacls.DstMask = "";
								next++;
							}else{
								next++;
								myacls.DstMask = arr[next];
							}
							if ($scope.currentAclName && (myacls.Name.trim() == $scope.currentAclName.trim())){
								if (myacls.Type == "MAC"){
									$scope.parsedAcls[index++] = angular.copy(myacls);
								}
							}
						}else{
                        myacls.Action = arr[next];
                        next++;
                        myacls.Protocol = arr[next];
                        next++;
						myacls.SrcIP = arr[next];
                        if (myacls.SrcIP == "any") {
                            myacls.SrcMask = "";
                            next++;
                        } else if (myacls.SrcIP == "host") {

                            next++;
                            myacls.SrcIP = arr[next];
                            next++;
                            myacls.SrcMask = "";
                        } else if (myacls.Type == "IPv6" && myacls.SrcIP.indexOf('/') != -1) {
                            var temp = myacls.SrcIP.split("/");
                            myacls.SrcIP = temp[0];
                            myacls.SrcMask = temp[1];
                            next++;
                        } else {
                            next++;
                            myacls.SrcMask = arr[next];
                            next++;
                        }
                        if (((myacls.Type == "IPv4 Extended" && next < arr.length || (myacls.Type == "IPv6" && next < arr.length - 3)) && (["tcp", "udp", "icmp"].getIndexBy(myacls.Protocol) != -1))) {
                            var srcPortRangeChk = false;
                            var srcPortRange = "";
                            if (arr[next] == "any") {
                                myacls.SrcPort = "";
                            } else if ((["eq", "neq", "gt", "lt", "range"].getIndexBy(arr[next]) != -1)) {
                                myacls.SrcPort = arr[next];
                                if (myacls.SrcPort == "range") {
                                    next += 1;
                                    srcPortRangeChk = true;
                                    srcPortRange = arr[next];
                                    myacls.SrcPort += " " + arr[next];
                                }
                                next += 1;
                                myacls.SrcPort += " " + arr[next];
                                if(srcPortRange){
                                    srcPortRange += " - " + arr[next];
                                    myacls.SrcPort = srcPortRange;
                                }
                                next += 1;
                                while ((aclPorts.getIndexBy(arr[next]) != -1) || (aclUDPPorts.getIndexBy(arr[next]) != -1) || (arr[next] >= 0 && arr[next] <= 65535)) {
                                    myacls.SrcPort += "," + arr[next];
                                    next++;
                                }

                                myacls.SrcPort = (myacls.SrcPort).replace(/,/g, " ");
                            }
                        }
                        if (next < arr.length) {
                            myacls.DstIP = arr[next];
                        }
                        if (myacls.DstIP == "any") {
                            myacls.DstMask = "";
                            next++;
                        } else if (myacls.DstIP == "host") {
                            next++;
                            myacls.DstIP = arr[next];
                            next++;
                            myacls.DstMask = "";
                        } else if (myacls.Type == "IPv6" && myacls.DstIP.indexOf('/') != -1) {
                            var temp = myacls.DstIP.split("/");
                            myacls.DstIP = temp[0];
                            myacls.DstMask = temp[1];
                            next++;
                        } else {
                            next++;
                            myacls.DstMask = arr[next];
                            next++;
                        }
                        if (next <= arr.length && (["tcp", "udp", "icmp"].getIndexBy(myacls.Protocol) != -1)) {
                            var dstPortRangeChk = false;
                            var dstPortRange = "";
                            if (arr[next] == "any") {
                                myacls.DstPort = "any";
                            } else if ((["eq", "neq", "gt", "lt", "range"].getIndexBy(arr[next]) != -1)) {
                                myacls.DstPort = arr[next];
                                if (myacls.DstPort == "range") {
                                    next += 1;
                                    dstPortRangeChk = true;
                                    dstPortRange = arr[next];
                                    myacls.DstPort += " " + arr[next];
                                }
                                next += 1;
                                myacls.DstPort += " " + arr[next];
                                if (dstPortRangeChk) {
                                    dstPortRange += " - " + arr[next];
                                    myacls.DstPort = dstPortRange;
                                }
                                next++;

                                while ((aclPorts.getIndexBy(arr[next]) != -1) || (aclUDPPorts.getIndexBy(arr[next]) != -1) || (arr[next] >= 0) && (arr[next] <= 65535)) {
                                    myacls.DstPort += "," + arr[next];
                                    next++;
                                }

                            }

                            myacls.DstPort = myacls.DstPort.replace(/,/g, " ");
                        }

                        if (next < arr.length) {
                            if (arr[next] == "dscp") {
                                next++;
                                myacls.DSCP = arr[next];
                                next++;
                            }
                        }

                        if (myacls.Type == "IPv6") {
                            var temp=arr.length-1;
                            myacls.Sequence=arr[temp];
                        }
                    }
                    }
                    j = next;
                    while (j < arr.length) {
                        if (arr[j] == "sequence" && myacls.Sequence == "") {
                            var temp=arr.length-1;
                            myacls.Sequence=arr[temp];
                        }
                        j++;
                    }
                    myacls.id = index;
					
                    if ($scope.currentAclName && (myacls.Name.trim() == $scope.currentAclName.trim())){
                        if (myacls.Sequence != "" ){
                            $scope.parsedAcls[index++] = angular.copy(myacls);
                        }
                    }
                    this.resetOnlyACE(myacls);
                }
            }
            return ($scope.parsedAcls);
        };
        var acl = new $scope.aclConstructor();
        $scope.interfacesLists = [];
        $scope.fetchInterfaces = function () {
            var arrShRunInt =shRunIntCLIOP[1].split("\n");
            var showIntBrList=[];
            for (var i=1; i < arrShRunInt.length; i++) {
                var portsObj = {};
                if( (!$scope.VlanSupporting) && (arrShRunInt[i].substring(0,22).trim().indexOf("Vlan") == -1)){
                    portsObj["interfaceName"] = arrShRunInt[i].substring(0,22).trim();
                    showIntBrList.push(portsObj);
                }else{
                    portsObj["interfaceName"] = arrShRunInt[i].substring(0,22).trim();
                    showIntBrList.push(portsObj);
                }
            }
            angular.forEach(showIntBrList, function (inter) {
                var intNameAttr = $scope.formatInt(inter.interfaceName);
				if(intNameAttr.indexOf("Te")==-1 && intNameAttr.indexOf("Port-channel")==-1 && intNameAttr.indexOf("Lo")==-1){
                $scope.interfacesLists.push(intNameAttr);
				}
            });
            $scope.inboundAvailablePortsOption = angular.copy($scope.interfacesLists);
            $scope.outboundAvailablePortsOption = angular.copy($scope.interfacesLists);
        }
		$timeout(function(){
			//Fetch Ports for ACL Association
			$scope.fetchInterfaces();
		}, 20)

        $scope.moveToACLInBoundAssociated = function () {
            acl.moveItemsBetweenLists($scope.inboundAvailablePortsOption, $scope.acl.inboundAssociatedOptions, $scope.acl.inbound.availablePorts);
        };
        $scope.moveFromACLInBoundAssociated = function () {
            acl.moveItemsBetweenLists($scope.acl.inboundAssociatedOptions, $scope.inboundAvailablePortsOption, $scope.acl.inbound.selectedAssociatedPorts);
        };
        $scope.moveToACLOutBoundAssociated = function () {
            acl.moveItemsBetweenLists($scope.outboundAvailablePortsOption, $scope.acl.outboundAssociatedOptions, $scope.acl.outbound.availablePorts);
        };
        $scope.moveFromACLOutBoundAssociated = function () {
            acl.moveItemsBetweenLists($scope.acl.outboundAssociatedOptions, $scope.outboundAvailablePortsOption, $scope.acl.outbound.selectedAssociatedPorts);
        };
		$timeout(function(){
            // display ACL Grid
			acl.aclMainGrid(shRunIntCLIOP[2], shRunIntCLIOP[0]);
		}, 40);
        $scope.getConfirmation = function(content,title,callBack){
            return dialogService.dialog(
                {
                    content : content,
                    title : title,
                    messageType : "confirm",
                    actionButtons : [{
                        text : translate('com_ok'),
                        callback : callBack
                    }, {
                        text : translate('com_cancel')
                    }]
                }
            );
        };
        $scope.deleteAcls = function(deleteArray){
            var postData = {
                "deletedAcl": []
            };
            var op = shRunIntCLIOP[0].split("interface");
            angular.forEach(deleteArray, function (item) {
                var associatedACL = [];
                for(var i = 1; i < op.length; i++){
                    var portsObj = {};
                    var intShowRun="interface "+op[i],
                        arrIntShowRun=	intShowRun.split("\n");
                    if( arrIntShowRun[0].indexOf("Ethernet")!=-1 || arrIntShowRun[0].indexOf("Te")!=-1|| arrIntShowRun[0].indexOf("Bluetooth")!=-1 || arrIntShowRun[0].indexOf("Loopback")!=-1 || arrIntShowRun[0].indexOf("Vlan")!=-1){
                        if(intShowRun.indexOf("ip access-group "+item.Name+" ") != -1){
                            var inOutBoundsOP =executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
                            var inOutBoundsString = executeCliCmdService.getNextString(intShowRun,["ip access-group "+item.Name],["\n"]).trim();
                            var dhcpRelay = executeCliCmdService.getNextString(intShowRun,["ip dhcp relay information"],["\n"]).trim();
                            var inOut = {
                                "interface": inOutBoundsOP,
                                "inout":inOutBoundsString,
                                "dhcpRelay":dhcpRelay
                            };
                            associatedACL.push(inOut);
                        }
                    }
                }
                item.associatedACL = associatedACL;
                postData.deletedAcl.push(item);
            });
            for (var dAclIndex = 0; dAclIndex < postData.deletedAcl.length; dAclIndex++) {
                $scope.aclMainGridDataSource.remove(postData.deletedAcl[dAclIndex]);
            }
            var ALConfig = new accessListsConfigurations(postData);
            var delACLCli = ALConfig.config();
            var result = requestRoutingService.getConfigCmdOutput(delACLCli);
            if(result==""){
                notificationService.showNotification(translate('acl_success_msg'),translate('com_config_success_title'),'success');
            }else{
                notificationService.showNotification(result,translate('com_config_fail_title'),'error');
            }
        };
        $scope.deleteAces = function(deleteArray){
            var postData = {
                "deletedAce": [],
                "currentAclName": $scope.currentAclName,
                "currentAclType": $scope.currentAclType
            };
            angular.forEach(deleteArray,function(item){
                postData.deletedAce.push(item);
            });
            for (var dAceIndex = 0; dAceIndex < postData.deletedAce.length; dAceIndex++) {
                $scope.aceGridDataSource.remove(postData.deletedAce[dAceIndex]);
            }
            var ALConfig = new accessListsConfigurations(postData);
            var delACECli = ALConfig.config();
            var result = requestRoutingService.getConfigCmdOutput(delACECli);
            if(result==""){
                notificationService.showNotification(translate('acl_success_msg'),translate('com_config_success_title'),'success');
            }else{
                notificationService.showNotification(result,translate('com_config_fail_title'),'error');
            }
        };
        $scope.$on("deleteAclsScreen", function() {
            $scope.deleteAcls($scope.selectedAcls);
            $scope.deleteConfirmationWindow.data("kendoWindow").close();
        });
        $scope.$on("deleteAcesScreen", function() {
            $scope.deleteAces($scope.selectedAces);
            $scope.deleteConfirmationWindow.data("kendoWindow").close();
        });
        // confirmation popup for Delete ACL
        $scope.confirmAclDelete = function(){
            $scope.deleteConfirmationWindow = $scope.getConfirmation(translate('acl_delete_acl'), translate('com_delete'), "deleteAclsScreen");
        };
        // confirmation popup for Delete ACE
        $scope.confirmAceDelete = function(){
            $scope.deleteConfirmationWindow = $scope.getConfirmation(translate('acl_delete_sequence'), translate('com_delete'), "deleteAcesScreen");
        }; 
		$scope.actionChange = function(action){
           $scope.acl.aclAction = action;
        };
        $scope.isChecked = function(checked, dataItem, selectedArray) {
            if (!checked) {
                var index = selectedArray.indexOf(dataItem);
                if (index > -1) {
                    selectedArray.splice(index, 1);
                }
            } else {
                if (dataItem.Name !== "preauth_ipv4_acl" && dataItem.Name != "preauth_ipv6_acl" && dataItem.Name != "preauth_v4") {
                    selectedArray.push(dataItem);
                }
            }
        };
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
        $scope.addNewAcl = function(){
            angular.element(".popupDone").text(translate("com_save_and_apply"));
            angular.element("#aclQuicksetupForm  span.k-tooltip-validation").hide();
            $scope.isEdit = false;
            $scope.displayACLFields = true;
            $scope.displayACLAssFields = $scope.displayACLFields;
            $scope.inAceView = false;
            $scope.inAclView = true;
            $scope.showPortOptions = false;
            $scope.inboundAvailablePortsOption = angular.copy($scope.interfacesLists);
            if($scope.outBoundSupporting){
                $scope.outboundAvailablePortsOption = angular.copy($scope.routedSwitch());
            }else{
                $scope.outboundAvailablePortsOption = angular.copy($scope.interfacesLists);
            }
            $scope.acl = {  aclName: null,
                aclType: 'IPv4 Standard',
                aclAction: 'permit',
                arpDestinationType: 'any',
                aclProtocol: 'ahp',
                destinationType: 'any',
                sourceType: 'any',
                sourceIp: '',
                sourceMask: '',
                destinationHostName: '',
                sourceHostName: '',
                destinationIp: '',
                destinationMask: '',
                sourceIpv6: '',
                sourceIpv6Mask: '',
                destinationIpv6: '',
                destinationIpv6Mask: '',
                aclDSCP: translate('ntp_none'),
                aclSourcePort: "None",
                aclDestinationPort: 'None',
                aclSrcPortValue: '',
                aclSrcPort2Value: '',
                aclDestPort2Value: '',
                aclDestPortValue: '',
                inbound: {},
                outbound: {},
                outboundAssociatedOptions:[],
                inboundAssociatedOptions:[],
                dhcpRelayInfo: translate("toggle_down")
            };
            angular.element("#aclTypeDropDown").data('kendoDropDownList').value($scope.acl.aclType);
            angular.element("#aclAction").data('kendoDropDownList').value($scope.acl.aclAction);
            angular.element("#arpDestinationType").data('kendoDropDownList').value($scope.acl.arpDestinationType);
            $scope.$broadcast('openAddDialog:aclMainWindow',translate('acl_add_acl'));
        };
        $scope.addNewAce = function(){
            angular.element(".popupDone").text(translate("com_save_and_apply"));
            angular.element("#aclQuicksetupForm  span.k-tooltip-validation").hide();
            $scope.isEdit = false;
            $scope.inAceView = true;
            $scope.inAclView = false;
            $scope.displayACLFields = true;
            $scope.displayACLAssFields = !$scope.displayACLFields;
            $scope.showPortOptions = false;
            $scope.acl = {
                Sequence: null,
                aclAction: 'permit',
                aclProtocol: 'ahp',
                destinationType: 'any',
                sourceType: 'any',
                sourceIp: '',
                sourceMask: '',
                destinationHostName: '',
                sourceHostName: '',
                destinationIp: '',
                destinationMask: '',
                sourceIpv6: '',
                sourceIpv6Mask: '',
                destinationIpv6: '',
                destinationIpv6Mask: '',
                aclDSCP: translate('ntp_none'),
                aclSourcePort: "None",
                aclDestinationPort: 'None',
                aclSrcPortValue: '',
                aclSrcPort2Value: '',
                aclDestPort2Value: '',
                aclDestPortValue: ''
            };
            $scope.acl.aclType = $scope.currentAclType;
            $scope.acl.aclName = $scope.currentAclName;
            $scope.changeAclType(false);
            $scope.$broadcast('openAddDialog:aclMainWindow',translate('acl_addace'));
        };
        $scope.changeAclType = function(dOMChange, nGmodel) {
			if($scope.acl.aclType != "MAC" ){
				$scope.aclSourceTypeOptions = [{"text" : translate('acl_any'),"value" : 'any'},{"text" : translate('acl_host'),"value" : 'Host'},{"text":  translate('clients_ip'),"value" : 'IP'}];
			}else{
			    $scope.aclSourceTypeOptions = [{"text" : translate('acl_any'),"value" : 'any'},{"text" : translate('acl_host'),"value" : 'Host'}];	
			}
			$scope.arpDestinationTypeOptions = [{"text" : translate('acl_any'),"value" : 'any'},{"text" : translate('acl_host'),"value" : 'Host'}];
            if($scope.acl.aclType == "IPv6") {
                $scope.aclProtocolOptions = aclIPv6ProtocolOptions();
            }
            else {
                $scope.aclProtocolOptions = aclProtocolOptions();
            }
            if(dOMChange){
                $scope.displayACLFields = true;
                $scope.showPortOptions = false;
                $scope.acl.aclType = nGmodel;
                $scope.acl.aclAction = 'permit';
                $scope.acl.aclProtocol= 'ahp';
                $scope.acl.destinationType= 'any';
                $scope.acl.sourceType= 'any'
                $scope.acl.sourceIp= '';
                $scope.acl.sourceMask= '';
                $scope.acl.destinationHostName= '';
                $scope.acl.sourceHostName= '';
                $scope.acl.destinationIp= '';
                $scope.acl.destinationMask= '';
                $scope.acl.sourceIpv6= '';
                $scope.acl.sourceIpv6Mask= '';
                $scope.acl.destinationIpv6= '';
                $scope.acl.destinationIpv6Mask= '';
                $scope.acl.aclDSCP= translate('ntp_none');
                $scope.acl.aclSourcePort= "None";
                $scope.acl.aclDestinationPort= 'None';
                $scope.acl.aclSrcPortValue= '';
                $scope.acl.aclSrcPort2Value= '';
                $scope.acl.aclDestPort2Value= '';
                $scope.acl.aclDestPortValue= '';
            }
			if($scope.acl.aclType == "ARP" ){
				for( var i = 0; i < $scope.inboundAvailablePortsOption.length; i++){ 
				   if ( $scope.inboundAvailablePortsOption[i].indexOf("Vlan") !=-1) {
					  $scope.inboundAvailablePortsOption.splice(i, 1); 
					  i--;
				   }
				}
			}else{
				$scope.inboundAvailablePortsOption = angular.copy($scope.interfacesLists);
			}
			 
        }
        $scope.flipToAces = function(aclName,aclType,e){
			$scope.hideSequence = false;
            e.stopPropagation();
            e.preventDefault();
            $scope.currentAclType = aclType;
            $scope.currentAclName = aclName;
			if($scope.currentAclType == "MAC" || $scope.currentAclType == "ARP"){
				$scope.hideSequence = true;
			}
            var flipperIndex = $scope.flipperClasses.getIndexBy("flip-it");
            if(flipperIndex === -1){
                $scope.flipperClasses.push("flip-it");
            }
            // display ACE countable grid
            $scope.updateAceGrid();
            $scope.inAceView = true;
            $scope.inAclView = false;
        };
        $scope.flipBackToAcls = function(){
            $scope.flipperClasses.splice($scope.flipperClasses.getIndexBy("flip-it"),1);
            var aclCLIUpOP = deviceCommunicatorCLI.getExecCmdOutput(shRunInterface);
            acl.aclMainGrid(aclCLIUpOP[2], aclCLIUpOP[0]);
            $scope.inAceView = false;
            $scope.inAclView = true;
        };
        $scope.updateAceGrid = function() {
            $scope.selectedAces = [];
            var acl = new $scope.aclConstructor();
            var aclCLIOP = deviceCommunicatorCLI.getExecCmdOutput(aclCLI);
            $scope.aceGridData = acl.aceFormatGrid(aclCLIOP[0].split("\n"));
            $scope.aceGridDataSource.data($scope.aceGridData);
        };
    }]);
