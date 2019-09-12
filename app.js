var volleyAdminApp = angular.module('volleyAdminApp', ['ui.router', 'ngCookies']);


volleyAdminApp.config(function ($stateProvider, $urlRouterProvider) {


    $urlRouterProvider.otherwise('/login');

    $stateProvider

        .state('login', {
            url: '/login',
            templateUrl: 'login.html',
            controller: 'loginController'
        })

        .state('score', {
            url: '/score',
            templateUrl: 'score.html',
            controller: 'scoreController',
            resolve: {authenticate: authenticate}
        })

        .state('createGallery', {
            url: '/create-gallery',
            templateUrl: 'create-gallery.html',
            controller: 'createGalleryController',
            resolve: {authenticate: authenticate}
        })

        .state('home', {
            url: '/home',
            templateUrl: 'home.html',
            controller: 'homeController',
            resolve: {authenticate: authenticate}

        })
});

function authenticate($q, $http, $state, $timeout, $cookies) {
    var uname = $cookies.get("uname");
    var password = $cookies.get("password");

    if (uname != null && password != null) {

        $http({
            method: 'POST',
            url: 'http://128.199.178.5:8080/saisa-volleyball/update/login',
            data: {
                "uname": uname,
                "password": password
            },
            transformResponse: []
        }).then(function successCallback(response) {
            $cookies.put('gameId', response.data);
            return $q.when()
        }, function errorCallback(response) {
            alert("Fail");
            // The next bit of code is asynchronously tricky.

            $timeout(function () {
                // This code runs after the authentication promise has been rejected.
                // Go to the log-in page
                $state.go('login')
            });

            // Reject the authentication promise to prevent the state from loading
            return $q.reject()
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });


    } else {
        $state.go('login');

    }
}


volleyAdminApp.controller('homeController', function ($scope, $http, $state, $cookies) {

    var uname = $cookies.get('uname');
    $scope.gameId = $cookies.get('gameId');

    if($scope.gameId!=='0') {
        $state.go('score');
    }

    $http({
        method: 'GET',
        url: 'http://128.199.178.5:8080/saisa-volleyball/get/fixtures/'
    }).then(function successCallback(response) {
        $scope.fixtures = response.data;


    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.startScoring = function () {

        var uname = $cookies.get('uname');

        $http({
            method: 'GET',
            url: 'http://128.199.178.5:8080/saisa-volleyball/update/create-session/?gameId='+$scope.game+'&uname='+uname
        }).then(function successCallback(response) {
            $cookies.put('gameId', $scope.game);
            $scope.fixtures = response.data;
            $state.go('score');
        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while starting the scoring session. Ask Anuda for help.");
            console.log(response)

        });

    };

    $scope.logout = function () {

        $cookies.remove("uname");
        $cookies.remove("password");
        $cookies.remove("gameId");
        $state.go('login')

    };
    $scope.createGallery = function () {

        $state.go('createGallery')

    };

});

volleyAdminApp.controller('createGalleryController', function ($scope, $http, $state, $cookies) {

    $scope.createGallery = function () {
        $http({
            method: 'POST',
            url: 'http://128.199.178.5:8080/saisa-volleyball/update/new-pics',
            data: {
                "galleryName": $scope.name,
                "thumbnailUrl": $scope.thumbnail,
                "url": $scope.url
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');
            window.location.replace("http://osc.lk/saisa/#!/gallery");


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });
    };


        $scope.logout = function () {

            $cookies.remove("uname");
            $cookies.remove("password");
            $cookies.remove("gameId");

            $state.go('login');

        };
        $scope.home = function () {

            $state.go('home')

        };
});

volleyAdminApp.controller('scoreController', function ($scope, $http, $state, $cookies) {


    $scope.gameId = $cookies.get('gameId');
    $scope.uname = $cookies.get('uname');

    if($scope.gameId==='0'){
        $state.go('home');
    }

    $http({
        method: 'GET',
        url: 'http://128.199.178.5:8080/saisa-volleyball/get/game-details?id='+$scope.gameId
    }).then(function successCallback(response) {
        $scope.gameDetails = response.data;
        if($scope.gameDetails.id===49||$scope.gameDetails.id===48){
            $scope.set5 = true;
        }else{
            $scope.set5 = false;

        }
    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving game data");
        console.log(response)

    });

    $scope.updateScores = function(team, change){

        var tem = 't'+team;
        var updateType = change;

        $http({
            method: 'GET',
            url: 'http://128.199.178.5:8080/saisa-volleyball/update/update?change='+updateType+'&team='+tem+'&uname='+$scope.uname
        }).then(function successCallback(response) {
            $scope.gameDetails = response.data;

        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while updating game data");
            console.log(response)

        });

    };

    $scope.newSet = function(){
        $http({
            method: 'GET',
            url: 'http://128.199.178.5:8080/saisa-volleyball/update/end-set?uname='+$scope.uname
        }).then(function successCallback(response) {
            $scope.gameDetails = response.data;

        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while updating game data");
            console.log(response)

        });
    };

    $scope.endGame = function(){
        $http({
            method: 'GET',
            url: 'http://128.199.178.5:8080/saisa-volleyball/update/end-session?uname='+$scope.uname
        }).then(function successCallback(response) {
            $cookies.remove('gameId');
            window.location.replace("http://osc.lk/saisa/#!/match-details?tgId=" + $scope.gameId );

        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while updating game data");
            console.log(response)

        });
    };

    $scope.logout = function () {

        $cookies.remove("uname");
        $cookies.remove("password");
        $cookies.remove("gameId");
        $state.go('login')


    };


});


volleyAdminApp.controller('loginController', function ($scope, $http, $cookies, $state) {


    $scope.login = function () {
        $http({
            method: 'POST',
            url: 'http://128.199.178.5:8080/saisa-volleyball/update/login',
            data: {
                "uname": $scope.username,
                "password": $scope.password
            },
            transformResponse: []
        }).then(function successCallback(response) {
            $scope.response = response.data;

            // $cookies.put("key", $scope.key);
            $cookies.put("uname", $scope.username);
            $cookies.put("password", $scope.password);
            $cookies.put("gameId", $scope.response);



                $state.go('home');

            console.log($scope.response);


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("Login Failed, Please try again");
            console.log(response)

        });

    }


});





