/**
 Description: Validation service containing all validation API.
 June 2014
 Copyright (c) 2015-2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service('validationService', function($rootScope, $location) {
	this.validators = [];
	this.wirelessPossible = false;
	this.TDL_MESSAGE = "TDL_MESSAGE";
	this.WSMA_MESSAGE = "WSMA_MESSAGE";
	/**
	 * Validates a given IPV4 Address
	 * @param ipv4Address
	 * @returns {boolean}
	 */
	this.validateIpAddress = function(ipv4Address) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof ipv4Address == 'string') {
			testString = ipv4Address;
		} else {
			testString = ipv4Address.val();
		}
		// Commented out the old regx
		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(testString) || testString == '') {
			return true;
		};
		return false;
	};

	/**
	 * Validates a given IPV6 Address
	 * @param ipv6Address
	 * @returns {boolean}
	 */
	this.validateIpv6Address = function(ipv6Address) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof ipv6Address == 'string') {
			testString = ipv6Address;
		} else {
			testString = ipv6Address.val();
		}

		if (new RegExp("^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$").test(testString)) {

			return true;
		};

		return false;
	};

	/**
	 * Validates if given value is not a reserved IpAddress
	 * @param ipv4Address
	 * @returns {boolean}
	 */
	this.validateReservedIpAddress = function(ipv4Address) {
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

	/**
	 * Validates a given Multicast IP Address
	 * @param multicastAddress
	 * @returns {boolean}
	 */
	this.validateMulticastIpAddress = function(multicastAddress) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof multicastAddress == 'string') {
			testString = multicastAddress;
		} else {
			testString = multicastAddress.val();
		}
		if (/^(2[23][4-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(testString) || testString == '') {
			return true;
		};
		return false;
	};

	/**
	 * Validates if given value is not a localhost IpAddress
	 * @param ipv4Address
	 * @returns {boolean}
	 */
	this.validateLocalHost = function(ipv4Address) {
		var testString;

		if ( typeof ipv4Address == 'string') {
			testString = ipv4Address;
		} else {
			testString = ipv4Address.val();
		}
		if (testString == "127.0.0.0") {
			return false;
		}
		return true;
	};

	/**
	 * Validates a given Subnet Mask
	 * @param value
	 * @returns {boolean}
	 */
	this.validateSubnetMask = function(value) {
		if (_.isUndefined(value)) {
			return false;
		} else {
			var subnetRegex = "^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$";
			if (new RegExp(subnetRegex).test(value)) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Validates a given ACL Subnet Mask
	 * @param value
	 * @returns {boolean}
	 */
	this.validateAclSubnetMask = function(value) {
		if (_.isUndefined(value)) {
			return false;
		} else {
			var octets = value.split(".");
			if (!_.isUndefined(octets) && octets.length != 4) {
				return false
			} else {
				for (var index = 0; index < octets.length; index++) {
					if (_.isNumber(Number(octets[index])) == false) {
						return false;
					}
					if (!(Number(octets[index]) == 0 || Number(octets[index]) == 1 || Number(octets[index]) == 3 || Number(octets[index]) == 7 || Number(octets[index]) == 15 || Number(octets[index]) == 31 || Number(octets[index]) == 63 || Number(octets[index]) == 127 || Number(octets[index]) == 255)) {
						return false;
					}
				}
			}
		}
		return true;
	};

	/**
	 * Validates Special Characters like ? or space
	 * @param value
	 * @returns {boolean}
	 */
	this.validateSpecialCharacters = function(value) {
		if (_.contains(value, " ") || _.contains(value, "?")) {
			return false;
		}
		return true;
	};

	/**
	 * Check if there are invalid characters in a file path.
	 * The set of invalid characters are \ * ? < > | and space.
	 * @param value
	 * @returns {boolean}
	 */
	this.validateFilePath = function(value) {
		return ((!/[ *|<>\?]/g.test(value)) && !_.contains(value, "\\"));
	};

	/**
	 * Validates Characters like ?
	 * @param value
	 * @returns {boolean}
	 */
	this.validateQuestionMarkCharacters = function(value) {
		if (_.contains(value, "?")) {
			return false;
		}
		return true;
	};

	/**
	 * Validates if a given value has minimum characters allowed
	 * @param value
	 * @param minValue
	 * @returns {boolean}
	 */
	this.validateMinimumLength = function(value, minValue, exact) {
		if (exact) {
			return value.length >= Number(minValue);
		}
		return value.length > Number(minValue);
	};

	/**
	 * Validates if a given value is not exceeding maximum characters allowed
	 * @param value
	 * @param maxValue
	 * @returns {boolean}
	 */
	this.validateMaximumLength = function(value, maxValue, exact) {
		if (exact) {
			return value.length <= Number(maxValue);
		}
		return value.length < Number(maxValue);
	};

	/**
	 * Validates if given value is within a range string
	 * @param value
	 * @param rangeString - Given with minrange-maxrange format (Eg: 65-798)
	 * @returns {boolean}
	 */
	this.validateNumericRange = function(value, rangeString, delimiter) {
		if (delimiter == undefined) {
			delimiter = "-";
		}
		var validRange = rangeString.split(delimiter);
		//Check if all are numbers, else return false
		if ((isNaN(Number(value)) || isNaN(Number(validRange[0])) || isNaN(Number(validRange[1])))){
			return false;
		}
		//Check the range
		if (Number(value) < Number(validRange[0]) || Number(value) > Number(validRange[1])) {
			return false;
		}
		return true;
	};
	/**
	 * Validates a given VLAN
	 * @param value
	 * @returns {boolean}
	 */
	this.validateVlan = function(value) {
		var ranges = value.split(",");
		for ( i = 0; i < ranges.length; i++) {
			var vlanValues = ranges[i].split("-");
			if (vlanValues.length > 1) {

				var low = Number(vlanValues[0]);
				var high = Number(vlanValues[1]);

				//Check that both are integers
				if (isNaN(low) || isNaN(high) || parseInt(low, 10) != low || parseInt(high, 10) != high) {
					return false;
				}

				if (low >= high || low < 1 || high > 4094) {
					return false;
				}
			} else {
				var vlan = Number(vlanValues[0]);

				// Check if vlan is not an integer
				if (isNaN(vlan) || parseInt(vlan, 10) != vlan) {
					return false;
				}

				// Check if the vlan integer is a valid vlan
				if (vlan < 1 || vlan > 4094) {
					return false
				}
			}
		}

		// Return true if you don't see any validation anomaly
		return true;
	};

	/**
	 * Validates if given value is not a reserved VLAN
	 * @param value
	 * @returns {boolean}
	 */
	this.validateReservedVlan = function(value, reservedVlanList) {

		if(_.isUndefined(reservedVlanList)) {
			reservedVlanList = [1, 1002, 1003, 1004, 1005];
		}

		var ranges = value.split(",");
		for ( i = 0; i < ranges.length; i++) {

			var vlanValues = ranges[i].split("-");

			var vlanRange = [];
			/**
			 * if entered value is not the range then we have to push the entered value
			 * in the array.
			 */
			_.isUndefined(vlanValues[1]) ? vlanRange.push(Number(vlanValues[0])) : ( vlanRange = _.range(Number(vlanValues[0]), Number(vlanValues[1]) + 1))

			/**
			 * checking if the entered vlan falls under the default reserved
			 * vlans in the device.
			 */
			if (!_.isEmpty(_.intersection(vlanRange, reservedVlanList))) {
				return false;
			};
		}
		return true;
	};

	/**
	 * Validates if given value is within a range string
	 * @param value
	 * @param rangeString - Given with minrange-maxrange format (Eg: 65-798)
	 * @returns {boolean}
	 */
	this.validateNumericRangewithZero = function(value, rangeString, delimiter) {
		if (delimiter == undefined) {
			delimiter = "-";
		}
		var validRange = rangeString.split(delimiter);
		//Check if all are numbers, else return false
		if ((isNaN(Number(value)) || isNaN(Number(validRange[0])) || isNaN(Number(validRange[1]))))
			return false;
		//Check the range
		if (Number(value) < Number(validRange[0]) || Number(value) > Number(validRange[1])) {
			return false;
		}
		if (value == ""){
			return false;
		}

		return true;
	};
	/**
	 * Validation to be used if the data expected from a textbox, refers to a vlan not a range.
	 * @param value
	 * @returns {boolean}
	 */
	this.validateSingleVlan = function(value) {
		return !isNaN(Number(value));
	};

	/**
	 * Validates if given name is a valid domain name
	 * @param value
	 * @returns {boolean}
	 */
	this.validateDomainName = function(value) {
		if (_.indexOf(value, '.') < 0){
			return false;
		}
		return true;
	};

	/**
	 * Validates if given port is a HTTP allowed port
	 * @param value
	 * @returns {boolean}
	 */
	this.validateHTTPPort = function(value) {
		if (value == 80) {
			return true;
		} else {
			return value <= 80 && value >= 1025;
		}
	};

	/**
	 * Validates if a given port is HTTPS allowed port
	 * @param value
	 * @returns {boolean}
	 */
	this.validateHTTPSPort = function(value) {
		if (value == 443) {
			return true;
		} else {
			return value <= 443 && value >= 1025;
		}

	};

	/**
	 * Given any value and a regular expression string, tests the expression against the value
	 * @param value
	 * @param regString - A regular expression String
	 * @returns {*|boolean}
	 */
	this.validateByRegularExpression = function(value, regString) {
		return regString.test(value);
	};

	/**
	 * Given a value, max char and min char allowed, tests if the value is within the range
	 * @param value
	 * @param maxCharacters
	 * @param minCharacters
	 * @param exactFlag - This flag is used to indicate if range matching needs to be exact or not
	 * @returns {boolean}
	 */
	this.validateLength = function(value, maxCharacters, minCharacters, exactFlag) {
		if (exactFlag) {
			if (value.length <= maxCharacters && value.length >= minCharacters) {
				return true;
			}
		} else {
			if (value.length < maxCharacters && value.length > minCharacters) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Validates exact numeric range
	 * @param value
	 * @param range
	 * @returns {boolean}
	 */
	this.validateExactRange = function(value, range) {
		var validRange = range.split("-");
		//Check if all are numbers, else return false
		if (value == ''){
			return true;
		}
		if (isNaN(value)){
			return false;
		}

		if (isNaN(value) && isNaN(validRange[0]) && isNaN(validRange[1])){
			return false;
		}
		//Check the range
		return !(Number(value) < Number(validRange[0]) || Number(value) >= Number(validRange[1]));
	};

	/**
	 * Validates duplicate value
	 * @param data
	 * @param compareValue
	 * @param  compareParamName
	 * @returns {boolean}
	 */
	this.isDuplicateObject = function(data, compareValue, compareParamName) {
		var duplicateValue = true;
		_.find(data, function(data) {
			if (data[compareParamName] === compareValue) {
				duplicateValue = false;
			}
		});
		return duplicateValue;
	};

	/**
	 * This function can be used to validate if the sum of a certain number of arguments exceeds a Max Sum.
	 * This function is a variable argument function, and the argument format should be the maxSum value,
	 * followed by the set of values on whom you want to run this validation.
	 * All the arguments are expected to be Integers (or strings that represent integers).
	 */
	this.validateSum = function() {

		// Validation needs atleast two arguments, maxSum and atleast 1 input value
		if (arguments.length < 2) {
			return false;
		}
		var maxSum = Number(arguments[0]);
		if (isNaN(maxSum)) {
			return false;
		}

		var curSum = 0,
		    curValue = 0;
		for (var i = 1; i < arguments.length; i++) {
			curValue = Number(arguments[i]);
			if (isNaN(curValue)) {
				return false;
			}
			curSum += curValue;
		}

		return curSum <= maxSum;
	};

	/**
	 * Validates if given value is a number or not
	 * @param value
	 * @returns {boolean}
	 */
	this.validateNumber = function(value) {
		if (_.isNaN(new Number(value))) {
			return false;
		}
		return true;
	};

	/**
	 *Validates a given hostname
	 * @param hostname
	 * @returns {boolean}
	 *                     */
	this.validateHostname = function(hostname) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof hostname == 'string') {
			testString = hostname;
		} else {
			testString = hostname.val();
		}
		//Hostname RFC 1123
		if (new RegExp("^\s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*\.?)\s*$").test(testString)) {

			return true;
		};

		return false;
	};

	/**
	 * Validates if given value is a multicat IP or not
	 * @param value
	 * @returns {boolean}
	 */
	this.multicastvalidation = function(ip) {
		var value;

		if ( typeof ip == 'string') {
			value = ip;
		} else {
			value = ip.val();
		}
		var pattern = new RegExp("(^(22[4-9]|23[0-9]))(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}$");
		return pattern.test(value);
	};

	// Write further methods here.
	this.addValidator = function(validator, stepNumber) {
		this.validators[stepNumber - 1] = validator;
	};

	this.getValidator = function(stepNumber) {
		return this.validators[stepNumber];
	};

	// getter and setter methods to find wireless possible or not.
	this.setWirelessPossible = function(_bool) {
		this.wirelessPossible = _bool;
	};

	this.getWirelessPossible = function() {
		return this.wirelessPossible;
	};

	/**
	 * Validates ip and mask combination.
	 * The ip should not be same as network ip or the broadcast ip of the subnet created by the ip-mask combination.
	 * @param ip
	 * @param mask
	 * @returns {boolean}
	 */
	this.validateIpWithSubnetMask = function(ip, mask) {
		ip = ip.split(".");
		ip = [Number(ip[0]), Number(ip[1]), Number(ip[2]), Number(ip[3])];

		mask = mask.split(".");
		mask = [Number(mask[0]), Number(mask[1]), Number(mask[2]), Number(mask[3])];

		var networkIp = [];
		var broadcastIp = [];

		//Calculate Network IP and Broadcast IP
		for (var index = 0; index < 4; index++) {
			networkIp[index] = ip[index] & mask[index];
			broadcastIp[index] = networkIp[index] + 255 - mask[index];
		}

		ip = ip.join();
		networkIp = networkIp.join();
		broadcastIp = broadcastIp.join();
		if (ip === networkIp || ip === broadcastIp) {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * Validates a given Hexadecimal
	 * @param hexadecimal
	 * @returns {boolean}
	 */
	this.validateHexaDecimalChars = function(hexadecimal) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof hexadecimal == 'string') {
			testString = hexadecimal;
		} else {
			testString = hexadecimal.val();
		}

		if (/^[0-9a-f]+$/i.test(testString) || testString == '') {
			return true;
		};
		return false;
	};

	/**
	 * Validation for not allowing special characters like <> &
	 * which makes the nginx to treat the value as XMLTAG
	 */
	this.validateInvalidTags = function(inputValues) {
		var val = inputValues;
		if (_.contains(val, "?") || _.contains(val, "<") || _.contains(val, ">") || _.contains(val, "&")) {
			return false;
		}
		return true;
	};

	/**
	 * This method returns   MAC Address in proper format
	 */

	this.getMACAddress = function(macArray) {
		var macArrayList = [];
		if (macArray.get_length() === 6) {
			for (var i = 0; i < 6; i++) {
				macArrayList.push(("0" + (macArray.get_value(i).get_value().toString(16))).slice(-2));
			}
		}
		return macArrayList
	};

	/**
	 * This method returns time from Hexa to Loca Time
	 */

	this.hexDateConvert = function(value) {
		var dt = new Date();
		dt.setTime(parseInt(value, 16) * 1000);
		dateValue = dt.toLocaleString();
		return dateValue;
	};

	this.rmBtnDisableIE10 = function(inputButtonID, inputScopeValue) {

		if (inputButtonID != "") {
			$(inputButtonID).addClass('k-state-disabled');
			if (inputScopeValue == false) {
				$(inputButtonID).removeClass('k-state-disabled');
			}
		}

	};

    /**
     * Validates a given Email Address
     * @param emailtext
     * @returns {boolean}
     */
    this.validateEmailAddress = function(emailAddress) {
        //Write the validation code here
        // return true or false boolean based on validation
        var testString;

        if ( typeof emailAddress == 'string') {
            testString = emailAddress;
        } else {
            return false;
        }

        if (new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i).test(testString)) {
            return true;
        };

        if(emailAddress == ""){
            return true;
        }

        return false;
    };
    /**
     * Validates a given Phone Number
     * @param emailtext
     * @returns {boolean}
     */
    this.validatePhoneNumber = function(phoneNumber) {
        //Write the validation code here
        // return true or false boolean based on validation
        var testString;

        if ( typeof phoneNumber == 'string') {
            testString = phoneNumber;
        } else {
            return false;
        }
        if(phoneNumber == ""){
            return true;
        }

        if(phoneNumber.length < 12 || phoneNumber.length > 17){
            return false;
        }

        if (new RegExp(/^[0-9+ ]*$/).test(testString)) {
            return true;
        };




        return false;
    };

    /**
     * Validates a given URL
     * @param emailtext
     * @returns {boolean}
     */
    this.validateHttpUrl = function(url) {
        //Write the validation code here
        // return true or false boolean based on validation
        var testString;

        if ( typeof url == 'string') {
            testString = url;
        } else {
            return false;
        }

        if (new RegExp(/^(http|https):\/\/[^ "]+$/).test(testString)) {
            return true;
        };

        if(url == ""){
            return true;
        }

        return false;
    };
	var urlToFeatureNameMap = {
		"/dayzero" : "DayZero",
		"/physicalInterface" : "Physical Interface",
		"/logicalInterface" : "Logical Interface",
		"/wlan" : "WLAN",
		"/wlanDashlet" : "WLAN Dashlet",
		"/dashboard" : "Dashboard",
		"/mobility" : "Wireless Mobility",
		"/ntp" : "NTP",
		"/http" : "HTTP(S)",
		"/dhcp" : "DHCP",
		"/stp" : "STP",
		"/userAdministration" : "User Administration",
		"/portUtilization" : "Port Utilization",
		"/snmp" : "SNMP",
		"/mdns" : "mDNS",
		"/multicast" : "Multicast",
		"/coredump" : "Coredump",
		"/rrm5g" : "RRM",
		"/rrm24g" : "RRM",
		"/interferers" : "Clean Air Statistics",
		"/clientControl" : "Clients",
		"/accessPoints" : "AP Statistics",
		"/qos" : "QOS",
		"/webAuth" : "Web Auth",
		"/localEAP" : "Local EAP",
		"/monitoringSecurity" : "Security",
		"/mobilityMonitoring" : "Mobility Monitoring",
		"/mDNSMonitoring" : "mDNS Monitoring",
		"/localProfiling" : "Local Profiling",
		"/commands" : "Commands",
		"/softwareActivation" : "Software Activation",
		"/rogues" : "Rogues",
		"/fqdn" : "FQDN",
		"/managementUtilization" : "Management Utilization",
		"/aaa" : "AAA",
		"/system" : "System",
		"/redundancy" : "Redundancy",
		"/cdp" : "CDP",
		"/avc" : "AVC",
		"/ports" : "Ports",
		"/statistics" : "Statistics",
		"/parameters" : "Parameters",
		"/parameters24g" : "Parameters",
		"/roguePolicies" : "Wireless Protection Policies",
		"/cleanAirConfig5g" : "Clean Air",
		"/cleanAirConfig24g" : "Clean Air",
		"/localPolicies" : "Local Policies",
		"/highT" : "High Throughput",
		"/highT24" : "High Throughput",
		"/network" : "Network",
		"/network24" : "Network",
		"/rrmMediaParams5g" : "Media Parameters",
		"/rrmMediaParams24g" : "Media Parameters",
		"/mediaStream" : "Media Stream",
		"/ap" : "Access Points",
		"/telnet" : "Configure CLI",
		"/acl" : "ACL",
		"/clientDeviceTypes" : "Client Device Types",
		"/clientsAP" : "Clients AP",
		"/cpuUtilization" : "CPU Utilization",
		"/memoryUtilization" : "Memory Utilization",
		"/apcrash" : "Ap Crash",
		"/controllercrash" : "Controller Crash",
		"/logs" : "Logs",
		"/loadBalance" : "Wireless Advanced",
		"/general" : "General",
		"/vlan" : "Vlan",
		"/wirelessInterface" : "Wireless Interface",
		"/rf" : "RF Profiles",
        "/callHome":"Smart Call Home",
		"/atfMode":"Airtime Fairness",
        "/atfPolicy":"Airtime Fairness Policy",
        "/atfStatistics":"ATF Statistics",
		"/staticRouting": "Static Routing",
		"/nat": "Static NAT",
		"/diagnostic": "Diagnostic Log",
		"/apGroups":"AP Groups",
		"/eigrp": "Eigrp",
		"/raTrace": "MAC Filtering",
		"/localTime": "Local Time"
	};

	var getTitle = function() {
		var location = $location.url();
		var featureName = urlToFeatureNameMap[location];
		return featureName;
	};

	// Takes the tdl response object as argument, constructs the toasterMessage based on the error message if any and returns the same
	var constructTdlMessage = function(response,title_def) {
		var	title1;
		if(title_def === undefined){
			title1 = getTitle();
		}else{
		    title1 = title_def;
		}
		var toasterMessage = {
			"isSuccessful" : true,
			"message" : {
				"title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
				"message" : title1 + " changes was successfully applied"
			}
		};

		var errorTitle = "<i class='fa fa-times toasterStatus'></i><h4 class='error'>Error in Configuring " + title1 + "</h4>";
		var errorMessage = "";
		_.forEach(response, function(responseItem) {
			if (responseItem.error_message) {
				toasterMessage.isSuccessful = false;
				toasterMessage.message.title = errorTitle;
				errorMessage = errorMessage + "\<div\>" + responseItem.error_message + "\</div\>";
				toasterMessage.message.message = errorMessage;
			}
		});

		return toasterMessage;
	};

	// Takes the wsma response object as argument, constructs the toasterMessage based on the error message if any and returns the same
	var constructWsmaMessage = function(response,title_def) {
		var	title2;
		if(title_def === undefined){
			title2 = getTitle();
		}else{
		    title2 = title_def;
		}
		var toasterMessage = {
			"isSuccessful" : true,
			"message" : {
				"title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
				"message" : title2 + " Data was successfully applied"
			}
		};
		var errorTitle = "<i class='fa fa-times toasterStatus'></i><h4 class='error'>Error in Configuring " + title2 + "</h4>";
		if (response.status == 500) {
			toasterMessage.isSuccessful = false;
			toasterMessage.message.title = errorTitle;
			toasterMessage.message.message = "An Internal error has occured";
		} else {
			var responseData = "";
			if (response.data) {
				responseData = response.data
			} else if (response && response.length > 0) {
				responseData = response;
			}
			var toasterMessage = {
				"isSuccessful" : true,
				"message" : {
					"title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
					"message" : title2 + " Data was successfully applied"
				}
			};

			var errorMessage = "";
			_.forEach(responseData, function(responseItem) {
				if (responseItem.status && responseItem.status != "success") {
					if (responseItem.errorText) {
						toasterMessage.isSuccessful = false;
						toasterMessage.message.title = errorTitle;
						errorMessage = errorMessage + "\<div\>" + responseItem.errorText + "\</div\>";
						toasterMessage.message.message = errorMessage;
					}

				}
			});
		}
		return toasterMessage;
	};

	/**
	 * displays success/error messages through kendo notifications
	 * @param response
	 * @param type - to distinguish between TDL and WSMA response objects
	 */
	this.showToasterMessage = function(response, type, title) {
		var message;
		if (type === this.TDL_MESSAGE) {
			message = constructTdlMessage(response,title);
		} else if (type === this.WSMA_MESSAGE) {
			message = constructWsmaMessage(response,title);
		} else {
			return;
		}
		$rootScope.$broadcast("toaster:configurationSuccessErrorMessage", message);
		return message.isSuccessful;
	};

	/**
	 * displays error validation messages through kendo notifications
	 * @param errorMessage
	 */
	this.showValidationToasterMessage = function(errorMessage) {
		var toasterMessage = {
			"isSuccessful" : false,
			"message" : {
				"title" : "<i class='fa fa-times toasterStatus'></i><h4>Validation Error" + title + "</h4>",
				"message" : ""
			}
		};
		toasterMessage.message.message = errorMessage;
		$rootScope.$broadcast("toaster:configurationSuccessErrorMessage", toasterMessage);
	};

});


var callbackCall,
    closeDialog;
app.service("dialogService", function($rootScope) {
	this.dialog = function(dialogObj) {
		/*
		 * dialogObj = {
		 * 		width: '500px',
		 * 		modal: true,
		 *		id: "windowFromConfig",
		 * 		onClose: function(){alert('test')},
		 * 		title: 'Confirm',
		 * 		content: 'Testing Testing',
		 * 		messageType: "warning" // info, confirm, warning, error
		 * 		actionButtons:[
		 * 			{text:"OK", callback:"callbackevent"}}
		 * 		]
		 * }
		 */
		var windw = angular.element("<div class='dialog'></div>"),
		    buttons = "",
		    onClose = function() {
			setTimeout(function() {
				windw.data("kendoWindow").destroy();
			}, 500);
		};

		callbackCall = function(callback) {
			if (callback == "undefined") {
				closeDialog();
			} else {
				$rootScope.$broadcast(callback, {
					data : callback
				});
			}
		};

		closeDialog = function() {
			windw.data("kendoWindow").close();
		};
		windw.kendoWindow({
			width : dialogObj.width || "500px",
			modal : dialogObj.modal || true,
			resizable: dialogObj.resizable || false,
			title : dialogObj.title || "Confirm",
			actions : ["Close"],
			close : dialogObj.onClose || onClose
		});
		var content = '<div class="windowContent ' + (dialogObj.messageType || "info") + '">' + (dialogObj.content || '') + '</div>',
		    actionButtonContainer = '<div class="windowButtonContainer ' + (dialogObj.messageType || "info") + '">';
		if (dialogObj.actionButtons) {
			angular.forEach(dialogObj.actionButtons, function(obj, index) {
				if(dialogObj.messageType && dialogObj.messageType.toUpperCase() == "CONFIRM" && index == 1){
					actionButtonContainer += "<button class='btn btn-primary k-button pull-left" + (obj.btnClass || '') + "' type='button' onclick='callbackCall(\"" + obj.callback + "\")' >" + obj.text + "</button>";
				} else {
					actionButtonContainer += "<button class='btn btn-primary k-button " + (obj.btnClass || '') + "' type='button' onclick='callbackCall(\"" + obj.callback + "\")' >" + obj.text + "</button>";
				}
			});
		}
		actionButtonContainer += "</div>";
		windw.data("kendoWindow").content(content + actionButtonContainer);
		if(dialogObj.id){
			windw.data("kendoWindow").wrapper.attr("id", dialogObj.id);
		}
		windw.data("kendoWindow").wrapper.addClass("customDialog");
		windw.data("kendoWindow").center().open();
		return windw;
	};
});



