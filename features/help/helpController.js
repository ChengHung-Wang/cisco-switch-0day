app.register.controller('helpCtrl', ['$rootScope','$scope','$timeout',
	function($rootScope,$scope, $timeout) {
		$scope.platform="";
		$scope.isXR=false;
		var imageName="";
		$scope.helpImageUrl='';
		var platform = "";
		$timeout(function(){
			if($rootScope.deviceInfo){			
				var deviceVersion=$rootScope.deviceInfo.type.split('-');
				platform = deviceVersion[1];
				var prefix = deviceVersion[0]+"-";
				if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
					prefix = "";
					platform = deviceVersion[0];
				}else if($rootScope.deviceInfo.type.indexOf("2960+")!=-1){
                        		platform = "C2960";
                		}else if($rootScope.deviceInfo.type.indexOf("2960C")!=-1 && $rootScope.deviceInfo.type.indexOf("2960CX") == -1){
                        		platform = "C2960C405";
                		}else if(platform == "C2960XR"){
                        		platform = "C2960X";
                		}
				var dir = platform;

				//Calculate image name
				if(platform == "C2960L" || platform == "CDB"){
					if($rootScope.deviceInfo.isUPoECapable){
						imageName=dir+"/"+prefix+platform+"-"+$rootScope.deviceInfo.numberOfPorts+"U.jpg";
					}
					else if($rootScope.deviceInfo.isPoECapable){
						imageName=dir+"/"+prefix+platform+"-"+$rootScope.deviceInfo.numberOfPorts+"P.jpg";
					}
					else {
						imageName=dir+"/"+prefix+platform+"-"+$rootScope.deviceInfo.numberOfPorts+".jpg";
					}
				}else{
					$scope.isXR = ($rootScope.deviceInfo.type.indexOf("2960XR") != -1);
					if($rootScope.deviceInfo.type == "WS-C2960CX-8PC-L" || $rootScope.deviceInfo.type == "WS-C3560CX-12PD-S" ||
						$rootScope.deviceInfo.type == "WS-C3560CX-8XPD-S" || $rootScope.deviceInfo.type == "WS-C3560CX-8PT-S" ||
						$rootScope.deviceInfo.type == "WS-C2960CPD-8PT-L" ){
							imageName=dir+"/"+ $rootScope.deviceInfo.type + ".jpg";
					}else if($rootScope.deviceInfo.type.indexOf("2960+")!=-1){
						imageName=dir+"/"+platform+"P.jpg";
					} else {
						imageName=dir+"/"+platform+".jpg";
					}
				}
			}
			
			if($rootScope.deviceInfo.type.indexOf("C2960L-SM")!=-1){
				dir="C2960L-SM";
				if($rootScope.deviceInfo.type.indexOf("8P")!=-1){
					imageName=dir+"/SM-8P.jpg";
				}else if($rootScope.deviceInfo.type.indexOf("8T")!=-1){
					imageName=dir+"/SM-8T.jpg";
				}else if($rootScope.deviceInfo.type.indexOf("16P")!=-1){
					imageName=dir+"/SM-16P.png";
				}else if($rootScope.deviceInfo.type.indexOf("16T")!=-1){
					imageName=dir+"/SM-16T.png";
				}else if($rootScope.deviceInfo.type.indexOf("24PQ")!=-1){
					imageName=dir+"/SM-24PQ.png";
				}else if($rootScope.deviceInfo.type.indexOf("24T")!=-1){
					imageName=dir+"/SM-24T.png";
				}else if($rootScope.deviceInfo.type.indexOf("48PQ")!=-1){
					imageName=dir+"/SM-48PQ.png";
				}else if($rootScope.deviceInfo.type.indexOf("48T")!=-1){
					imageName=dir+"/SM-48T.png";
				}else {
					imageName=dir+"/SM-Family.png";
				}				
			}
			if($rootScope.deviceInfo.type.indexOf("C1000")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000SM")!=-1){
				
				/*if($rootScope.deviceInfo.type.indexOf("C1000SM")!=-1){
					dir="C1000-SM";
					if($rootScope.deviceInfo.type.indexOf("8")!=-1){
						imageName=dir+"/C1000SM-8P.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("16")!=-1){
						imageName=dir+"/C1000SM-16P.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("24")!=-1){
						imageName=dir+"/C1000SM-24P.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("48")!=-1){
						imageName=dir+"/C1000SM-48PQ.jpg";
					}
				}else{*/
				if($rootScope.deviceInfo.type.indexOf("C1000FE")!=-1){
					dir="C1000FE";
					if($rootScope.deviceInfo.type.indexOf("48P")!=-1){
						imageName=dir+"/C1000FE_48P.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("48T")!=-1){
						imageName=dir+"/C1000FE_48T.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("24P")!=-1){
						imageName=dir+"/C1000FE_24LP.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("24T")!=-1){
						imageName=dir+"/C1000FE_24T.jpg";
					}
				}else{
					dir="C1000";
					if($rootScope.deviceInfo.type.indexOf("48")!=-1){
						imageName=dir+"/C1000-48PQ.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("16")!=-1){
						imageName=dir+"/C1000-16P.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("24")!=-1){
						imageName=dir+"/C1000-24P.jpg";
					}else if($rootScope.deviceInfo.type.indexOf("8")!=-1){
						imageName=dir+"/C1000-8P.jpg";
					}
				}
			}
			var imageUrl="resources/images/"+ $.trim(imageName);
			$scope.helpImageUrl=imageUrl;
			$scope.platform = platform;
			//open doc page in a new window
			if($rootScope.deviceInfo.type.indexOf("S6650L") != -1 || $rootScope.deviceInfo.type.indexOf("S5960") != -1 ){
				$scope.deviceOwner="inspur";
			}else{
				$scope.deviceOwner="cisco";				
				if($scope.platform == "C3560CX"){
					window.open("http://www.cisco.com/c/en/us/support/switches/catalyst-3560-cx-series-switches/tsd-products-support-series-home.html");
				}else if($scope.platform == "C2960X" && !$scope.isXR){
					window.open("http://www.cisco.com/c/en/us/support/switches/catalyst-2960-x-series-switches/tsd-products-support-series-home.html");
				}else if($scope.platform == "C2960X" &&  $scope.isXR){
					window.open("http://www.cisco.com/c/en/us/support/switches/catalyst-2960-xr-series-switches/tsd-products-support-series-home.html");
				}else if($scope.platform == "C2960L"){
					window.open("http://www.cisco.com/c/en/us/support/switches/catalyst-2960-l-series-switches/tsd-products-support-series-home.html");
				}else if($scope.platform == "CDB"){
					window.open("https://www.cisco.com/c/en/us/products/switches/catalyst-digital-building-series-switches/index.html");
				}else if($scope.platform == "C2960C405"){
					window.open("http://www.cisco.com/c/en/us/support/switches/catalyst-2960-c-series-switches/tsd-products-support-series-home.html");
				}else if($scope.platform == "C2960CX"){
					window.open("http://www.cisco.com/c/en/us/support/switches/catalyst-2960-cx-series-switches/tsd-products-support-series-home.html");
				}else if($scope.platform == "C2960"){
					window.open("http://www.cisco.com/c/en/us/support/switches/catalyst-2960-plus-series-switches/tsd-products-support-series-home.html");
				}
			}				
			if($rootScope.deviceInfo.type.indexOf("C2960L-SM")!=-1){
				$scope.deviceOwner="cisco";
				window.open("http://www.cisco.com/c/en/us/support/switches/catalyst-2960-l-series-switches/tsd-products-support-series-home.html");
			}
			if($rootScope.deviceInfo.type.indexOf("C1000")!=-1){
				$scope.deviceOwner="cisco";
				window.open("https://www.cisco.com/c/en/us/products/switches/catalyst-1000-series-switches/index.html");
			}
			
		},150);
}]);
