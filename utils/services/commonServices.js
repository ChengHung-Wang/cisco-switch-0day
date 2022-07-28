/**
     * Contains all the common services.
     * This has 'validationService', "dialogService", 'onlineHelpService', 'httpEndPointService'
     * gridCrudService services
     */

/**
     Description: Validation service containing all validation API.
     Copyright (c) 2016 by Cisco Systems, Inc.
     All rights reserved.
     */
app.service('validationService', function($rootScope, $location) {
	this.validators = [];
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
                    if (!_.isNumber(Number(octets[index]))) {
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
        if (value.indexOf(" ") != -1 || value.indexOf("?") != -1) {
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
    //validating empty string
    this.validateEmptyString = function (value) {
        if (value.length < 1) {
            return false;
        }
        return true;
    };
    //validate string check
    this.validateCheck = function(input) {
        if (!input.data('checkMsg')) {
            return true;
        }
        var val = input.val();
        if (val.indexOf('?') > -1) {
            return false;
        }
        return true;
    };
    //validate ranges
    this.validateRange =  function (input) {
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
    };
    //validating given ip address
    this.validateIPAddress = function(value){
        var valMsg = value.data('validateipMsg');
        var ipAddress = value.val();
        if ((valMsg == undefined)) {
            return true;
        }
        else if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {
            return true;
        }
        else if (ipAddress == "0.0.0.0" || '') {
            return false;
        }
        return false;
    };
    //validating character space
    this.validateDataSpace = function (value) {
        var valMsg = value.data('dataspaceMsg');
        if ((valMsg == undefined)) {
            return true;
        }
        else if ((value.val()).trim() == '') {
            return false;
        }
        return true;
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

        if (_.isUndefined(reservedVlanList)) {
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
        if ((isNaN(Number(value)) || isNaN(Number(validRange[0])) || isNaN(Number(validRange[1])))){
            return false;
		}
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
            networkIp[index] = ip[index] && mask[index];
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
        if (val.indexOf('?') > -1 || val.indexOf('<') > -1 || val.indexOf('>') > -1 || val.indexOf('&') > -1) {
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
            if (!inputScopeValue) {
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

        if (emailAddress == ""){
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
        if (phoneNumber == ""){
            return true;
        }

        if (phoneNumber.length < 12 || phoneNumber.length > 17){
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

        if (url == ""){
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
        "/callHome" : "Smart Call Home",
        "/atfMode" : "Airtime Fairness",
        "/atfPolicy" : "Airtime Fairness Policy",
        "/atfStatistics" : "ATF Statistics",
        "/staticRouting" : "Static Routing",
        "/diagnostic" : "Diagnostic Log",
        "/apGroups" : "AP Groups"
    };

    var getTitle = function() {
        var location = $location.url();
        var featureName = urlToFeatureNameMap[location];
        return featureName;
    };

    // Takes the tdl response object as argument, constructs the toasterMessage based on the error message if any and returns the same
    var constructTdlMessage = function(response, title_def) {
        var title;
        if (title_def === undefined) {
            title = getTitle();
        } else {
            title = title_def;
        }
        var toasterMessage = {
            "isSuccessful" : true,
            "message" : {
                "title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
                "message" : title + " changes was successfully applied"
            }
        };

        var errorTitle = "<i class='fa fa-times toasterStatus'></i><h4 class='error'>Error in Configuring " + title + "</h4>";
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
    var constructWsmaMessage = function(response, title_def) {
        var cTitle;
        if (title_def === undefined) {
            cTitle = getTitle();
        } else {
            cTitle = title_def;
        }
        var toasterMessage;
        toasterMessage = {
            "isSuccessful" : true,
            "message" : {
                "title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
                "message" : cTitle + " Data was successfully applied"
            }
        };
        var errorTitle = "<i class='fa fa-times toasterStatus'></i><h4 class='error'>Error in Configuring " + cTitle + "</h4>";
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
            toasterMessage = {
                "isSuccessful" : true,
                "message" : {
                    "title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
                    "message" : cTitle + " Data was successfully applied"
                }
            };

            var errorMessage = "";
            _.forEach(responseData, function(responseItem) {
                if (responseItem.status && responseItem.status != "success" && responseItem.errorText) {
                    toasterMessage.isSuccessful = false;
                    toasterMessage.message.title = errorTitle;
                    errorMessage = errorMessage + "\<div\>" + responseItem.errorText + "\</div\>";
                    toasterMessage.message.message = errorMessage;
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
            message = constructTdlMessage(response, title);
        } else if (type === this.WSMA_MESSAGE) {
            message = constructWsmaMessage(response, title);
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

/**
     Description: common dialog service used for information, error, confirm.
     Copyright (c) 2016 by Cisco Systems, Inc.
     All rights reserved.
     */
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
            resizable : dialogObj.resizable || false,
            title : dialogObj.title || "Confirm",
            actions : ["Close"],
            close : dialogObj.onClose || onClose
        });
        var content = '<div class="windowContent ' + (dialogObj.messageType || "info") + '">' + (dialogObj.content || '') + '</div>',
            actionButtonContainer = '<div class="windowButtonContainer ' + (dialogObj.messageType || "info") + '">';
        if (dialogObj.actionButtons) {
            angular.forEach(dialogObj.actionButtons, function(obj, index) {
                if (dialogObj.messageType && dialogObj.messageType.toUpperCase() == "CONFIRM" && index == 1) {
                    actionButtonContainer += "<button class='btn btn-primary k-button pull-left" + (obj.btnClass || '') + "' type='button' onclick='callbackCall(\"" + obj.callback + "\")' >" + obj.text + "</button>";
                } else {
                    actionButtonContainer += "<button class='btn btn-primary k-button " + (obj.btnClass || '') + "' type='button' onclick='callbackCall(\"" + obj.callback + "\")' >" + obj.text + "</button>";
                }

            });
        }
        actionButtonContainer += "</div>";
        windw.data("kendoWindow").content(content + actionButtonContainer);
        if (dialogObj.id) {
            windw.data("kendoWindow").wrapper.attr("id", dialogObj.id);
        }
        windw.data("kendoWindow").wrapper.addClass("customDialog");
        windw.data("kendoWindow").center().open();
        return windw;
    };

    this.sysInfoDialog = function(dialogObj){
        var windw = angular.element("<div class='dialog'></div>"),
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
            resizable : dialogObj.resizable || false,
            title : dialogObj.title || "Confirm",
            actions : ["Close"],
            close : dialogObj.onClose || onClose
        });
        var nameArray = dialogObj.content.split('\n');
        var content = "";
        for (i = 0; i < nameArray.length; i++) {
            content += '<div style="font-size:17px;text-align:center">' + (nameArray[i] || '') + '</div>';
        }
        content+='<br><br>';
        var copyRightArray = dialogObj.copyRight.split('\n');
        for (i = 0; i < copyRightArray.length; i++) {
            content += '<div style="font-size:14px;text-align:center">' + (copyRightArray[i] || '') + '</div>';
        }

        var actionButtonContainer = '<div class="windowButtonContainer ' + (dialogObj.messageType || "info") + '">';
        if (dialogObj.actionButtons) {
            angular.forEach(dialogObj.actionButtons, function(obj, index) {
                if (dialogObj.messageType && dialogObj.messageType.toUpperCase() == "CONFIRM" && index == 1) {
                    actionButtonContainer += "<button class='btn btn-primary k-button pull-left" + (obj.btnClass || '') + "' type='button' onclick='callbackCall(\"" + obj.callback + "\")' >" + obj.text + "</button>";
                } else {
                    actionButtonContainer += "<button class='btn btn-primary k-button " + (obj.btnClass || '') + "' type='button' onclick='callbackCall(\"" + obj.callback + "\")' >" + obj.text + "</button>";
                }

            });
        }
        actionButtonContainer += "</div>";
        windw.data("kendoWindow").content(content + actionButtonContainer);
        if (dialogObj.id) {
            windw.data("kendoWindow").wrapper.attr("id", dialogObj.id);
        }
        windw.data("kendoWindow").wrapper.addClass("customDialog");
        windw.data("kendoWindow").center().open();
        return windw;


    };
});

/**
     Description: Online Help service for opening help window when user clicks on help icon.
     Copyright (c) 2015-2016 by Cisco Systems, Inc.
     All rights reserved.
     */
var openPage;
app.service('onlineHelpService', ['httpEndPointService', '$rootScope', 'dialogService','$location', function(httpEndPointService, $rootScope, dialogService, $location) {

    var pageMapping = {
        "/dashboard": "r_mon_dashboard.htm",
        "/portsMonitor": "r_mon_ports.htm",
        "/switch": "t_config_switch.htm",
        "/clients": "r_mon_clients.htm",
        "/portsConf": "t_config_ports.htm",
        "/troubleShoot": "t_config_trblshootng.htm",
        "/vlan": "t_config_vlan_config.htm",
        "/netflow": "t_serv_netflow.htm",
        "/staticRouting": "t_config_static_route.htm",
        "/management": "t_gen_set_mgmt_https.htm",
        "/softwareUpdate": "t_gen_set_software_upgrade.htm",
        "/system": "t_gen_set_ntp.htm",
        "/userAdministration": "t_gen_set_user_admin.htm"
    };

    var openedChild;
    var winFeatures = "width=1000,height=700,location=0,centerscreen=yes,resizable=yes,scrollbars=yes";
    this.openOnlineHelpWindow = function() {
        var currentPage = $location.url();
        var urlToOpen = properties.helpPageUrl + "Default.htm";
        if (pageMapping[currentPage]) {
            urlToOpen += "#Topics/" + pageMapping[currentPage];
        }
        openedChild = window.open(urlToOpen, 'pretzelhelpwindow', winFeatures);
    };

    this.openSideHelpWindow = function() {
        if(angular.element("body").hasClass("inlineHelp")){
            return false;
        }
        var currentPage = $location.url();
        var urlToOpen = properties.helpPageUrl + "Content/Topics/";
        if (pageMapping[currentPage]) {
            urlToOpen += pageMapping[currentPage];
        } else {
            urlToOpen = properties.helpPageUrl + "Default.htm";
        }
        angular.element("#inlineHelp").attr("src", urlToOpen);
        angular.element("body").addClass("inlineHelp");
    };

    this.openExternalHelpWindow = function(helpPageUrl){
        openedChild = window.open(helpPageUrl, 'polarishelpwindow', winFeatures);
    };

    this.setBrowserTitle = function(currentPage, platform, desc) {
        var browTitle = "";
        if (currentPage == "/telnet") {
            browTitle = "Configure CLI";
        } else {
            browTitle = angular.element(".megamenu-menu-title a", angular.element(".submenuTitle.selectedSubmenu").parents(".megamenu-menu")).text() + " - " + angular.element(".submenuTitle.selectedSubmenu a").text();
        }

        // $rootScope.hostName is set in megaMenuCtrl.js file and generalController.js file.
        if(platform.indexOf("S6650L") != -1 || platform.indexOf("S5960") != -1){
        	document.title = properties.productNameInspur + ":: " + $rootScope.hostName + ":: Inspur " + platform + " " + desc + " - " + browTitle;
        }else{
        	document.title = properties.productName + ":: " + $rootScope.hostName + ":: Cisco " + platform + " " + desc + " - " + browTitle;
        }
    };

    var dlg,
        pageToMove;
    $rootScope.$on("okClicked_goToPage", function() {
        for (key in pageMapping) {
            if (pageToMove.indexOf(pageMapping[key]) >= 0) {
                break;
            }
        };
        if (dlg) {
            location.hash = "#" + key;
            dlg.data("kendoWindow").close();
        }
    });

    openPage = function(pageUrl) {
        pageToMove = pageUrl.substr(pageUrl.lastIndexOf("/") + 1);
        openedChild.close();
        dlg = dialogService.dialog({
            content : 'The changes in the page may be lost. Are you sure you want to move?',
            title : "Logout",
            messageType : "confirm",
            actionButtons : [{
                text : "OK",
                callback : "okClicked_goToPage"
            }, {
                text : "Cancel"
            }]
        });
    };
}]);

/**
     Description: Device info service
              Update the device info in rootScope
    */

app.service('deviceInfoService', ['requestRoutingService', '$rootScope','$filter',
                                  function(requestRoutingService, $rootScope,$filter) {
	var translate = $filter("translate");
                                      this.setDeviceInfo = function(){
                                          var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
                                          var numPorts = 0;
                                          var poeCapable = false;
                                          var upoeCapable = false;
                                          if(versionInfo.ShowVersion.name.indexOf("CDB-") != -1){
                                              numPorts = versionInfo.ShowVersion.name.split('-')[1].substr(0,2).match(/[0-9]+/g)[0];
                                              poeCapable = true;
                                              upoeCapable = (versionInfo.ShowVersion.name.split('-')[1].indexOf('U') != -1);
                                          } else if(versionInfo.ShowVersion.name.indexOf("S6650L") != -1 || versionInfo.ShowVersion.name.indexOf("S5960") != -1){                                              
                                              numPorts = versionInfo.ShowVersion.name.split('-')[1].substr(0,2).match(/[0-9]+/g)[0];
                                              poeCapable = (versionInfo.ShowVersion.name.split('-')[1].indexOf('P') != -1);
                                              upoeCapable = (versionInfo.ShowVersion.name.split('-')[1].indexOf('U') != -1);
                                          } else if(versionInfo.ShowVersion.name.indexOf("C1000") != -1){                                              
                                              numPorts = versionInfo.ShowVersion.name.split('-')[1].substr(0,2).match(/[0-9]+/g)[0];
                                              poeCapable = (versionInfo.ShowVersion.name.split('-')[1].indexOf('P') != -1);
                                              upoeCapable = (versionInfo.ShowVersion.name.split('-')[1].indexOf('U') != -1);
                                          } else {
                                              if(versionInfo.ShowVersion.name.indexOf("C2960+") != -1){
                                                  versionInfo.ShowVersion.name = versionInfo.ShowVersion.name.replace("+","+-");
                                              }
                                              if(versionInfo.ShowVersion.name.indexOf("SM")!=-1){
                                            	  numPorts = versionInfo.ShowVersion.name.split('-')[3].substr(0,2).match(/[0-9]+/g)[0];
                                            	  poeCapable = (versionInfo.ShowVersion.name.split('-')[3].indexOf('P') != -1);
                                                  upoeCapable = (versionInfo.ShowVersion.name.split('-')[3].indexOf('U') != -1);
                                              }else{                                            	 
                                            	  numPorts    = versionInfo.ShowVersion.name.split('-')[2].substr(0,2).match(/[0-9]+/g)[0];
                                            	  poeCapable  = (versionInfo.ShowVersion.name.split('-')[2].indexOf('P') != -1);
                                                  upoeCapable = (versionInfo.ShowVersion.name.split('-')[2].indexOf('U') != -1);
                                              }                                             
                                              
                                          }
                                          var stackSupport =versionInfo.ShowVersion.name.indexOf('C2960X') != -1 ;
                                          if(versionInfo.ShowVersion.name.indexOf("S5960") != -1 && versionInfo.ShowVersion.name.indexOf("S5960L") == -1){
                                        	  stackSupport = versionInfo.ShowVersion.name.indexOf('S5960') != -1;
                                          }
                                          if(stackSupport && (versionInfo.ShowVersion.name == "WS-C2960X-24PSQ-L" ||
                                                              versionInfo.ShowVersion.name == "WS-C2960X-48TS-LL" ||
                                                              versionInfo.ShowVersion.name == "WS-C2960X-24TS-LL" )){
                                              stackSupport = false;
                                          }
                                          //H-Stack Status
                                          if((versionInfo.ShowVersion.name.indexOf("C1000")!=-1 && versionInfo.ShowVersion.name.indexOf("C1000SM")==-1 && versionInfo.ShowVersion.name.indexOf("C1000FE") == -1)){
                                        	  stackSupport=true;
                                  		  }
                            
               /*For the sake of clarity:
                *      2960X and 2960XR support stacking
                *      All switches support clustering
                *      STANDALONE -> No cluster running, and no stack present
                *      STACK -> Physical stack
                *      CLUSTER -> Virtual stack
                */
                                          var stackInfo = {};
                                          var clusterInfo = {};
                                          var stackingInfo = {};
                                          stackingInfo.members=[];
                                          stackingInfo.totalMembers = 1;
                                          stackingInfo.type = translate("stack_standalone_caps");

                                          function check_cluster_enabled(){
                                        	  if(versionInfo.ShowVersion.name.indexOf("C2960L")!=-1){
                                        	 //no cluster support  
                                        	  }else{
                                        	  //Hiding cluster details as no cluster support for all devices since CCP 1.6 release , will be enabled if required in future
                                        		  
                                        		 /* clusterInfo = requestRoutingService.getShowCmdOutput("show cluster","showCluster");
                                                  //Check if cluster is not enabled, only then consider it as standalone
                                                  if (clusterInfo.ClusterDetails.data == "") {
                                                      //No cluster
                                                  } else {
                                                      var clusterMemberDeviceTypeInfo = requestRoutingService.getShowCmdOutput("show cluster members detail", "showClusterMembersDeviceType");
                                                      var memberInfo = requestRoutingService.getShowCmdOutput("show cluster member", "showClusterMembers");
                                                      if (clusterInfo.ClusterDetails.data.totalMembers > 1) {
                                                          for (var i in clusterMemberDeviceTypeInfo.ShowClusterMember.data) {
                                                              stackingInfo.members[i] = {};
                                                              stackingInfo.members[i].deviceType = clusterMemberDeviceTypeInfo.ShowClusterMember.data[i].deviceType;
                                                              stackingInfo.members[i].state = memberInfo.ShowClusterMember.MemberTable.entry[i].state;
                                                              stackingInfo.members[i].sn =  memberInfo.ShowClusterMember.MemberTable.entry[i].snValue;
                                                          }
                                                      } else if (clusterInfo.ClusterDetails.data.totalMembers == 1) {
                                                          stackingInfo.members[0] = {};
                                                          stackingInfo.members[0].deviceType = clusterMemberDeviceTypeInfo.ShowClusterMember.data.deviceType;
                                                          stackingInfo.members[0].state = memberInfo.ShowClusterMember.MemberTable.entry.state;
                                                          stackingInfo.members[0].sn =  memberInfo.ShowClusterMember.MemberTable.entry.snValue;
                                                      }
                                                      var domainName = clusterInfo.ClusterDetails.data.domainName.replace(/['"]+/g, '');
                                                      var noOfMembers = clusterInfo.ClusterDetails.data.totalMembers;
                                                      stackingInfo.type = "CLUSTER";
                                                      stackingInfo.domainName = domainName;
                                                      stackingInfo.totalMembers = noOfMembers;
                                                      if (typeof stackingInfo.totalMembers == "undefined") {
                                                          stackingInfo.totalMembers = 1;
                                                      }
                                                  }*/
                                        	  }                                              
                                          };
                                          var masterId = 1;
                                          if(versionInfo.ShowVersion.name == "WS-C3560CX-12PD-S" || versionInfo.ShowVersion.name == "WS-C3560CX-8XPD-S"){
                                              masterId = deviceCommunicator.getExecCmdOutput("show switch | i Master ").split(" ")[0].replace("*","");
                                          }
                                          if(stackSupport){
                                              //Check if its a stack
                                              //Check if stack port is shut down, only then consider it as standalone
                                              var id = deviceCommunicator.getExecCmdOutput("show switch | i Master ").split(" ")[0].replace("*","");
                                              masterId = id;
                                              stackInfo = requestRoutingService.getShowCmdOutput("show switch","showSwitch");
                                              if(Object.prototype.toString.call( stackInfo.Switch.SwitchStatus.entry ).toString().toLowerCase() === '[object object]'){
                                                  //Single entry
                                                  var portsDown = masterId+"DownDown";
                                                  //Check if stack ports are shut down
                                                  var portStatus = deviceCommunicator.getExecCmdOutput("show switch stack-ports");
                                                  if(portStatus.split("\n")[2].split(" ").toString().replace(new RegExp(",", 'g'),"") == portsDown){
                                                      //Both ports are down, its not a stack
                                                      //Check if its a cluster
                                                      check_cluster_enabled();
                                                  }else{
                                                      stackingInfo.type = "STACK";
                                                  }
                                              }else{
                                                  //Multiple switches present in a stack
                                                  var portsDown = masterId+"DownDown";
                                                  //Check if stack ports are shut down
                                                  var portStatus = deviceCommunicator.getExecCmdOutput("show switch stack-ports");
                                                  if(portStatus.split("\n")[2].split(" ").toString().replace(new RegExp(",", 'g'),"") == portsDown){
                                                      stackingInfo.type = translate("stack_standalone_caps");
                                                      check_cluster_enabled();
                                                  } else {
                                                      stackingInfo.type = "STACK";
                                                  }
                                              }
                                          } else {
                                              //Check if its a cluster
                                              check_cluster_enabled()
                                          }

                                          //Set the device information in root scope.
                                          $rootScope.deviceInfo = {
                                              type: versionInfo.ShowVersion.name,
                                              baseMacAdd: versionInfo.ShowVersion.baseMacAdd,
                                              version: versionInfo.ShowVersion.version,
                                              numberOfPorts: numPorts,
                                              isPoECapable: poeCapable,
                                              isUPoECapable: upoeCapable,
                                              isStackingSupported: stackSupport,
                                              isPhysicalStackSupported: stackSupport,
                                              masterId: masterId,
                                              clusterMembersCount: stackingInfo.totalMembers,
                                              clusterMembersInfo: stackingInfo.members,
                                              stackingInfo: stackingInfo
                                          };
                                      };
                                  }]);

/**
     Description: The service provides apis to send exec and config commands to the device.
     Copyright (c) 2015-2016 by Cisco Systems, Inc.
     All rights reserved.
     */
app.service('requestRoutingService',function(){
    this.useLocalData = runFromLocalhost;
    this.getShowCmdOutput = function (cliCmd,odmFileName){
        $.ajaxSetup({async: false});
        var usingODM = false;
        if(httpServerBasePath == ""){
            var httpPath = deviceCommunicator.getExecCmdOutput("show ip http server status | i HTTP server base path")
            if(httpPath.indexOf("flash:/") == -1){
                httpPath = httpPath.substr(29);
                httpPath = "flash:/" + httpPath;
            }else{
                httpPath = httpPath.substr(23);
            }
            httpServerBasePath = httpPath;
        }
        if(odmFileName !== null && odmFileName !== undefined){
            usingODM = true;
        }
        if(cliCmd === null || cliCmd == undefined){
            throw "null command exception";
        } else {
            var x2js = new X2JS();
            if(this.useLocalData){
                cliCmd = cliCmd.replace(' ','');
                if(usingODM){
                    cliCmd = cliCmd+odmFileName+".xml";
                } else {
                    cliCmd = cliCmd+".txt";
                }
                var result = $.get("resources/data/" + cliCmd);
                if(usingODM){
                    return x2js.xml_str2json(result.responseText);
                }
                return result;
            }else{
                if(usingODM){
                    cliCmd = cliCmd + " | format " + httpServerBasePath + "/odm/" + odmFileName + ".odm";
                }
                var sResult = deviceCommunicator.getExecCmdOutput(cliCmd);
                if(usingODM){
                    return x2js.xml_str2json(sResult);
                }
                return sResult;
            }
        }
    }

    /*Invoke the getConfigCmdOutput api from within a try catch block.
        The api returns an empty string in a success case.
        In case of failure, it will return an object with two parameters:
            errorCmd: the command that caused the error
            errorResponse: the error response message
        Handle the response as appropriate.
      */
    this.getConfigCmdOutput = function(cliCmd){
        $.ajaxSetup({async: false});
        var result = null;
        if(cliCmd === null || cliCmd === undefined){
            throw "null command exception";
        } else {
            try{
                result = deviceCommunicator.getConfigCmdOutput(cliCmd,false);
            }catch(exception){
                result = exception;
            }
        }
        return result;
    }

});


/**
     Description: HTTP service to Get/Send HTTP Calls to endpoints
     Copyright (c) 2016 by Cisco Systems, Inc.
     All rights reserved.
     */
app.service('httpEndPointService', function($http) {
    return {
        httpGet : function(url, parameters, localDataFileName) {
            if (url === undefined) {
                return;
            }
            if (runFromLocalhost && localDataFileName) {
                url = "../../resources/data/" + localDataFileName;
            }

            if (parameters != undefined || parameters != "") {
                angular.element("body").addClass("busy");
                return $http.get(url, {
                    params : {
                        "parameters" : parameters
                    }

                }).success(function(data) {
                    angular.element("body").removeClass("busy");
                    return angular.fromJson(data);
                }).error(function() {
                    angular.element("body").removeClass("busy");
                });
            } else {
                angular.element("body").addClass("busy");
                return $http.get(url).success(function(data) {
                    angular.element("body").removeClass("busy");
                    return angular.fromJson(data);
                }).error(function() {
                    angular.element("body").removeClass("busy");
                });
            }
        },

        httpPost : function(url, postData) {
            if (url === undefined) {
                return;
            }
            angular.element("body").addClass("busy");
            return $http.post(url, angular.toJson(postData)).success(function(data) {
                angular.element("body").removeClass("busy");
                return escape(data);
            }).error(function() {
                angular.element("body").removeClass("busy");
            });
        },

        httpGeneral : function(reqObject) {
            /*
                 reqObject = {
                 method: 'POST or GET',
                 url: 'http://example.com',
                 headers: {
                 'Content-Type': undefined
                 },
                 data: { test: 'test' },
                 cache: false
                 }*/
            return $http(reqObject).success(function(data) {
                angular.element("body").removeClass("busy");
                return data;
            }).error(function() {
                angular.element("body").removeClass("busy");
            });
        }
    };
});

/**
     Description: Kendo grid create service
     Copyright (c) 2016 by Cisco Systems, Inc.
     All rights reserved.
     */
app.service("gridCrudService", function() {
    this.grid_page_sizes = [10, 20, 50, 100];
    this.createDataSource = function(paramObj) {
        /*
             * paramObj = {
             * 	readUrl: readUrl,
             * 	createUrl: createUrl,
             * 	updateUrl: updateUrl,
             * 	deleteUrl: deleteUrl,
             * 	parameterMapCallback: parameterMapCallback,
             * 	schemaParams: {model:{}, data:},
             * 	changeCallback: changeCallback,
             * 	batch: true || false,
             * 	pageSize: 10,
             * 	errorCallback: errorCallback,
             * createCompleteCallback: createCompleteCallback,
             * deleteCompleteCallback: deleteCompleteCallback,
             * editCompleteCallback: editCompleteCallback,
             * defaultSort: defaultSort
             * }
             */
        var transPort = {
            read : {
                url : paramObj.readUrl || "",
                dataType : "json"
            },
            create : {
                url : paramObj.createUrl || "",
                type : "POST",
                dataType : "json"
            },
            update : {
                url : paramObj.updateUrl || "",
                type : "POST",
                dataType : "json"
            },
            destroy : {
                url : paramObj.deleteUrl || "",
                type : "POST",
                dataType : "json"
            },
            parameterMap : function(options, operation) {
                if (paramObj.parameterMapCallback && typeof paramObj.parameterMapCallback == "function") {
                    return paramObj.parameterMapCallback(options, operation);
                } else {
                    if (operation !== "read" && options.models) {
                        return {
                            data : kendo.stringify(options.models)
                        };
                    }
                }
            }
        };
        if (paramObj.createCompleteCallback) {
            transPort.create.complete = paramObj.createCompleteCallback;
        }
        if (paramObj.deleteCompleteCallback) {
            transPort.destroy.complete = paramObj.deleteCompleteCallback;
        }
        if (paramObj.editCompleteCallback) {
            transPort.update.complete = paramObj.editCompleteCallback;
        }
        var dataSourceProperty = {
            transport : transPort,
            batch : paramObj.batch,
            schema : paramObj.schemaParams
        };

        if (paramObj.pageSize) {
            dataSourceProperty.pageSize = paramObj.pageSize;
        } else {
            dataSourceProperty.pageSize = 10;
        }
        if (paramObj.errorCallback) {
            dataSourceProperty.error = paramObj.errorCallback;
        }
        if (paramObj.defaultSort) {
            dataSourceProperty.sort = paramObj.defaultSort;
        }
        var dataSource = new kendo.data.DataSource(dataSourceProperty);

        return dataSource;
    };
});

/**
     Description: Kendo Notification Service
     Copyright (c) 2016 by Cisco Systems, Inc.
     All rights reserved.
     */
app.service("notificationService", function() {
    var template = "<div class='notiHeader'><span class='notiIcon'></span><span class='closeIcon' aria-hidden='true'>×</span><span class='notiTitle'>#= myTitle #</span></div><div class='notiMessage'>#= myMessage #</div>";
    var notificationElement = angular.element("<div></div>").kendoNotification({
        templates : [{
            type : "warning",
            template : "<div class='notiWarning notification'>"+template+"</div>"
        }, {
            type : "success",
            template : "<div class='notiSuccess notification'>"+template+"</div>"
        }, {
            type : "error",
            template : "<div class='notiError notification'>"+template+"</div>"
        }, {
            type : "info",
            template : "<div class='notiInfo notification'>"+template+"</div>"
        }],
        autoHideAfter: 6000
    });

    this.showNotification = function(message, title, type) {
        /**
             * message: it is to display in notification
             * type: it is type of message e.g. success, error, info, warning
             */
        var n = notificationElement.data("kendoNotification");

        // show a warning message using the built-in shorthand method
        n.show({
            myTitle: (title || "Applied Successfully"),
            myMessage: message
        }, (type || "success"));
    };
});

/**
     * Description: E
     * Copyright (c) 2016 by Cisco Systems, Inc.
     * 	All rights reserved.
     * 	*/
app.service("executeCliCmdService", function() {
    this.getNextString=function(strCLIOutput, arrTag, strEndDelimiter) {
        if (strCLIOutput == null || arrTag == null) {
            return "";
        }
        var intArrTagLength = arrTag.length;
        for( var i=0; i<intArrTagLength; i++) {
            var strTag = arrTag[i];
            var strOutput = getNextStr(strCLIOutput, strTag, strEndDelimiter);
            if (strOutput != null && strOutput != "") {
                return strOutput;
            }
        }
        return "";
    };
    function getNextStr(strCLIOutput, strTag, strEndDelimiter) {
        if (strCLIOutput == null || strTag == null) {
            return "";
        }
        var intTagLength = strTag.length;
        var intFromTagIndex = strCLIOutput.indexOf(strTag);
        if (intFromTagIndex == -1) {
            return "";
        }
        var strFromTag = strCLIOutput.substring(intFromTagIndex + intTagLength);
        var intOuputIndex = strFromTag.indexOf(strEndDelimiter);
        if (intOuputIndex == -1) {
            return strFromTag;
        }
        if (strEndDelimiter == "\n" ) {
            intOuputIndex = intOuputIndex - 1 ;
        }
        var strOutput =  strFromTag.substring(0,intOuputIndex);
        return strOutput;
    }

});

/* Service: i18nService
     * Description: The service is used by the translate filter for loading and
     * translating the strings used in the Web UI
     */
app.service('i18nService', function($rootScope){
    var i18nTranslations = null;
    var locale = "en";
    var supportedLocaleMap = {
        'en-US':'en',
        'en':'en',
        'ja_JP':'ja',
        'ja':'ja',
        'ko-kp': 'ko',
        'ko-kr': 'ko',
        'ko':'ko',
        'zh': 'zh',
        'zh-cn': 'zh',
        'zh-CN': 'zh',
        'de': 'de',
        'de-AT': 'de',
        'de-DE': 'de',
        'de-LI': 'de',
        'de-LU': 'de',
        'de-CH': 'de',
        'es': 'es',
        'es-ES': 'es',
        'es-MX': 'es',
        'es-US': 'es'
    };

    function getSupportedLocal() {
        var localVal = null;
        var itr = 0;
        if(navigator.languages && navigator.languages.length) {
            for(itr = 0; itr < navigator.languages.length ; itr ++ ) {
                localVal= supportedLocaleMap[navigator.languages[itr]];
                if(localVal) {
                    break;
                }
            }
        } else {
            localVal = supportedLocaleMap[navigator.browserLanguage || navigator.language];
        }
        if(window.localStorage.preferredLanguage !== undefined && supportedLocaleMap[window.localStorage.preferredLanguage] !== undefined){
            localVal = window.localStorage.preferredLanguage;
        }
        if(localVal){
            $rootScope.preferredLanguage = localVal;
            return localVal;
        } else  {
            $rootScope.preferredLanguage = "en";
            return "en";
        }
    }
    this.loadBundles = function() {
    	locale = getSupportedLocal();
    	var appJsonPath="";
    	var versionInfo = deviceCommunicator.getExecCmdOutput("show version")
    	if(versionInfo.indexOf("S6650L")!=-1 || versionInfo.indexOf("S5960")!=-1){
    		appJsonPath='nls/InspurApplicationProperties-'+locale+'.json';
    	}else{
    		appJsonPath='nls/ApplicationProperties-'+locale+'.json';
    	}
        jQuery.ajaxSetup({async:false});
        var parentNls = "";
        if(window.location.href.indexOf("day0/index.html") > 0){
        	parentNls = "../";
        }
        $.getJSON( parentNls + appJsonPath, function(data) {
            i18nTranslations = data;
        });
        jQuery.ajaxSetup({async:true});
    };
    this.loadBundles();

    this.getCurrentLocale = function() {
        return locale;
    };

    this.getLocalizedValue = function(key, defaultValue) {
        var i18nValue = i18nTranslations[key];
        if(i18nValue !== undefined && i18nValue !== null && i18nValue !== "" && i18nValue !== key) {
            return i18nValue;
        }
        else {
            return (defaultValue || key);
        }
    };

    this.formatMessageStr = function(){
        if(arguments.length === 0){
            return null;
        }
        var str = arguments[0];
        for(var i = 1; i < arguments.length; i++){
            var placeHolder = '{' + (i - 1) + '}';
            str = str.replace(placeHolder, arguments[i]);
        }
        return str;
    };

    this.dynamicKeyFormation = function(params,keyPrefix){
        var tempArr = params;
        for(i=0;i<params.length;i++){
            var keyLabel = tempArr[i].key;
            if(keyLabel !== undefined && keyLabel !== null && keyLabel !== ""){
                var i18nLabel = keyPrefix+"_"+keyLabel.replace(/\W+/g,'_').toLowerCase();
                tempArr[i].key = this.getLocalizedValue(i18nLabel, tempArr[i].key);
            }
        }
        return tempArr;
    };
});

/* This function will parse the CLI output stored in given String strCLIOutput and
     * returns the line which contains the given tag string.
     * First Argument  - The string in which the CLI output is stored.
     * Second Argument - The tag string which comes in line that is to be extracted.
     * Example:"!
     *			interface FastEthernet0/0/0
     *			 ip address 10.77.245.66 255.255.255.0
     *			 duplex full
     *			 speed auto
     *			!"
     * For this CLI output, if the tag string passed is "address", then
     * this function will extract and return the line "ip address 10.77.245.66 255.255.255.0".
     * Note: The tag String passed will be searched in the given strCLIOutput string for its
     * first occurance only. And the line corresponding to the first occurance will be returned.
     */
app.service("getStringLineService", function() {
    this.getLines=function(strCLIOutput, strTag) {
        if (strCLIOutput == null || strTag == null) {
            return "";
        }
        var arrLines = [];
        var intTagIndex = strCLIOutput.indexOf(strTag);
        while (intTagIndex != -1) {
            var intTagLength = strTag.length;
            // get the line in which this tag occurs
            var line = getLn(strCLIOutput, strTag);
            // store the line in the line array if it not empty or null
            if ( line != "" && line != null){
                arrLines.push(line);
            }
            strCLIOutput = strCLIOutput.substring(intTagIndex + intTagLength);
            var intLineEndIndex = strCLIOutput.indexOf("\n");
            strCLIOutput = strCLIOutput.substring(intLineEndIndex);
            // If no "\n" delimiter found in this line then this is the last line
            if (intLineEndIndex == -1) {
                return arrLines;
            }
            intTagIndex = strCLIOutput.indexOf(strTag);
        }
        return arrLines;
    } ;

    /* This function will parse the CLI output stored in given String strCLIOutput and
         * returns the line which contains the given tag string.
         * First Argument  - The string in which the CLI output is stored.
         * Second Argument - The tag string which comes in line that is to be extracted.
         */
    function getLn(strCLIOutput, strTag) {
        if (strCLIOutput == null || strTag == null) {
            return "";
        }
        var intTagIndex = strCLIOutput.indexOf(strTag);
        // If no matching tag found then return empty string
        if (intTagIndex == -1) {
            return "";
        }
        var strUptoTag = strCLIOutput.substring(0, intTagIndex);
        var intLineStartIndex = strUptoTag.lastIndexOf("\n");
        var strFromTag = strCLIOutput.substring(intTagIndex);
        var intLineEndIndex = strFromTag.indexOf("\n");
        // If no "\n" delimiter found in this line then this is the first line and the start index is 0
        if (intLineStartIndex == -1) {
            intLineStartIndex = 0;
        } else {
            //exclude the '/n' character
            intLineStartIndex = intLineStartIndex + 1;
        }
        // If no "\n" delimiter found in this line then this is the last line and end index is total length
        if (intLineEndIndex == -1) {
            intLineEndIndex = strFromTag.length;
        } else {
            //exclude the '/n' character
            intLineEndIndex = intLineEndIndex - 1;
        }
        var strLine = strCLIOutput.substring(intLineStartIndex, (intTagIndex + intLineEndIndex));
        return strLine;
    }

});

app.service("clusterCmdService", function() {
    /*
     * This code block is for cluster members operations
     * for retrieving the information from a cluster member
     * cmd should be of below format
     * Ex:
     * "es" + cluster_index + "/exec/show/clock/CR";
     * here cluster_index is the member ID
     *
     * for configuring a cluster member the cmd should be of below format
     * Ex:
     * var cli = "/es"+clusterIndex+"/level/15/exec/clear/counters /"+formatPort+"/CR";
     * var data = 'hidden_command=clear+counters&csrf_token='+token+'&CMD=CR';
     * result = httpPOST(cli,data);
     * sending csrf_token along with data is mandatory for configuration cmds as well as exec
     * cmds which needs write permission like wr mem, reload, led beacon.
     */
    function httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    };

    function httpPOST(theUrl, data) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", theUrl, false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(data);
        return xmlHttp.responseText;
    };

    this.getConfigureToken = function (cluster_index) {
        var url = "es" + cluster_index + "/exec/show/clock/CR";
        var result = httpGet(url);
        var token = result.slice(result.search("csrf_token VALUE=") + 18, result.search("csrf_token VALUE=") + 18 + 40);
        return token;
    };

    this.getClusterSnNumber = function (cluster_index) {
        var url = "es" + cluster_index + "/exec/show/version//|/i /System serial number/CR";
        var result = httpGet(url);
        var search_string = "System serial number            :";
        var index = result.search(search_string);
        var SnNumber = result.substring(index + search_string.length, index + search_string.length + 12);
        return SnNumber;
    };

    this.getClusterModelNumber = function (cluster_index) {
        var url = "es" + cluster_index + "/exec/show/version//|/i /Model/number/CR";
        var result = httpGet(url);
        var search_string = "Model number                    :";
        var index = result.search(search_string);
        var modelNumber = result.substring(index + search_string.length + 1, result.search("</FORM>"));
        return modelNumber;
    };

    this.getClusterInterfaceDetails = function (cluster_index) {
        var url = "es" + cluster_index + "/exec/show/interfaces/status/module/1/CR";
        var result = httpGet(url);
        var interface_details = result.substring(result.search("Port"), result.search("</FORM>"));
        var interface_details = interface_details.split("\n").splice(1);
        return interface_details;
     };

    this.getClusterInterfacePowerDetails = function (cluster_index) {
        var url = "es" + cluster_index + "/exec/show/power/inline/CR";
        var result = httpGet(url);
        var powerStatus = result.substring(result.search("Interface"), result.search("</FORM>"));
        var powerStatus = powerStatus.split("\n").splice(4);
        return powerStatus;
    };
    this.doReloadCluster = function (clusterIndex, saveConfig) {
        var cli;
        var data;
        var token;
        var result="";
        if (saveConfig) {
            cli = "es"+clusterIndex+"/exec/wr/CR";
            token = this.getConfigureToken(clusterIndex);
            data = 'hidden_command=wr&csrf_token=' + token + '&CMD=CR';
            result = httpPOST(cli, data);
            result = processXmlHttpOuput(result);
            if(result.indexOf("OK") == -1){
				//Write memory failed
                return;
            }
        }
        cli = "es"+clusterIndex+"/exec/reload/CR";
        token = this.getConfigureToken(clusterIndex);
        data = 'hidden_command=reload&csrf_token=' + token + '&CMD=CR';
        result = httpPOST(cli, data);
        result = processXmlHttpOuput(result);
        if(result.trim() != ""){
            result.errorResponse = "failed to reload";
        } else{
            result = "";
        }
        return result;
    };

    this.execShowClusterCmds = function(cluster_index,cli) {
         cli = cli.split(/\s+/).join("/");
         var url="es"+cluster_index+"/exec/"+cli+"/CR";
         var result =  httpGet(url);
         var result = processXmlHttpOuput(result);
         return result;
    };

    this.ledBeacon = function (clusterIndex) {
        var cli;
        var data;
        var token;
        var result;
        cli = "/es"+clusterIndex+"/level/15/exec/led/beacon/CR";
        token = this.getConfigureToken(clusterIndex);
        data = 'hidden_command=led+beacon&csrf_token=' + token + '&CMD=CR';
        result = httpPOST(cli, data);
        result=processXmlHttpOuput(result);
        if(result.trim() != ""){
           result.errorResponse = "failed to find the switch";
        } else {
          result = "";
        }
        return result;
    };

    processXmlHttpOuput = function (result) {
        result = result.substring(result.lastIndexOf("VALUE") + 49, result.search("</FORM>"));
        return result
    };

    this.getMultiShowCmdOutput = function(multiCmds, clusterIndex){
      var result=[];
      var multiCmdLineCmd = multiCmds.split("\n");
      var multiCmdLineFormat;
      var cli;
      var result;
      for(var i=0; i<multiCmdLineCmd.length; i++){
          if(multiCmdLineCmd[i]!= ""){
              multiCmdLineFormat = multiCmdLineCmd[i].split(/\s+/).join("/");
              cli = "/es"+ clusterIndex +"/exec/"+multiCmdLineFormat+"/"+"CR";
              result[i] = httpGet(cli);
              result[i] = processXmlHttpOuput(result[i]).trim();
          }
      }
      return result;
    };

    this.clearCounters = function(portValue, clusterIndex){
      var result;
      var formatPort =  portValue.split("/").join("%5c/");
      var token = this.getConfigureToken(clusterIndex);
      var cli = "/es"+clusterIndex+"/level/15/exec/clear/counters /"+formatPort+"/CR";
      var data = 'hidden_command=clear+counters&csrf_token='+token+'&CMD=CR';
      result = httpPOST(cli,data);
      result = processXmlHttpOuput(result);
      if(result.trim() != ""){
         result.errorResponse = "failed to clear Counters";
      } else{
         result = "";
      }
      return result;
    };

    this.getMultiConfigPortCmdOutput = function(portCli, clusterIndex){
        var result;
        portCli = portCli.split("interface");
        for(var j=1; j<portCli.length; j++)
        {
            var portValue = portCli[j].split("\n")[0].trim();
            var formatPort = portValue.split("/").join("%5c/");
            var individualCli = portCli[j].split("\n");
            var formatCli;
            for (var i = 1; i < individualCli.length-1; i++) {
                formatCli = individualCli[i].split(/\s+/).join("/");
                var token = this.getConfigureToken(clusterIndex);
                var cli = "es" + clusterIndex + "/interface/" + formatPort +"/"+ formatCli + "/CR";
                var data = 'hidden_command=&csrf_token=' + token + '&CMD=CR';
                result = httpPOST(cli, data);
                result = processXmlHttpOuput(result).trim();
                if ((result != "") && (result.indexOf("Creating a port-channel interface Port-channel") == -1) && (result.indexOf("VLAN does not exist. Creating vlan") == -1)) {
                    result.errorResponse = "failed to configure";
                    return result;
                }
            }
        }
        return result;
    }
});


/*
     * returning local calendar for respective local languages
     */
app.service("getLocalCalendar", function() {
    this.getLocalDate=function(strDate) {
        if(navigator.language.indexOf("en") != -1){
            return strDate;
        }else{
            var date="";
            var ko = ["일월","이월","행진","4월","할수있다","유월","칠월","8월","구월","십월","십일월","12월"];
            var ja = ["1月","2月","行進","4月","5月","六月","7月","8月","9月","10月","11月","12月"];
            var zh = ["一月","二月","遊行","四月","可能","六月","七月","八月","九月","十月","十一月","十二月"];
            var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            var getCurMonth = strDate.split(" ")[1];
            var koMonthindex = ko.indexOf(getCurMonth);
            var jaMonthindex = ja.indexOf(getCurMonth);
            var	zhMonthindex = zh.indexOf(getCurMonth);
            var engMonth = "";
            if(koMonthindex != -1){
                engMonth = month[koMonthindex];
            }
            else if(jaMonthindex != -1){
                engMonth = month[jaMonthindex];
            }
            else if(zhMonthindex != -1){
                engMonth = month[zhMonthindex];
            }
            date = strDate.replace(getCurMonth,engMonth);
            return date;
        }
    } ;
});

/**
     * get the localized month and day for the given string.
     */
app.service("getLocalDayMonth", function() {
    this.localizeDayMonth=function(day,month) {
        // localize day
        var enDay = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var koDay = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
        var jaDay = ["日曜日","月曜","火曜日","水曜日","木曜日","金曜日","土曜日"];
        var zhDay = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
        var CurDayindex = enDay.indexOf(day);
        var getCurDay = "";
        if(navigator.language.indexOf("ko") != -1)	{
            getCurDay = koDay[CurDayindex];
        }
        else if(navigator.language.indexOf("ja") != -1){
            getCurDay = jaDay[CurDayindex];
        }
        else if(navigator.language.indexOf("zh") != -1){
            getCurDay = zhDay[CurDayindex];
        }
        else{
            getCurDay = day;
        }
        // localize month
        var enMonth = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var koMonth = ["일월","이월","행진","4월","할수있다","유월","칠월","8월","구월","십월","십일월","12월"];
        var jaMonth = ["1月","2月","行進","4月","5月","六月","7月","8月","9月","10月","11月","12月"];
        var zhMonth = ["一月","二月","遊行","四月","可能","六月","七月","八月","九月","十月","十一月","十二月"];
        var CurMonthindex = enMonth.indexOf(month);
        var getCurMonth = "";
        if(navigator.language.indexOf("ko") != -1) {
            getCurMonth = koMonth[CurMonthindex];
        }
        else if(navigator.language.indexOf("ja") != -1)	{
            getCurMonth = jaMonth[CurMonthindex];
        }
        else if(navigator.language.indexOf("zh") != -1) {
            getCurMonth = zhMonth[CurMonthindex];
        }
        else {
            getCurMonth = month;
        }
        //return localized day and month
        return [getCurDay,getCurMonth];
    } ;
});

/**
     * returning the month in numeric for the given month.
     */
app.service("getMonthIndex", function() {
    this.monthIndex=function(month) {
        var enMonth = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var getMonthNum = (enMonth.indexOf(month)+1).toString();
        getMonthNum = getMonthNum.length < 2 ? '0' + getMonthNum : getMonthNum;
        return getMonthNum;
    } ;
});

/**
Description: HTTP service to Get/Send HTTP Calls to endpoints
Copyright (c) 2017 by Cisco Systems, Inc.
All rights reserved.
*/
app.service("httpServices", function() {
	this.httpGetMethod=function(url) {
		var xmlHttp = new XMLHttpRequest();
        // false for synchronous request
		 xmlHttp.open( "GET", url, false );
		 xmlHttp.send( null );
		 return xmlHttp.responseText;
	};
	this.httpPostMethod=function(url,data) {
		var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "POST", url, true );
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(data);
	};
});

/**
Description: Returning Network IP for given IP address and Subnet mask
Copyright (c) 2018 by Cisco Systems, Inc.
All rights reserved.
*/
app.service("networkIPDetails", function() {
    var maskArray = ["0.0.0.0", "128.0.0.0", "192.0.0.0", "224.0.0.0", "240.0.0.0", "248.0.0.0", "252.0.0.0", "254.0.0.0", "255.0.0.0", "255.128.0.0", "255.192.0.0", "255.224.0.0", "255.240.0.0", "255.248.0.0", "255.252.0.0", "255.254.0.0", "255.255.0.0", "255.255.128.0", "255.255.192.0", "255.255.224.0", "255.255.240.0", "255.255.248.0", "255.255.252.0", "255.255.254.0", "255.255.255.0", "255.255.255.128", "255.255.255.192", "255.255.255.224", "255.255.255.240", "255.255.255.248", "255.255.255.252", "255.255.255.254", "255.255.255.255"];
    /* In some versions of JavaScript subnet calculators they use bitwise operations to shift the values left. Unfortunately 
	JavaScript converts to a 32-bit signed integer when you mess with bits, which leaves you with the sign + 31 bits. For the first byte this means 
	converting back to an integer results in a negative value for values 128 and higher since the leftmost bit, the sign, becomes 1. 
	Using the 64-bit float allows us to display the integer value to the user. */
    /* dotted-quad IP to integer */    
    function IPv4_dotquadA_to_intA( strbits ) {
		var split = strbits.split( '.', 4 );
		var myInt = (
			parseFloat( split[0] * 16777216 )	/* 2^24 */
		  + parseFloat( split[1] * 65536 )		/* 2^16 */
		  + parseFloat( split[2] * 256 )		/* 2^8  */
		  + parseFloat( split[3] )
		);
		return myInt;
    }
    /* integer IP to dotted-quad */
	function IPv4_intA_to_dotquadA( strnum ) {
		var byte1 = ( strnum >>> 24 );
		var byte2 = ( strnum >>> 16 ) & 255;
		var byte3 = ( strnum >>>  8 ) & 255;
		var byte4 = strnum & 255;
		return ( byte1 + '.' + byte2 + '.' + byte3 + '.' + byte4 );
	}
	/* integer IP to binary string representation */
	function IPv4_intA_to_binstrA( strnum ) {
		var numStr = strnum.toString( 2 ); /* Initialize return value as string */
		var numZeros = 32 - numStr.length; /* Calculate no. of zeros */
		if (numZeros > 0) {	for (var i = 1; i <= numZeros; i++) { numStr = "0" + numStr }	} 
		return numStr;
	}
	/* binary string IP to integer representation */
	function IPv4_binstrA_to_intA( binstr ) {
		return parseInt( binstr, 2 );
	}
	/* convert # of bits to a string representation of the binary value */
	function IPv4_bitsNM_to_binstrNM( bitsNM ) {
		var bitString = '';
		var numberOfOnes = bitsNM;
		while( numberOfOnes-- ) bitString += '1'; /* fill in ones */
		numberOfZeros = 32 - bitsNM;
		while( numberOfZeros-- ) bitString += '0'; /* pad remaining with zeros */
		return bitString;
	}
	/* The IPv4_Calc_* functions operate on string representations of the binary value because I don't trust JavaScript's sign + 31-bit bitwise functions. */
	/* logical AND between address & netmask */
	function IPv4_Calc_netaddrBinStr( addressBinStr, netmaskBinStr ) {
		var netaddressBinStr = '';
		var aBit = 0; var nmBit = 0;
		for( pos = 0; pos < 32; pos ++ ) {
			aBit = addressBinStr.substr( pos, 1 );
			nmBit = netmaskBinStr.substr( pos, 1 );
			if( aBit == nmBit ) {	netaddressBinStr += aBit.toString();	}
			else{	netaddressBinStr += '0';	}
		}
		return netaddressBinStr;
	}
	/* logical OR between address & NOT netmask */
	function IPv4_Calc_netbcastBinStr( addressBinStr, netmaskBinStr ) {
		var netbcastBinStr = '';
		var aBit = 0; var nmBit = 0;
		for( pos = 0; pos < 32; pos ++ ) {
			aBit = parseInt( addressBinStr.substr( pos, 1 ));
			nmBit = parseInt( netmaskBinStr.substr( pos, 1 ));
			
			if( nmBit ) {	nmBit = 0;	}	/* flip netmask bits */
			else{	nmBit = 1;	}
			
			if( aBit || nmBit ) {	netbcastBinStr += '1'	}
			else{	netbcastBinStr += '0';	}
		}
		return netbcastBinStr;
	}
	/* included as an example alternative for converting 8-bit bytes to an integer in IPv4_dotquadA_to_intA */
	function IPv4_BitShiftLeft( mask, bits ) {
		return ( mask * Math.pow( 2, bits ) );
	}
	/* used for display purposes */
	function IPv4_BinaryDotQuad( binaryString ) {
		return ( binaryString.substr( 0, 8 ) +'.'+ binaryString.substr( 8, 8 ) +'.'+ binaryString.substr( 16, 8 ) +'.'+ binaryString.substr( 24, 8 ) );
	}	
	function update_ip(ipAdress,mask) {		
		var maskIndex=maskArray.indexOf(mask) 
		if(maskIndex == -1){
			maskIndex = 32;
		}
	    var myIP = new IPv4_Address( ipAdress, maskIndex);	   
		var networkIP=myIP.netaddressDotQuad;
		return networkIP;	
	}
    function IPv4_Address( addressDotQuad, netmaskBits ) {
		var split = addressDotQuad.split( '.', 4 );
		var byte1 = Math.max( 0, Math.min( 255, parseInt( split[0] ))); /* sanity check: valid values: = 0-255 */
		var byte2 = Math.max( 0, Math.min( 255, parseInt( split[1] )));
		var byte3 = Math.max( 0, Math.min( 255, parseInt( split[2] )));
		var byte4 = Math.max( 0, Math.min( 255, parseInt( split[3] )));
		if( isNaN( byte1 )) {	byte1 = 0;	}	/* fix NaN situations */
		if( isNaN( byte2 )) {	byte2 = 0;	}
		if( isNaN( byte3 )) {	byte3 = 0;	}
		if( isNaN( byte4 )) {	byte4 = 0;	}
		addressDotQuad = ( byte1 +'.'+ byte2 +'.'+ byte3 +'.'+ byte4 );
		this.addressDotQuad = addressDotQuad.toString();
		this.netmaskBits = Math.max( 0, Math.min( 32, parseInt( netmaskBits ))); /* sanity check: valid values: = 0-32 */
		this.addressInteger = IPv4_dotquadA_to_intA( this.addressDotQuad );
		this.addressBinStr  = IPv4_intA_to_binstrA( this.addressInteger );
		this.netmaskBinStr  = IPv4_bitsNM_to_binstrNM( this.netmaskBits );
		this.netmaskInteger = IPv4_binstrA_to_intA( this.netmaskBinStr );
		this.netmaskDotQuad  = IPv4_intA_to_dotquadA( this.netmaskInteger );
		this.netaddressBinStr = IPv4_Calc_netaddrBinStr( this.addressBinStr, this.netmaskBinStr );
		this.netaddressInteger = IPv4_binstrA_to_intA( this.netaddressBinStr );
		this.netaddressDotQuad  = IPv4_intA_to_dotquadA( this.netaddressInteger );
		this.netbcastBinStr = IPv4_Calc_netbcastBinStr( this.addressBinStr, this.netmaskBinStr );
		this.netbcastInteger = IPv4_binstrA_to_intA( this.netbcastBinStr );
		this.netbcastDotQuad  = IPv4_intA_to_dotquadA( this.netbcastInteger );
    }
    this.getNetworkIP=function(ip, subnet) {
		var networkIP=update_ip(ip,subnet);
		return networkIP;
	};
});
