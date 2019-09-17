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

        .state('editParticipant', {
            url: '/edit-participant?pool',
            params:{pool:null},
            templateUrl: 'participant.html',
            controller: 'editParticipantController',
            // resolve: {authenticate: authenticate}
        })

        .state('editTournament', {
            url: '/edit-tournament',
            templateUrl: 'edit-tournament.html',
            controller: 'editTournamentController',
            // resolve: {authenticate: authenticate}
        })

        .state('liveStreamHome', {
            url: '/livestream',
            templateUrl: 'livestream.html',
            controller: 'liveStreamHomeController',
            // resolve: {authenticate: authenticate}
        })

        .state('addLiveStream', {
            url: '/add-livestream',
            templateUrl: 'edit-livestream.html',
            controller: 'addLiveController',
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


    };

    $scope.addTeam = function(pool1){


        window.location.href = 'http://localhost/admin-saisa-live/#!/edit-participant?pool='+$scope.tournamentData.pools[pool1].pool;

    }

    // $scope.logout = function () {
    //
    //     $cookies.remove("uname");
    //     $cookies.remove("password");
    //     $cookies.remove("gameId");
    //     $state.go('login')
    //
    // };
    $scope.editTournament = function () {

        $state.go('editTournament');

    };

    $scope.manageLive = function () {

        $state.go('liveStreamHome');

    };

});

saisaLiveAdminApp.controller('liveStreamHomeController', function ($scope, $http, $state, $cookies) {

    var tournamentId = 1;

    $http({
        method: 'GET',
        url: 'http://localhost:8080/tournaments?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;
        console.log($scope.tournamentData);



    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $http({
        method: 'GET',
        url: 'http://localhost:8080/livestreams?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.liveStreamData = response.data;
        console.log($scope.liveStreamData);

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.applyChanges = function(liveIndex){

        $http({
            method: 'POST',
            url: 'http://localhost:8080/livestreams/edit?livestreamId='+$scope.liveStreamData[liveIndex].id,
            data: {
                "active": $scope.liveStreamData[liveIndex].active,
                "description": $scope.liveStreamData[liveIndex].description,
                "live": $scope.liveStreamData[liveIndex].live,
                "tournamentId": tournamentId,
                "url": $scope.liveStreamData[liveIndex].url
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');

        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while applying the changes");
            console.log(response)
        });


    };

    $scope.viewLive = function(liveIndex){

        window.open($scope.liveStreamData[liveIndex].url);

    };

    $scope.addLiveStream = function(liveIndex){

        $state.go('addLiveStream');


    };

    $scope.home = function () {

        window.location.replace("http://localhost/admin-saisa-live/#!/tournament-home?id="+tournamentId);

    };



});

saisaLiveAdminApp.controller('addLiveController', function ($scope, $http, $state, $cookies) {

    var tournamentId = 1;

    $http({
        method: 'GET',
        url: 'http://localhost:8080/tournaments?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;
        console.log($scope.tournamentData);


    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.addLive = function () {
        $http({
            method: 'POST',
            url: 'http://localhost:8080/livestreams/new',
            data: {
                "active": $scope.activeStatus,
                "description": $scope.description,
                "live": $scope.liveStatus,
                "tournamentId": tournamentId,
                "url": $scope.url
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');
            window.location.replace("http://localhost/admin-saisa-live/#!/livestream");


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });
    };


    // $scope.logout = function () {
    //
    //     $cookies.remove("uname");
    //     $cookies.remove("password");
    //     $cookies.remove("gameId");
    //
    //     $state.go('login');
    //
    // };
    $scope.home = function () {

        window.location.replace("http://localhost/admin-saisa-live/#!/tournament-home?id="+tournamentId);

    };

});

saisaLiveAdminApp.controller('editParticipantController', function ($scope, $http, $state, $cookies, $stateParams) {

    var tournamentId = 1;

    if($stateParams.pool!=null){
        $scope.poolNumber = $stateParams.pool;
    }

    $http({
        method: 'GET',
        url: 'http://localhost:8080/tournaments/participants/?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $http({
        method: 'GET',
        url: 'http://localhost:8080/teams?teamId=0'
    }).then(function successCallback(response) {
        $scope.teams = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving the teams data");
        console.log(response)

    });



    $scope.addParticipant = function () {
        $http({
            method: 'POST',
            url: 'http://localhost:8080/tournaments/participant/new',
            data: {
                "games": 0,
                "losses": 0,
                "points": 0,
                "pool": parseInt($scope.poolNumber),
                "standing": 0,
                "teamId": parseInt($scope.team),
                "teamPhoto": $scope.teamphoto,
                "ties": 0,
                "tournamentId": tournamentId,
                "wins": 0
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');
            window.location.replace("http://localhost/admin-saisa-live/#!/tournament-home?id="+tournamentId);


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });
    };


        // $scope.logout = function () {
        //
        //     $cookies.remove("uname");
        //     $cookies.remove("password");
        //     $cookies.remove("gameId");
        //
        //     $state.go('login');
        //
        // };
        $scope.home = function () {

            window.location.replace("http://localhost/admin-saisa-live/#!/tournament-home?id="+tournamentId);

        };
});

saisaLiveAdminApp.controller('editTournamentController', function ($scope, $http, $state, $cookies) {

    var tournamentId = 1;

    $http({
        method: 'GET',
        url: 'http://localhost:8080/tournaments?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $http({
        method: 'GET',
        url: 'http://localhost:8080/sports?sportId=0'
    }).then(function successCallback(response) {
        $scope.sportData = response.data;
        console.log($scope.sportData[$scope.tournamentData.sportId-1].id);
    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.saveTournament = function () {
        $http({
            method: 'POST',
            url: 'http://localhost:8080/tournaments/edit?tournamentId='+tournamentId,
            data: {
                "endDate": $scope.tournamentData.endDate,
                "location": $scope.tournamentData.location,
                "logo": $scope.tournamentData.logo,
                "name": $scope.tournamentData.name,
                "poolQuantity": parseInt($scope.tournamentData.poolQuantity),
                "poolsActive": $scope.tournamentData.poolsActive,
                "scoresActive": $scope.tournamentData.scoresActive,
                "sportId": parseInt($scope.tournamentData.sportId),
                "standingsActive": $scope.tournamentData.standingsActive,
                "startDate": $scope.tournamentData.startDate,
                "url": $scope.tournamentData.url
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');
            window.location.replace("http://localhost/admin-saisa-live/#!/tournament-home?id="+tournamentId);


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });
    };

    $scope.home = function () {

        window.location.replace("http://localhost/admin-saisa-live/#!/tournament-home?id="+tournamentId);

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





