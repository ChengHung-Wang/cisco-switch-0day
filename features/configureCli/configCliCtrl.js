/**
 Description: Configure CLI Controller
 Requirement: Implement the behaviour similar to Cisco CLI
 February 2016
 Copyright (c) 2015 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller("configCliCtrl", ['$scope', '$rootScope', '$timeout', '$filter', 'requestRoutingService',
function($scope, $rootScope, $timeout, $filter, requestRoutingService) {

	//Initialize all data/variables
	var translate = $filter("translate");
	$scope.currentCommand = "";
	$scope.cliInput = "";
	$scope.cliOutput = "";
	$scope.configType = "exec";
	$scope.keepFocus = true;

	//Hide option for SM devices
	$scope.smDeviceStatus=false;
	if($rootScope.deviceInfo.type.indexOf("C2960L-SM") !=-1 || $rootScope.deviceInfo.type.indexOf("C1000SM") !=-1){
		$scope.smDeviceStatus=true;
	}else{
		$scope.smDeviceStatus=false;
	}
	
	//Used to lookup the command to show from history using ↓ and ↑ keys
	$scope.lookUpPosition = -1;

	//History data. Should be maintained seperately for exec and config commands
	$scope.history = [];
	$scope.execHistory = [];
	$scope.configHistory = [];

	angular.element('#cliinput').focus();
	$scope.focussedOut = function(){
		//Any condition under which to exclude focussing back, Add here.
		//1. Dont focus back if language selector is expanded
		if($('#languageSelector:hover').length===0 && $scope.keepFocus){
			angular.element('#cliinput').focus();
			$timeout(function () {
				angular.element('#cliinput').focus();
			}, 100);
		}
	};
	$scope.clearFields = function() {
		$scope.cliInput = "";
		$scope.cliOutput = "";
		$scope.lookUpPosition = $scope.history.length-1;
		angular.element('#cliinput').focus();
	};

	/**
	 *This function will capture the keys and handle special cases like:
	 * ? -> list the possible options for the CLI command
	 * <tab> -> Auto complete the next possible command
	 * ↑ and ↓ keys -> to pick command from history <TODO>
	 * This behaviour will be inline with the CLI behaviour on console.
	 */
	$scope.handleKeyPress = function(evt){
		if(evt.key === "?" || evt.keyCode == 63){
			//Fetch the entire output for ?
			var textarea = document.getElementById("cliinput");
			var position = textarea.value.substr(0, textarea.selectionStart).split("\n").length -1;
			var cliArr	= (textarea.value.split('\n'));

			if(position <0){
				position = 0;
			}
			var cli = ($scope.configType == "configure"?textarea.value:cliArr[position]) + "?";
			var result = "";
			try{
				result = ($scope.configType == "exec") ?
                                                requestRoutingService.getShowCmdOutput(cli) :
                                                requestRoutingService.getConfigCmdOutput(cli);
			} catch(ex){
				// catch code here...
			}
			if($scope.configType == "configure" && result!=""){
				result = result;
			}
			$scope.cliOutput = "\n" + "#" + cli + "\n" + result + "\n" + $scope.cliOutput;
			$scope.$apply();
			return false;
		} else {
			//Do nothing. Ignore.
		}
	};
	//Handle Ctr+Enter/X/M here
	$scope.handleKeyUp = function(evt){
		if(evt.ctrlKey){
			if((evt.key === "Enter" || evt.keyCode == 13) && (evt.ctrlKey)){
                        	//Send the request to fetch output
                        	//Change focus to result box
                        	$scope.executeCli($scope.cliInput,$scope.configType);
                        	//NOT NEEDED for now as the button type is submit and hence it executes
                	} else if(evt.code === "KeyX" || evt.keyCode == 88){
                				//Ctrl+X clears the fields
                                //Clear the fields
                                $scope.clearFields();
                                $scope.$apply();
                        } else if(evt.code === "KeyM" || evt.keyCode == 77){
                				//Ctrl+M changes mode
                                //Flip the mode configre->exec or exec->configure
                                $timeout(function () {
                                        $scope.configType = ($scope.configType == "configure"?"exec":"configure");
                                        $scope.$apply();
                                }, 100);
                        } else if(evt.code === "KeyY" || evt.keyCode == 89){
                                  $scope.copy_cli_output();
                        } else if(evt.shiftKey && (evt.code === "KeyE" || evt.keyCode == 69)){
                                   $scope.save_file_content();
                        } else {
				//Ignore all
			}
		}
	};
    //Set cursor to end
    var moveCaretToEnd = function(el) {
        angular.element('#cliinput').focus();
        if (typeof el.selectionStart == "number") {
            window.setTimeout(function(){el.selectionStart = el.selectionEnd = el.value.length;},5);
        } else if (typeof el.createTextRange != "undefined") {
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
        }
        $scope.$apply();
    };
	//Handle tab and return here, onkeypress does not recognisable non-printable characters
	$scope.handleKeyDown = function(evt){
		if(evt.key === "Tab" || evt.keyCode == 9 ){
			//In multi line command, the tab should try to auto complete
			//the command where the cursor is present. It could be any line
			var textarea = document.getElementById("cliinput");
			var position = textarea.value.substr(0, textarea.selectionStart).split("\n").length -1;
			var cliArr	= (textarea.value.split('\n'));

			if(position <0){
				position = 0;
			}
			var cli = ($scope.configType == "configure"?textarea.value:cliArr[position]) + "?";
                        var result = "";
			try{
                                result = ($scope.configType == "exec") ?
						requestRoutingService.getShowCmdOutput(cli) :
						requestRoutingService.getConfigCmdOutput(cli);
				if($scope.configType == "configure" && result!=""){
							result=result;
						}
				if(result.split("\n").length == 1 && result.split(" ").length == 1){
					//Its a unique entry, hence auto complete
					var cmd = cliArr[position];
					cmd = cmd.split(" ");
					cmd[cmd.length-1] = result;
					cliArr[position] = cmd.join(" ");
					$scope.cliInput = cliArr.join("\n")
					$scope.$apply();
				}else{
					//Ignore, cannot be auto completed with tab
				}
                        } catch(ex){
                                // catch code here...
                        }
			return false;
                } else if((evt.key === "ArrowUp" || evt.keyCode == 38) && (evt.shiftKey)){
                        /**
			 *Handle UP arrow key  ↑↑↑↑↑↑↑↑↑
			 *The last executed command should be on top,
			 *then next to last, and so on
			*/
			if($scope.lookUpPosition == -1){
				//This is the first lookup, pick the top (last command)
				//Store the current full/partial entry if any
				if($scope.history.length == 0){
					//Nothing to do. No history.
					return;
				}
				$scope.currentCommand = $scope.cliInput;
				$scope.lookUpPosition = $scope.history.length-1;
			} else if($scope.lookUpPosition == 0){
				//Nothing to be done
				//Just fill the command at 0th place
			} else {
				$scope.lookUpPosition--;
			}
			$scope.cliInput = $scope.history[$scope.lookUpPosition];
			$scope.$apply();
			moveCaretToEnd(document.getElementById('cliinput'));
                } else if((evt.key === "ArrowDown" || evt.keyCode == 40) && (evt.shiftKey)){
			/**
                         *Handle DOWN arrow key  ↓↓↓↓↓↓↓↓↓
                         *Decrement from the last UP position
                         *If end is reached, dont show anything, just the currently entered text
                        */
			if($scope.lookUpPosition === $scope.history.length-1){
				if($scope.history.length === 0){
					//Nothing to be done
					//History is empty
					return;
				}
            			$scope.cliInput = $scope.currentCommand;
            			$scope.lookUpPosition = -1;
            			$scope.$apply();
            			return;
            		} else if($scope.lookUpPosition === -1){
            			return;
            			//Obviously nothing to look for
            			//Just return and let there be status quo
            		} else {
            			$scope.lookUpPosition++;
            			$scope.cliInput =  $scope.history[$scope.lookUpPosition];
            		}
            		$scope.$apply();
			moveCaretToEnd(document.getElementById('cliinput'));
                } else {
			//Do nothing. Ignore.
		}
	};

	$scope.$watch('configType', function(newValue) {
		if(newValue){
			$scope.modeChanged(newValue);
		}else{
			//Ignore!!!
		}
 	});

	$scope.modeChanged = function(){
		//Set the history search criteria
		//Set focus back to input field

		$scope.cliInput = "";

		//Select the right command history and reset lookup position
		//exec history OR config history ??
		$scope.history = ($scope.configType == "configure") ?
				 JSON.parse(JSON.stringify($scope.configHistory)) :
				 JSON.parse(JSON.stringify($scope.execHistory)) ;
		$scope.lookUpPosition = -1;
		if($scope.configType == "configure"){
			angular.element('#cliinput')[0].placeholder = translate('switch_cli_config_placeholder');
		} else {
			angular.element('#cliinput')[0].placeholder = translate('switch_cli_exec_placeholder');
		}
		angular.element('#cliinput').focus();
	};

    //This will be used to demarcate and start execution of a new command
    var startNewCommand = function(){
        return ("\n" + Date().toLocaleString().trim() +
            "\n===================================================================================\n");
    };
	/**
	 * The request is sent to the device and a
	 * response is received. Display it.
	 */
	$scope.executeCli = function(cli, cliType, evt) {
		angular.element('#clioutput').focus();
		if($scope.cliInput != ""){
			var $evt = evt == undefined ? angular.element("#runCommand")[0] : evt.target;
			angular.element($evt).button('loading');
			//Will hold result of this execution
			var thisResult = "";

			//Following is required to find command from history
			//Choose the right history to push the command into along with the current history
			//Lookup position needs to be reset as well
			//Dont add the command to history if its been repeated more than once in succession
			if(cli != $scope.history[$scope.history.length-1]){
				$scope.history.push(cli);
				($scope.configType == "configure")?$scope.configHistory.push(cli):$scope.execHistory.push(cli);
			}
			$scope.lookUpPosition = -1;
			$timeout(function() {
				if (cliType != "configure") {
					var cli = document.getElementById("cliinput").value;
					var cliArr = cli.split('\n');
					for (var i = 0; i < cliArr.length; i++) {
						if(cliArr[i].trim() != ""){
										try{
												thisResult += "#" + cliArr[i] + "\n" + requestRoutingService.getShowCmdOutput(cliArr[i]) + "\n";
							}catch (e){
								thisResult += "#" + cliArr[i] + "\n" + translate("switch_cli_fail") + ": " + cliArr[i] + "\n";
							}
						}
					}
				} else {
					var cli = document.getElementById("cliinput").value;
								try{
										thisResult = requestRoutingService.getConfigCmdOutput(cli);
						if(thisResult == ""){
											//Successfull execution
											thisResult = "#" + cli + "\n" + translate("switch_cli_success") + "\n";
										}
								}catch (e){
						thisResult = "#" + cli + "\n" + translate("switch_cli_fail") + ": " + cli + "\n";
								}
				}
				angular.element($evt).button('reset');
				//Reset the input value
				$scope.cliInput = "";
				if(thisResult){
					if(thisResult!=""){
						$scope.cliOutput = startNewCommand(cli) + thisResult + $scope.cliOutput;
					} else {
						$scope.cliOutput = startNewCommand(cli) + thisResult + "\n" + $scope.cliOutput;
					}
					document.getElementById('clioutput').scrollTop = 0;
					$scope.currentCommand = "";
				}
			},50);
			} else {
				//No CLI present. Just put an empty line in output
				$scope.cliOutput =  "\n" + $scope.cliOutput;
				document.getElementById('clioutput').scrollTop = 0;
			}

		angular.element('#cliinput').focus();
	};

	$scope.copy_cli_output = function(){
		$scope.keepFocus = false;
		angular.element('#clioutput').focus();
		angular.element('#clioutput').select();
		try {
			var successful = document.execCommand('copy');
			if(successful) {console.log("copied");}
			if (!successful){
                throw successful;
			}
		} catch (err) {
			console.log("failed to copy", toCopy);
		}
		angular.element('#cliinput').focus();
                $scope.keepFocus = true;

        };

        $scope.save_file_content = function(){
		var textToSave = $scope.cliOutput;
                var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
                var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
                var hostname = deviceCommunicator.getExecCmdOutput("show running-config | i hostname").split(' ')[1].trim();
                var platform = deviceCommunicator.getExecCmdOutput("show version | i Model number ").split(':')[1].trim();
                var time_stamp = Date().split(' ')[4];
                var fileNameToSaveAs = platform+"_"+hostname+"_"+"clioutput"+"_"+time_stamp+".txt";

                /* For windows based browsers */
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(textToSaveAsBlob, fileNameToSaveAs);
                    return;
                }

                var downloadLink = document.createElement("a");
                downloadLink.download = fileNameToSaveAs;
                downloadLink.innerHTML = "Download File";
                downloadLink.href = textToSaveAsURL;
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
                downloadLink.click();
        };

        function destroyClickedElement(event){
		document.body.removeChild(event.target);
        }


}]);
