var saisaLiveAdminApp = angular.module('saisaLiveAdminApp', ['ui.router', 'ngCookies']);


saisaLiveAdminApp.config(function ($stateProvider, $urlRouterProvider) {


    $urlRouterProvider.otherwise('/tournament-home');

    $stateProvider

        .state('tournament', {
            url: '/tournament-home?id',
            params:{id:null},
            templateUrl: 'tournament.html',
            controller: 'tournamentHomeController',
            // resolve: {authenticate: authenticate}

        })

        .state('login', {
            url: '/login',
            templateUrl: 'login.html',
            controller: 'loginController'
        })

        .state('score', {
            url: '/score',
            templateUrl: 'score.html',
            controller: 'scoreController'
        })

        .state('createGallery', {
            url: '/create-gallery',
            templateUrl: 'create-gallery.html',
            controller: 'createGalleryController',
            // resolve: {authenticate: authenticate}
        })


});

function authenticate($q, $http, $state, $timeout, $cookies, $stateParams) {
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


saisaLiveAdminApp.controller('tournamentHomeController', function ($scope, $http, $state, $cookies, $stateParams) {

    var tournamentId = $stateParams.id;

    $http({
        method: 'GET',
        url: 'http://localhost:8080/tournaments/participants/?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;
        console.log($scope.tournamentData);

        $scope.pools = $scope.tournamentData.pools;


    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.applyChanges = function(participantId, pool){

        $http({
            method: 'POST',
            url: 'http://localhost:8080/tournaments/participant/edit?participantId='+$scope.tournamentData.pools[pool].participants[participantId].id,
            data: {
                "active": $scope.tournamentData.pools[pool].participants[participantId].active,
                "games": $scope.tournamentData.pools[pool].participants[participantId].games,
                "losses": $scope.tournamentData.pools[pool].participants[participantId].losses,
                "points": $scope.tournamentData.pools[pool].participants[participantId].points,
                "standing": $scope.tournamentData.pools[pool].participants[participantId].standing,
                "ties": $scope.tournamentData.pools[pool].participants[participantId].ties,
                "wins": $scope.tournamentData.pools[pool].participants[participantId].wins
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');

        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while applying the changes");
            console.log(response)
        });


    }

    // $scope.logout = function () {
    //
    //     $cookies.remove("uname");
    //     $cookies.remove("password");
    //     $cookies.remove("gameId");
    //     $state.go('login')
    //
    // };
    // $scope.createGallery = function () {
    //
    //     $state.go('createGallery')
    //
    // };

});

saisaLiveAdminApp.controller('createGalleryController', function ($scope, $http, $state, $cookies) {

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

saisaLiveAdminApp.controller('scoreController', function ($scope, $http, $state, $cookies) {


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


saisaLiveAdminApp.controller('loginController', function ($scope, $http, $cookies, $state) {


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





