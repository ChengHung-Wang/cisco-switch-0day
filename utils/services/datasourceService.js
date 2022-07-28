
/**
Description: Data Provider Service - Constants
Copyright (c) 2016-2019 by Cisco Systems, Inc.
All rights reserved.
*/
app.service("dataSourceService", ['$filter', function($filter) {
	var translate = $filter("translate");
	return {
		stpPriorityOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					name : "0",
					value : "0"
				}, {
					name : "4096",
					value : "4096"
				}, {
					name : "8192",
					value : "8192"
				}, {
					name : "12288",
					value : "12288"
				}, {
					name : "16384",
					value : "16384"
				}, {
					name : "20480",
					value : "20480"
				}, {
					name : "24576",
					value : "24576"
				}, {
					name : "28672",
					value : "28672"
				}, {
					name : "32768",
					value : "32768"
				}, {
					name : "36864",
					value : "36864"
				}, {
					name : "40960",
					value : "40960"
				}, {
					name : "45056",
					value : "45056"
				}, {
					name : "49152",
					value : "49152"
				}, {
					name : "53278",
					value : "53278"
				}, {
					name : "57344",
					value : "57344"
				}, {
					name : "61440",
					value : "61440"
				}]
			})
		},
		stpForwardTimeOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					name : "4",
					value : "4"
				}, {
					name : "5",
					value : "5"
				},{
					name : "6",
					value : "6"
				},{
					name : "7",
					value : "7"
				},{
					name : "8",
					value : "8"
				},{
					name : "9",
					value : "9"
				},{
					name : "10",
					value : "10"
				},{
					name : "11",
					value : "11"
				},{
					name : "12",
					value : "12"
				},{
					name : "13",
					value : "13"
				},{
					name : "14",
					value : "14"
				},{
					name : "15",
					value : "15"
				},{
					name : "16",
					value : "16"
				},{
					name : "17",
					value : "17"
				},{
					name : "18",
					value : "18"
				},{
					name : "19",
					value : "19"
				},{
					name : "20",
					value : "20"
				},{
					name : "21",
					value : "21"
				},{
					name : "22",
					value : "22"
				},{
					name : "23",
					value : "23"
				},{
					name : "24",
					value : "24"
				},{
					name : "25",
					value : "25"
				},{
					name : "26",
					value : "26"
				},{
					name : "27",
					value : "27"
				},{
					name : "28",
					value : "28"
				},{
					name : "29",
					value : "29"
				},{
					name : "30",
					value : "30"
				}]
			})
		},
		stpHelloTimeOptions : function() {
			return new kendo.data.DataSource({
				data : [
				{
					name : "1",
					value : "1"
				},{
					name : "2",
					value : "2"
				},{
					name : "3",
					value : "3"
				},{
					name : "4",
					value : "4"
				}, {
					name : "5",
					value : "5"
				},{
					name : "6",
					value : "6"
				},{
					name : "7",
					value : "7"
				},{
					name : "8",
					value : "8"
				},{
					name : "9",
					value : "9"
				},{
					name : "10",
					value : "10"
				}]
			})
		},
		stpMaxAgeOptions : function() {
			return new kendo.data.DataSource({
				data : [
				{
					name : "6",
					value : "6"
				},{
					name : "7",
					value : "7"
				},{
					name : "8",
					value : "8"
				},{
					name : "9",
					value : "9"
				},{
					name : "10",
					value : "10"
				},{
					name : "11",
					value : "11"
				},{
					name : "12",
					value : "12"
				},{
					name : "13",
					value : "13"
				},{
					name : "14",
					value : "14"
				},{
					name : "15",
					value : "15"
				},{
					name : "16",
					value : "16"
				},{
					name : "17",
					value : "17"
				},{
					name : "18",
					value : "18"
				},{
					name : "19",
					value : "19"
				},{
					name : "20",
					value : "20"
				},{
					name : "21",
					value : "21"
				},{
					name : "22",
					value : "22"
				},{
					name : "23",
					value : "23"
				},{
					name : "24",
					value : "24"
				},{
					name : "25",
					value : "25"
				},{
					name : "26",
					value : "26"
				},{
					name : "27",
					value : "27"
				},{
					name : "28",
					value : "28"
				},{
					name : "29",
					value : "29"
				},{
					name : "30",
					value : "30"
				},{
					name : "31",
					value : "31"
				},{
					name : "32",
					value : "32"
				},{
					name : "33",
					value : "33"
				},{
					name : "34",
					value : "34"
				},{
					name : "35",
					value : "35"
				},{
					name : "36",
					value : "36"
				},{
					name : "37",
					value : "37"
				},{
					name : "38",
					value : "38"
				},{
					name : "39",
					value : "39"
				},{
					name : "40",
					value : "40"
				}]
			})
		},
		transCountList : function() {
			return new kendo.data.DataSource({
				data : [
				{
					stpTransText : "1",
					stpTransValue : "1"
				},{
					stpTransText : "2",
					stpTransValue : "2"
				},{
					stpTransText : "3",
					stpTransValue : "3"
				},{
					stpTransText : "4",
					stpTransValue : "4"
				}, {
					stpTransText : "5",
					stpTransValue : "5"
				},{
					stpTransText : "6",
					stpTransValue : "6"
				},{
					stpTransText : "7",
					stpTransValue : "7"
				},{
					stpTransText : "8",
					stpTransValue : "8"
				},{
					stpTransText : "9",
					stpTransValue : "9"
				},{
					stpTransText : "10",
					stpTransValue : "10"
				},{
					stpTransText : "11",
					stpTransValue : "11"
				},{
					stpTransText : "12",
					stpTransValue : "12"
				},{
					stpTransText : "13",
					stpTransValue : "13"
				},{
					stpTransText : "14",
					stpTransValue : "14"
				},{
					stpTransText : "15",
					stpTransValue : "15"
				},{
					stpTransText : "16",
					stpTransValue : "16"
				},{
					stpTransText : "17",
					stpTransValue : "17"
				},{
					stpTransText : "18",
					stpTransValue : "18"
				},{
					stpTransText : "19",
					stpTransValue : "19"
				},{
					stpTransText : "20",
					stpTransValue : "20"
				}]
			})
		},
		stpModeOptions:function(){
			return new kendo.data.ObservableArray([
				{"stpText": "RPVST", "stpValue": "rapid-pvst"},
				{"stpText": "PVST", "stpValue": "pvst"},
				{"stpText": "MST", "stpValue": "mst"}
			]);
		},
		stpPortTypeList:function(){
			return new kendo.data.ObservableArray([
				{"stpPortText": translate('portconfig_options_edge'), "stpPortValue": "edge default"},				
				{"stpPortText": translate('toggle_network'), "stpPortValue": "network default"},
				{"stpPortText": translate('portconfig_options_normal'), "stpPortValue": "normal default"}
			]);
		},
		mtuSizeOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					mtuSizeText : '1522',
					mtuSizeValue : '1522'
				}, {
					mtuSizeText : '2048',
					mtuSizeValue : '2048'
				}, {
					mtuSizeText : 'jumbo',
					mtuSizeValue : 'jumbo'
				}]
			});
		},
		speedOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					speedText : translate('portconfig_options_auto'),
					speedValue : 'auto'
				}, {
					speedText : '10',
					speedValue : '10'
				}, {
					speedText : '100',
					speedValue : '100'
				}, {
					speedText : '1000',
					speedValue : '1000'
				}]
			});
		},
		speedOptionsCopperPort : function() {
			return new kendo.data.DataSource({
				data : [{
					speedText : translate('portconfig_options_auto'),
					speedValue : 'auto'
				}, {
					speedText : '1000',
					speedValue : '1000'
				}]
			});
		},
		speedSeleconOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					speedText : translate('portconfig_options_auto'),
					speedValue : 'auto'
				}, {
					speedText : '10',
					speedValue : '10'
				}, {
					speedText : '100',
					speedValue : '100'
				}]
			});
		},
		speedAutoOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					speedText  : translate('portconfig_options_none'),
					speedValue : 'none'
				},{
					speedText  : '10',
					speedValue : '10'
				}, {
					speedText  : '100',
					speedValue : '100'
				}, {
					speedText  : '1000',
					speedValue : '1000'
				}]
			});
		},
		duplexOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					duplexText : translate('portconfig_options_auto'),
					duplexValue : 'auto'
				}, {
					duplexText : translate('portconfig_options_half'),
					duplexValue :  'half'
				}, {
					duplexText : translate('portconfig_options_full'),
					duplexValue : 'full'
				}]
			});
		},
		ipv6TypeOptions : function() {
            return new kendo.data.DataSource({
                data : [{
					ipv6Text : translate('staticrouting_prefix'),
					ipv6Value : 'None'
				}, {
					ipv6Text : translate('common_ipv6type_anycast'),
					ipv6Value : 'anycast'
				}, {
					ipv6Text : translate('common_ipv6type_eui_64'),
					ipv6Value : 'eui-64'
				}, {
					ipv6Text : translate('common_ipv6types_link_local_address'),
					ipv6Value : 'link-local'
				}]
            });
        },
		switchModeOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					switchModeText : translate('portconfig_options_access'),
					switchModeValue : "access"
				}, {
					switchModeText : translate('portconfig_options_trunk'),
					switchModeValue : "trunk"
				}, {
					switchModeText: translate('portconfig_options_dynamic_auto'),
					switchModeValue: "dynamic auto"
				}, {
					switchModeText : translate('portconfig_options_dynamic_desirable'),
					switchModeValue : "dynamic desirable"
				}]
			});
		},

		privilegeOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					privilegeText : '0',
					privilegeValue : '0'
				}, {
					privilegeText : '1',
					privilegeValue : '1'
				}, {
					privilegeText : '2',
					privilegeValue : '2'
				}, {
					privilegeText : '3',
					privilegeValue : '3'
				}, {
					privilegeText : '4',
					privilegeValue : '4'
				}, {
					privilegeText : '5',
					privilegeValue : '5'
				}, {
					privilegeText : '6',
					privilegeValue : '6'
				}, {
					privilegeText : '7',
					privilegeValue : '7'
				}, {
					privilegeText : '8',
					privilegeValue : '8'
				}, {
					privilegeText : '9',
					privilegeValue : '9'
				}, {
					privilegeText : '10',
					privilegeValue : '10'
				}, {
					privilegeText : '11',
					privilegeValue : '11'
				}, {
					privilegeText : '12',
					privilegeValue : '12'
				}, {
					privilegeText : '13',
					privilegeValue : '13'
				}, {
					privilegeText : '14',
					privilegeValue : '14'
				}, {
					privilegeText : '15',
					privilegeValue : '15'
				}]
			});
		},

		timeZoneNameOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					timeZoneText : "UTC",
					timeZoneValue : "UTC"
				}, {
					timeZoneText : "GMT",
					timeZoneValue : "GMT"
				}, {
					timeZoneText : "GST",
					timeZoneValue : "GST"
				}, {
					timeZoneText : "GIT",
					timeZoneValue : "GIT"
				}, {
					timeZoneText : "ACT",
					timeZoneValue : "ACT"
				}, {
					timeZoneText : "ADT",
					timeZoneValue : "ADT"
				}, {
					timeZoneText : "ACDT",
					timeZoneValue : "ACDT"
				}, {
					timeZoneText : "AST",
					timeZoneValue : "AST"
				}, {
					timeZoneText : "CAT",
					timeZoneValue : "CAT"
				}, {
					timeZoneText : "CT",
					timeZoneValue : "CT"
				}, {
					timeZoneText : "EST",
					timeZoneValue : "EST"
				}, {
					timeZoneText : "GYT",
					timeZoneValue : "GYT"
				}, {
					timeZoneText : "IST",
					timeZoneValue : "IST"
				}, {
					timeZoneText : "MET",
					timeZoneValue : "MET"
				}, {
					timeZoneText : "MST",
					timeZoneValue : "MST"
				}, {
					timeZoneText : "CST",
					timeZoneValue : "CST"
				}, {
					timeZoneText : "IOT",
					timeZoneValue : "IOT"
				}, {
					timeZoneText : "WST",
					timeZoneValue : "WST"
				}, {
					timeZoneText : "WIT",
					timeZoneValue : "WIT"
				}, {
					timeZoneText : "WET",
					timeZoneValue : "WET"
				}]
			})
		},
		offsetHoursDataSource : function() {
			return new kendo.data.DataSource({
				data : [{
					offsetHoursText : '-23',
					offsetHoursValue : '-23'
				}, {
					offsetHoursText : '-22',
					offsetHoursValue : '-22'
				}, {
					offsetHoursText : '-21',
					offsetHoursValue : '-21'
				}, {
					offsetHoursText : '-20',
					offsetHoursValue : '-20'
				}, {
					offsetHoursText : '-19',
					offsetHoursValue : '-19'
				}, {
					offsetHoursText : '-18',
					offsetHoursValue : '-18'
				}, {
					offsetHoursText : '-17',
					offsetHoursValue : '-17'
				}, {
					offsetHoursText : '-16',
					offsetHoursValue : '-16'
				}, {
					offsetHoursText : '-15',
					offsetHoursValue : '-15'
				}, {
					offsetHoursText : '-14',
					offsetHoursValue : '-14'
				}, {
					offsetHoursText : '-13',
					offsetHoursValue : '-13'
				}, {
					offsetHoursText : '-12',
					offsetHoursValue : '-12'
				}, {
					offsetHoursText : '-11',
					offsetHoursValue : '-11'
				}, {
					offsetHoursText : '-10',
					offsetHoursValue : '-10'
				}, {
					offsetHoursText : '-9',
					offsetHoursValue : '-9'
				}, {
					offsetHoursText : '-8',
					offsetHoursValue : '-8'
				}, {
					offsetHoursText : '-7',
					offsetHoursValue : '-7'
				}, {
					offsetHoursText : '-6',
					offsetHoursValue : '-6'
				}, {
					offsetHoursText : '-5',
					offsetHoursValue : '-5'
				}, {
					offsetHoursText : '-4',
					offsetHoursValue : '-4'
				}, {
					offsetHoursText : '-3',
					offsetHoursValue : '-3'
				}, {
					offsetHoursText : '-2',
					offsetHoursValue : '-2'
				}, {
					offsetHoursText : '-1',
					offsetHoursValue : '-1'
				}, {
					offsetHoursText : '0',
					offsetHoursValue : '0'
				}, {
					offsetHoursText : '1',
					offsetHoursValue : '1'
				}, {
					offsetHoursText : '2',
					offsetHoursValue : '2'
				}, {
					offsetHoursText : '3',
					offsetHoursValue : '3'
				}, {
					offsetHoursText : '4',
					offsetHoursValue : '4'
				}, {
					offsetHoursText : '5',
					offsetHoursValue : '5'
				}, {
					offsetHoursText : '6',
					offsetHoursValue : '6'
				}, {
					offsetHoursText : '7',
					offsetHoursValue : '7'
				}, {
					offsetHoursText : '8',
					offsetHoursValue : '8'
				}, {
					offsetHoursText : '9',
					offsetHoursValue : '9'
				}, {
					offsetHoursText : '10',
					offsetHoursValue : '10'
				}, {
					offsetHoursText : '11',
					offsetHoursValue : '11'
				}, {
					offsetHoursText : '12',
					offsetHoursValue : '12'
				}, {
					offsetHoursText : '13',
					offsetHoursValue : '13'
				}, {
					offsetHoursText : '14',
					offsetHoursValue : '14'
				}, {
					offsetHoursText : '15',
					offsetHoursValue : '15'
				}, {
					offsetHoursText : '16',
					offsetHoursValue : '16'
				}, {
					offsetHoursText : '17',
					offsetHoursValue : '17'
				}, {
					offsetHoursText : '18',
					offsetHoursValue : '18'
				}, {
					offsetHoursText : '19',
					offsetHoursValue : '19'
				}, {
					offsetHoursText : '20',
					offsetHoursValue : '20'
				}, {
					offsetHoursText : '21',
					offsetHoursValue : '21'
				}, {
					offsetHoursText : '22',
					offsetHoursValue : '22'
				}, {
					offsetHoursText : '23',
					offsetHoursValue : '23'
				}]
			})

		},
		offsetMinutesDataSource : function() {
			return new kendo.data.DataSource({
				data : [{
					offsetMinutesText : '0',
					offsetMinutesValue : '0'
				}, {
					offsetMinutesText : '1',
					offsetMinutesValue : '1'
				}, {
					offsetMinutesText : '2',
					offsetMinutesValue : '2'
				}, {
					offsetMinutesText : '3',
					offsetMinutesValue : '3'
				}, {
					offsetMinutesText : '4',
					offsetMinutesValue : '4'
				}, {
					offsetMinutesText : '5',
					offsetMinutesValue : '5'
				}, {
					offsetMinutesText : '6',
					offsetMinutesValue : '6'
				}, {
					offsetMinutesText : '7',
					offsetMinutesValue : '7'
				}, {
					offsetMinutesText : '8',
					offsetMinutesValue : '8'
				}, {
					offsetMinutesText : '9',
					offsetMinutesValue : '9'
				}, {
					offsetMinutesText : '10',
					offsetMinutesValue : '10'
				}, {
					offsetMinutesText : '11',
					offsetMinutesValue : '11'
				}, {
					offsetMinutesText : '12',
					offsetMinutesValue : '12'
				}, {
					offsetMinutesText : '13',
					offsetMinutesValue : '13'
				}, {
					offsetMinutesText : '14',
					offsetMinutesValue : '14'
				}, {
					offsetMinutesText : '15',
					offsetMinutesValue : '15'
				}, {
					offsetMinutesText : '16',
					offsetMinutesValue : '16'
				}, {
					offsetMinutesText : '17',
					offsetMinutesValue : '17'
				}, {
					offsetMinutesText : '18',
					offsetMinutesValue : '18'
				}, {
					offsetMinutesText : '19',
					offsetMinutesValue : '19'
				}, {
					offsetMinutesText : '20',
					offsetMinutesValue : '20'
				}, {
					offsetMinutesText : '21',
					offsetMinutesValue : '21'
				}, {
					offsetMinutesText : '22',
					offsetMinutesValue : '22'
				}, {
					offsetMinutesText : '23',
					offsetMinutesValue : '23'
				}, {
					offsetMinutesText : '24',
					offsetMinutesValue : '24'
				}, {
					offsetMinutesText : '25',
					offsetMinutesValue : '25'
				}, {
					offsetMinutesText : '26',
					offsetMinutesValue : '26'
				}, {
					offsetMinutesText : '27',
					offsetMinutesValue : '27'
				}, {
					offsetMinutesText : '28',
					offsetMinutesValue : '28'
				}, {
					offsetMinutesText : '29',
					offsetMinutesValue : '29'
				}, {
					offsetMinutesText : '30',
					offsetMinutesValue : '30'
				}, {
					offsetMinutesText : '31',
					offsetMinutesValue : '31'
				}, {
					offsetMinutesText : '32',
					offsetMinutesValue : '32'
				}, {
					offsetMinutesText : '33',
					offsetMinutesValue : '33'
				}, {
					offsetMinutesText : '34',
					offsetMinutesValue : '34'
				}, {
					offsetMinutesText : '35',
					offsetMinutesValue : '35'
				}, {
					offsetMinutesText : '36',
					offsetMinutesValue : '36'
				}, {
					offsetMinutesText : '37',
					offsetMinutesValue : '37'
				}, {
					offsetMinutesText : '38',
					offsetMinutesValue : '38'
				}, {
					offsetMinutesText : '39',
					offsetMinutesValue : '39'
				}, {
					offsetMinutesText : '40',
					offsetMinutesValue : '40'
				}, {
					offsetMinutesText : '41',
					offsetMinutesValue : '41'
				}, {
					offsetMinutesText : '42',
					offsetMinutesValue : '42'
				}, {
					offsetMinutesText : '43',
					offsetMinutesValue : '43'
				}, {
					offsetMinutesText : '44',
					offsetMinutesValue : '44'
				}, {
					offsetMinutesText : '45',
					offsetMinutesValue : '45'
				}, {
					offsetMinutesText : '46',
					offsetMinutesValue : '46'
				}, {
					offsetMinutesText : '47',
					offsetMinutesValue : '47'
				}, {
					offsetMinutesText : '48',
					offsetMinutesValue : '48'
				}, {
					offsetMinutesText : '49',
					offsetMinutesValue : '49'
				}, {
					offsetMinutesText : '50',
					offsetMinutesValue : '50'
				}, {
					offsetMinutesText : '51',
					offsetMinutesValue : '51'
				}, {
					offsetMinutesText : '52',
					offsetMinutesValue : '52'
				}, {
					offsetMinutesText : '53',
					offsetMinutesValue : '53'
				}, {
					offsetMinutesText : '54',
					offsetMinutesValue : '54'
				}, {
					offsetMinutesText : '55',
					offsetMinutesValue : '55'
				}, {
					offsetMinutesText : '56',
					offsetMinutesValue : '56'
				}, {
					offsetMinutesText : '57',
					offsetMinutesValue : '57'
				}, {
					offsetMinutesText : '58',
					offsetMinutesValue : '58'
				}, {
					offsetMinutesText : '59',
					offsetMinutesValue : '59'
				}]
			})

		},

		stormControlOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					stormControlText : translate('portconfig_options_none'),
					stormControlValue : 'none'
				}, {
					stormControlText : translate('portconfig_options_shutdown'),
					stormControlValue : 'shutdown'
				}, {
					stormControlText : translate('portconfig_options_trap'),
					stormControlValue : 'trap'
				}]
			});
		},
		autoQosOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					autoQosText : translate('portconfig_options_none'),
					autoQosValue : 'none'
				},{
					autoQosText : translate('portconfig_options_classify'),
					autoQosValue : 'classify'
				},{
					autoQosText : translate('portconfig_options_trust'),
					autoQosValue : 'trust'
				},{
					autoQosText : translate('portconfig_options_videocts'),
					autoQosValue : 'video cts'
				},{
					autoQosText : translate('portconfig_options_videocamera'),
					autoQosValue : 'video ip-camera'
				},{
					autoQosText : translate('portconfig_options_videomedia'),
					autoQosValue : 'video media-player'
				},{
					autoQosText : translate('portconfig_options_videophone'),
					autoQosValue : 'voip cisco-phone'
				},{
					autoQosText : translate('portconfig_options_videosoftphone'),
					autoQosValue : 'voip cisco-softphone'
				},{
					autoQosText : translate('portconfig_options_voiptrust'),
					autoQosValue : 'voip trust'
				}]
			});
		},
		typeOptions : function() {
			return new kendo.data.DataSource({
				data : [{
					typeText  :translate('aaa_user_type_default'),
					typeValue : 'default'
				}, {
					typeText  :translate('aaa_user_type_lobby-admin'),
					typeValue : 'lobby-admin'
				}, {
					typeText  :translate('aaa_user_type_mgmt-user'),
					typeValue : 'mgmt-user'
				}, {
					typeText  :translate('aaa_user_type_network-user'),
					typeValue : 'network-user'
				}]
			});
		},
		transferDataSource : function() {
            return new kendo.data.DataSource({
                data : [{
                     transferText  :translate('config_file_transfer_tftp_server'),
                     transferValue : "tftp"
                }, {
                     transferText :translate('config_file_transfer_local_hd'),
                     transferValue : "local_hard_drive"
                }]
            })
		},
		fileDataSource : function() {
            return new kendo.data.DataSource({
                 data : [{
                       fileText  :translate('config_file_transfer_toswitch'),
                       fileValue : "To_Switch"
                  }, {
                       fileText : translate('config_file_transfer_fromswitch'),
                       fileValue : "From_Switch"
                  } ]
            })
       },
      vtpVersionDataSource : function() {
          return new kendo.data.DataSource({
               data : [{
            	   vtpVersionName  :"V1",
            	   vtpVersionValue : "1"
                }, {
                	vtpVersionName : "V2",
                	vtpVersionValue : "2"
                } ,{
                	vtpVersionName : "V3",
                	vtpVersionValue : "3"
               }]
          })
     },
     vtpModeDataSource : function() {
         return new kendo.data.DataSource({
              data : [{
               		vtpModeName : translate('vtp_mode_server'),
               		vtpModeValue : "Server"
               	}, {
               		vtpModeName : translate('vtp_mode_off'),
               		vtpModeValue : "Off"
               	}, {
               		vtpModeName : translate('vtp_mode_client'),
               		vtpModeValue : "Client"
               	}, {
               		vtpModeName : translate('vtp_mode_transparent'),
               		vtpModeValue : "Transparent"
               	} ]
         })
    },
    iPTypeDataSource : function() {
          return new kendo.data.DataSource({
                 data : [{
                	 		text  : translate('ntp_none'),
                	 		value : 'none'
                 		},{
                            text  : translate('com_ipaddress_static'),
                            value : 'static'
                        },{
                             text  : translate('staticrouting_dhcp'),
                             value : 'dhcp'
                        },{
                             text  : translate('com_dhcp_pool'),
                             value : 'pool'
                        }]
                 })
      },
	interfaceData : function() {
        return new kendo.data.DataSource({
                 data : [{
                    interfaceName:translate('es_config_domain_ntp_shared_secret'), 
                    interfaceValue: "ntp-shared-secret"
                },{
                    interfaceName:translate('aaa_ser_rad_shared_sec'), 
                    interfaceValue: "shared-secret"
                }]
        })
    },
	pwdData : function() {
        return new kendo.data.DataSource({
                 data : [{
                    pwdName: translate('es_unencrypt'),
                    pwdValue: "0"
                },{
                    pwdName: translate('es_encrypt'),
                    pwdValue: "7"
                }]
        })
    },
	energywiseData : function() {
        return new kendo.data.DataSource({
                 data : [{
						energywiseName: translate('ntp_none'),
						energywiseValue: "None"
					},{
						energywiseName: translate('portconfig_general_interface'),
						energywiseValue: "interface"
					},{
						energywiseName: translate('clients_ip'),
						energywiseValue: "ip"
					}]
        })
    },
	ripMaxpathDataSource : function() {
		return new kendo.data.DataSource({
                 data : [{
						maxPathName: "1",
						maxPathValue: "1"
					},{
						maxPathName: "2",
						maxPathValue: "2"
					},{
						maxPathName: "3",
						maxPathValue: "3"
					},{
						maxPathName: "4",
						maxPathValue: "4"
					},{
						maxPathName: "5",
						maxPathValue: "5"
					},{
						maxPathName: "6",
						maxPathValue: "6"
					},{
						maxPathName: "7",
						maxPathValue: "7"
					},{
						maxPathName: "8",
						maxPathValue: "8"
					},{
						maxPathName: "9",
						maxPathValue: "9"
					},{
						maxPathName: "10",
						maxPathValue: "10"
					},{
						maxPathName: "11",
						maxPathValue: "12"
					},{
						maxPathName: "13",
						maxPathValue: "13"
					},{
						maxPathName: "14",
						maxPathValue: "14"
					},{
						maxPathName: "15",
						maxPathValue: "15"
					},{
						maxPathName: "16",
						maxPathValue: "16"
					},{
						maxPathName: "17",
						maxPathValue: "17"
					},{
						maxPathName: "18",
						maxPathValue: "18"
					},{
						maxPathName: "19",
						maxPathValue: "19"
					},{
						maxPathName: "20",
						maxPathValue: "20"
					},{
						maxPathName: "21",
						maxPathValue: "21"
					},{
						maxPathName: "22",
						maxPathValue: "22"
					},{
						maxPathName: "23",
						maxPathValue: "23"
					},{
						maxPathName: "24",
						maxPathValue: "24"
					},{
						maxPathName: "25",
						maxPathValue: "25"
					},{
						maxPathName: "26",
						maxPathValue: "26"
					},{
						maxPathName: "27",
						maxPathValue: "27"
					},{
						maxPathName: "28",
						maxPathValue: "28"
					},{
						maxPathName: "29",
						maxPathValue: "29"
					},{
						maxPathName: "30",
						maxPathValue: "30"
					},{
						maxPathName: "31",
						maxPathValue: "31"
					},{
						maxPathName: "32",
						maxPathValue: "32"
					}
					]
        })
	},
	ripMaxpathDataSource1 : function() {
		return new kendo.data.DataSource({
                 data : [{
						maxPathName: "1",
						maxPathValue: "1"
					},{
						maxPathName: "2",
						maxPathValue: "2"
					},{
						maxPathName: "3",
						maxPathValue: "3"
					},{
						maxPathName: "4",
						maxPathValue: "4"
					},{
						maxPathName: "5",
						maxPathValue: "5"
					},{
						maxPathName: "6",
						maxPathValue: "6"
					},{
						maxPathName: "7",
						maxPathValue: "7"
					},{
						maxPathName: "8",
						maxPathValue: "8"
					}
					]
        })
	},    
    loggingOptions : function() {
		return new kendo.data.DataSource({
			data : [{
				severityText : 'Emergencies',
				severityValue : '0'
			}, {
				severityText : 'Alerts',
				severityValue : '1'
			}, {
				severityText : 'Critical',
				severityValue : '2'
			}, {
				severityText : 'Errors',
				severityValue : '3'
			}, {
				severityText : 'Warnings',
				severityValue : '4'
			}, {
				severityText : 'Notifications',
				severityValue : '5'
			}, {
				severityText : 'Informational',
				severityValue : '6'
			}, {
				severityText : 'Debugging',
				severityValue : '7'
			}]
		});
	},
	refrwdingPolicyOptions : function() {
		return new kendo.data.DataSource({
			data : [{
                refrwdingPolicyText: translate('portconfig_options_none'),
                refrwdingPolicyValue: "none"
            },{
				refrwdingPolicyText: translate('sys_dhcp_refrwding_drop'),
				refrwdingPolicyValue: "drop"
			},{
				refrwdingPolicyText: translate('sys_dhcp_refrwding_encapsulate'),
				refrwdingPolicyValue: "encapsulate"
			},{
				refrwdingPolicyText: translate('sys_dhcp_refrwding_keep'),
				refrwdingPolicyValue: "keep"
			},{
				refrwdingPolicyText: translate('sys_dhcp_refrwding_replace'),
				refrwdingPolicyValue: "replace"
			}
			]
		})
	},
	nodeTypeOptions : function() {
		return new kendo.data.DataSource({
			data : [{
				textnode: translate('portconfig_options_none'),
				valuenode: "none"
			},{
				textnode: translate('sys_dhcp_netbios_node_type_broadcast'),
				valuenode: "b-node"
			},{
				textnode: translate('sys_dhcp_netbios_node_type_hybrid'),
				valuenode: "h-node"
			},{
				textnode: translate('sys_dhcp_netbios_node_type_mixed'),
				valuenode: "m-node"
			},{
				textnode: translate('sys_dhcp_netbios_node_type_peer-to-peer'),
				valuenode: "p-node"
			},{
				textnode: translate('sys_dhcp_netbios_node_type_hexadecimal'),
				valuenode: "<0-FF>"
			}
			]
		})
	},
		
	}
}]);
