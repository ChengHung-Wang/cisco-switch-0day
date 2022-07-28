/**
 Description: Services for STP.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service('aaaService',['$rootScope','requestRoutingService','getStringLineService','executeCliCmdService','$filter', function($rootScope,requestRoutingService,getStringLineService,executeCliCmdService,$filter) {
	var translate = $filter("translate")
        ,aaaCLI = ""
        ,aaaCLIOP = "";
    return{
        loadInitialAAACLI: function(){
            aaaCLI = "show running-config aaa radius-server\n show running-config aaa group server radius\n show running-config aaa";
            aaaCLIOP = deviceCommunicatorCLI.getExecCmdOutput(aaaCLI);
        },
        getAAARadiusServer:function(){
        	var showRunConfradSer=aaaCLIOP[0].split("radius server");
            var aaaRadiusServer = [];
            for (var i=1; i < showRunConfradSer.length; i++) {
                var intShowRun="radius server "+showRunConfradSer[i];
                var serRadObj = {};
                serRadObj["name"] = executeCliCmdService.getNextString(intShowRun,["radius server"],["\n"]).trim();
                serRadObj["address"] = executeCliCmdService.getNextString(intShowRun,["address ipv4"],["auth-port"]).trim();
                serRadObj["authport"] = executeCliCmdService.getNextString(intShowRun,["auth-port"],["acct-port"]).trim();
                serRadObj["acctport"] = executeCliCmdService.getNextString(intShowRun,["acct-port"],["\n"]).trim();
                serRadObj["password"] = executeCliCmdService.getNextString(intShowRun,["key"],["\n"]).trim();
                aaaRadiusServer.push(serRadObj)
            }
            return aaaRadiusServer;
        },
        getAAARadiusTacacs: function(){
        	var aaaTacacsServer = requestRoutingService.getShowCmdOutput("show running-config aaa tacacs-server", "aaaForTacacServer");
        	if(angular.isUndefined(aaaTacacsServer.ShowRunningconfigAaa.wnwebdata.entry)){
        		return undefined;
        	}else if(!angular.isArray(aaaTacacsServer.ShowRunningconfigAaa.wnwebdata.entry)){
        		return [aaaTacacsServer.ShowRunningconfigAaa.wnwebdata.entry];
        	}
        	return aaaTacacsServer.ShowRunningconfigAaa.wnwebdata.entry;
        },
		getAAARadiusFallBack:function(){
          var aaaRadiusFallBack = requestRoutingService.getShowCmdOutput("show running-config aaa radius-server", "aaaRadiusFallback");
          return aaaRadiusFallBack.RadiusServerFallback.wnwebdata;
        },
		aaaGeneralLocalAuthentication:function(){
			var aaaLocalAuthentication = new kendo.data.ObservableArray([
                                {"name": translate('portconfig_options_none'), "value": "none"},
                                {"name": translate('port_config_default'), "value": "default"},
								{"name": translate('aaa_general_local_authentication'), "value": "methodlist"}
                        ]);
			return aaaLocalAuthentication;
		},
        getAAAGeneralMethodList:function(){
			var aaaLocalAuthorizationMethod = new kendo.data.ObservableArray([
					{"name": translate('aaa_general_local_authentication_method'), "value": "Select a Value"}
			]);
			return aaaLocalAuthorizationMethod;
		},
        getAAAGeneral:function(){
            var genLocalAuthAuthor = executeCliCmdService.getNextString(aaaCLIOP[2],["aaa local authentication"],["\n"]).trim(),
                genralListOP = {};
            var authMethodListsData = this.getAAAMethodListAuthentication();
            var authorMethodListsData = this.getAAAMethodListAuthorization();
            var authMethodLists = [];
            var authorMethodLists = [];
            if(authMethodListsData){
                for(var aml = 0; aml < authMethodListsData.length; aml++){
                    authMethodLists.push({
                        authName: authMethodListsData[aml].listname,
                        authValue: authMethodListsData[aml].listname
                    });
                }
            }
            if(authorMethodListsData){
                for(var auml = 0; auml < authorMethodListsData.length; auml++){
                    authorMethodLists.push({
                        authorName: authorMethodListsData[auml].listname,
                        authorValue: authorMethodListsData[auml].listname
                    });
                }
            }
            if(genLocalAuthAuthor){
                genLocalAuthAuthor = genLocalAuthAuthor.split("authorization");
                if(genLocalAuthAuthor.length > 0){
                    var genLocalAuthVal = genLocalAuthAuthor[0].trim() != "default" ? "methodlist" : genLocalAuthAuthor[0].trim(),
                        genLocalAuthorVal = genLocalAuthAuthor[1].trim() != "default" ? "methodlist" : genLocalAuthAuthor[1].trim();
                    genralListOP.authentication = genLocalAuthVal;
                    genralListOP.authorization = genLocalAuthorVal;
                    genralListOP.authName = genLocalAuthAuthor[0].trim();
                    genralListOP.authorName = genLocalAuthAuthor[1].trim();
                }
            }else{
                genralListOP.authentication = "none";
                genralListOP.authorization = "none";
                genralListOP.authName = "";
                genralListOP.authorName = "";
            }
           genralListOP.authMethodLists = new kendo.data.DataSource({
                data : authMethodLists
           });

            genralListOP.authorMethodLists = new kendo.data.DataSource({
                data : authorMethodLists
            });
            return genralListOP;
        },
		getAAAGeneralDot1x:function(){
			var dot1xOutput = deviceCommunicator.getExecCmdOutput("show run | in dot1x");
			if(dot1xOutput.indexOf("dot1x system-auth-control")!=-1){
				return 1;
			}else{
				return 0;
			}
		 },
		 getAAAGeneralLeastOutstanding:function(){
			var Least = deviceCommunicator.getExecCmdOutput("sh run | in least-outstanding");
			if(Least.indexOf("radius-server load-balance method least-outstanding")!=-1){
				return 1;
			}else{
				return 0;
			}
		 },
        macFilterOptions : function() {
            return new kendo.data.DataSource({
                data : [{
                    macFilterName : translate('ntp_none'),
                    macFilterValue : 'none'
                }, {
                    macFilterName : translate('aaa_mac'),
                    macFilterValue : 'mac'
                }, {
                    macFilterName : translate('aaa_shared_secret'),
                    macFilterValue : 'shared-secret'
                }]
            })
        },
        macDelimeterOptions : function() {
            return new kendo.data.DataSource({
                data : [{
                    macDelimeterName : translate('ntp_none'),
                    macDelimeterValue : 'none'
                }, {
                    macDelimeterName : translate('aaa_colon'),
                    macDelimeterValue : 'colon'
                }, {
                    macDelimeterName : translate('aaa_hyphen'),
                    macDelimeterValue : 'hyphen'
                }, {
                    macDelimeterName : translate('aaa_single_hyphen'),
                    macDelimeterValue : 'single-hyphen'
                }]
            })
        },
        getAAAServerGroupRadius: function(){
            var aaaRadiusServerGroup = aaaCLIOP[1].split("aaa group server radius");
            var aaaRadiusServerGrp = [];
            for (var i=1; i < aaaRadiusServerGroup.length; i++) {
                var intShowRun="aaa group server radius "+aaaRadiusServerGroup[i];
                var serRadGrpObj = {};
                serRadGrpObj["name"] = executeCliCmdService.getNextString(intShowRun,["aaa group server radius"],["\n"]).trim();
                serRadGrpObj["deadtime"] = executeCliCmdService.getNextString(intShowRun,["deadtime"],["\n"]).trim();
                serRadGrpObj["macdelimiter"] = executeCliCmdService.getNextString(intShowRun,[" mac-delimiter"],["\n"]).trim();
                serRadGrpObj["securitymode"] = executeCliCmdService.getNextString(intShowRun,["security-mode"],["\n"]).trim();
                aaaRadiusServerGrp.push(serRadGrpObj);
            }
            return aaaRadiusServerGrp;
         },
		 getAAAServerGroupTacacs: function(){
            var aaaForTacacsGroup = requestRoutingService.getShowCmdOutput("show running-config aaa group server tacacs+", "aaaForTacacsGroup");
			if(aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata){
				for(var aaaRSG = 0; aaaRSG < aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry.length; aaaRSG++){
						if(angular.isUndefined(aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry[aaaRSG].list)){
							aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry[aaaRSG].list = [];
						}
						if(angular.isUndefined(aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry[aaaRSG].list.length)){
							aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry[aaaRSG].list = [aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry[aaaRSG].list];
						}
				}
				if(angular.isUndefined(aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry)){
					return undefined;
				}else if(!angular.isArray(aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry)){
					return [aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry];
				}
				return aaaForTacacsGroup.ShowRunningconfigAaa.wnwebdata.entry;
			}else{
                return undefined;
			}
        },
        authTypeOptions : function() {
            return new kendo.data.DataSource({
                data : [{
                    authTypeName : translate('aaa_auth_type_dot1x'),
                    authTypeValue : 'dot1x'
                }, {
                    authTypeName : translate('aaa_auth_type_login'),
                    authTypeValue : 'login'
                }]
            })
        },
        groupTypeOptions : function() {
            return new kendo.data.DataSource({
                data : [{
                    groupTypeName : translate('aaa_auth_grouptype_group'),
                    groupTypeValue : 'group'
                }, {
                    groupTypeName : translate('aaa_auth_grouptype_local'),
                    groupTypeValue : 'local'
                }]
            })
        },
        getAAAMethodListAuthentication: function(){
            var aaaMethodListAuth = requestRoutingService.getShowCmdOutput("show running-config aaa authentication", "aaaForAuthentication");
            if(aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata){
                aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry = $.map(aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry, function(value) {
                    return [value];
                });
                for(var aaaAuth = 0; aaaAuth < aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry.length; aaaAuth++){
                    if(aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].hasOwnProperty('loginauthentication')){
                        aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth] = aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].loginauthentication;
                    }
                    if(aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].hasOwnProperty('dot1xauthentication')){
                        aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth] = aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].dot1xauthentication;
                    }
                    if(angular.isUndefined(aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].group)){
                        aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].group = $.map(aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].group, function(value) {
                            return [value];
                        });
                    }
                    if(angular.isUndefined(aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].group.length)){
                        aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].group = $.map(aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry[aaaAuth].group, function(value) {
                            return [value];
                        });
                    }
                }
                return aaaMethodListAuth.ShowRunningconfigAaa.wnwebdata.entry;
            }else{
                return undefined;
            }
        },
		serverldapOptions : function() {
            return new kendo.data.DataSource({
                data : [{
                    serverldapName : translate('aaa_server_ldap_anony'),
                    serverldapValue : 'Anonymous'
                }, {
                    serverldapName : translate('aaa_server_ldap_auth'),
                    serverldapValue : 'Authenticated'
                }]
            })
        },
		serverldapuserAttr:function(){
			var userAttributesOptions=[];
			var newModelconfi = "aaa new-model \n";
			newModelconfi += "exit \n";
			requestRoutingService.getConfigCmdOutput(newModelconfi);
			var showLdapServerAttrList = requestRoutingService.getShowCmdOutput("show ldap attributes","aaaLdapAttributes");
			if(showLdapServerAttrList.ShowLdapAttributes.wnwebdata.entry){
				var totalArr = showLdapServerAttrList.ShowLdapAttributes.wnwebdata.entry;
				for(var userA=0;userA<totalArr.length;userA++){
					userAttributesOptions.push({
						"ldapuserattrName": totalArr[userA].userAttributes,
						"ldapuserattrValue": totalArr[userA].userAttributes
					});
				}
			}
			return userAttributesOptions;
		},
		serverldapTrustPoint:function(){
			var trustPointOptions=[];
			var showLdapServertrustPoint = requestRoutingService.getShowCmdOutput("show crypto pki trustpoints status","aaaLdapTrustPoints");
			if(showLdapServertrustPoint.ShowCryptoPkiTrustpointsStatus.wnwebdata.trust){
				for(var trustP in showLdapServertrustPoint){
					trustPointOptions.push({
						"ldaptrstPointName": showLdapServertrustPoint.ShowCryptoPkiTrustpointsStatus.wnwebdata.trust.TrustPoint,
						"ldaptrstPointValue": showLdapServertrustPoint.ShowCryptoPkiTrustpointsStatus.wnwebdata.trust.TrustPoint
					});
				}
			}
			return trustPointOptions;
		},
		serverldaploaddata:function(){
			var serverldapdetail = requestRoutingService.getShowCmdOutput("show running-config aaa ldap", "aaaForLdapServer");
			if(angular.isUndefined(serverldapdetail.ShowRunningconfigAaa.wnwebdata.entry)){
        		return undefined;
        	}else if(!angular.isArray(serverldapdetail.ShowRunningconfigAaa.wnwebdata.entry)){
        		return [serverldapdetail.ShowRunningconfigAaa.wnwebdata.entry];
        	}
			return serverldapdetail.ShowRunningconfigAaa.wnwebdata.entry;
		},
		getAAAServerGroupLdap: function(){
            var aaaForLdapGroup = requestRoutingService.getShowCmdOutput("show running-config aaa group server ldap", "aaaForLdapGroup");
			if(aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry){
				if(!angular.isArray(aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry)){
					aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry = [aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry];
				}
				for(var aaaLdap = 0; aaaLdap < aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry.length; aaaLdap++){
					if(aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry[aaaLdap].list.length > 0){
						aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry[aaaLdap].list.splice(0,1);
					}
				}
				if(angular.isUndefined(aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry)){
				   return undefined;
				}else if(!angular.isArray(aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry)){
					return [aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry];
				}
				return aaaForLdapGroup.ShowRunningconfigAaa.wnwebdata.entry;
			}
        },
        authorTypeOptions : function() {
            return new kendo.data.DataSource({
                data : [{
                    authorTypeName : translate('aaa_author_type'),
                    authorTypeValue : 'network'
                }, {
                    authorTypeName : translate('aaa_author_exec'),
                    authorTypeValue : 'exec'
                }, {
                    authorTypeName : translate('aaa_author_credential_download'),
                    authorTypeValue : 'credential-download'
                }]
            })
        },
        getAAAMethodListAuthorization: function(){
            var aaaMethodListAuthor = requestRoutingService.getShowCmdOutput("show running-config aaa authorization", "aaaForAuthorization");
            if(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata){
                aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry = $.map(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry, function(value) {
                    return [value];
                });
                for(var aaaAuthor = 0; aaaAuthor < aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry.length; aaaAuthor++){
                    if(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].hasOwnProperty('loginauthorization')){
                        aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor] = aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].loginauthorization;
                    }
                    if(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].hasOwnProperty('execauthorization')){
                        aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor] = aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].execauthorization;
                    }
                    if(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].hasOwnProperty('networkauthorization')){
                        aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor] = aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].networkauthorization;
                    }
                    if(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].hasOwnProperty('credential-downloadauthorization')){
                        aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor] = aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor]['credential-downloadauthorization'];
                    }
                    if(angular.isUndefined(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].group)){
                        aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].group = $.map(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].group, function(value) {
                            return [value];
                        });
                    }
                    if(angular.isUndefined(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].group.length)){
                        aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].group = $.map(aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry[aaaAuthor].group, function(value) {
                            return [value];
                        });
                    }
                }
                return aaaMethodListAuthor.ShowRunningconfigAaa.wnwebdata.entry;
            }else{
                return undefined;
            }
        },
		accoutTypeOptions : function() {
            return new kendo.data.DataSource({
                data : [{
                    accountTypeName : translate('aaa_auth_type_dot1x'),
                    accountTypeValue : 'dot1x'
                }, {
                    accountTypeName : translate('aaa_author_exec'),
                    accountTypeValue : 'exec'
                },{
                    accountTypeName : translate('aaa_acc_identity'),
                    accountTypeValue : 'identity'
                },{
                    accountTypeName : translate('aaa_author_type'),
                    accountTypeValue : 'network'
                },{
                    accountTypeName : translate('aaa_acc_cmds'),
                    accountTypeValue : 'commands'
                }]
            })
        },
		methodlistAccountloaddata:function(){
			var accountdetail = requestRoutingService.getShowCmdOutput("show running-config aaa accounting", "aaaForAccounting");
			if(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata){
				accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry = $.map(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry, function(value) {
                    return [value];
                });
				for(var aaaAccount = 0; aaaAccount < accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry.length; aaaAccount++){
					if(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].hasOwnProperty('dot1xaccounting')){
						accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount] = accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].dot1xaccounting;
					}
					if(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].hasOwnProperty('identityaccounting')){
						accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount] = accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].identityaccounting;
					}
					if(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].hasOwnProperty('execaccounting')){
						accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount] = accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].execaccounting;
					}
					if(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].hasOwnProperty('commandsaccounting')){
						accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount] = accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].commandsaccounting;
					}
					if(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].hasOwnProperty('networkaccounting')){
						accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount] = accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].networkaccounting;
					}
					if(angular.isUndefined(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].group)){
                        accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].group = $.map(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].group, function(value) {
                            return [value];
                        });
                    }
                    if(angular.isUndefined(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].group.length)){
                        accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].group = $.map(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry[aaaAccount].group, function(value) {
                            return [value];
                        });
                    }
				}
			}
			if(angular.isUndefined(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry)){
        		return undefined;
        	}else if(!angular.isArray(accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry)){
        		return [accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry];
        	}
			return accountdetail.ShowRunningconfigAaaAccounting.wnwebdata.entry;
		}
    }
}]);
