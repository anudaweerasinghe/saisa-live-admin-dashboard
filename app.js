var saisaLiveAdminApp = angular.module('saisaLiveAdminApp', ['ui.router', 'ngCookies']);


saisaLiveAdminApp.config(function ($stateProvider, $urlRouterProvider) {


    $urlRouterProvider.otherwise('/login');

    $stateProvider

        .state('tournament', {
            url: '/tournament-home?id',
            params:{id:null},
            templateUrl: 'tournament.html',
            controller: 'tournamentHomeController',
            resolve: {authenticate: authenticate}

        })

        .state('editParticipant', {
            url: '/edit-participant?pool',
            params:{pool:null},
            templateUrl: 'participant.html',
            controller: 'editParticipantController',
            resolve: {authenticate: authenticate}
        })

        .state('editTournament', {
            url: '/edit-tournament?id',
            params:{id:null},
            templateUrl: 'edit-tournament.html',
            controller: 'editTournamentController',
            resolve: {authenticate: authenticate}
        })

        .state('liveStreamHome', {
            url: '/livestream',
            templateUrl: 'livestream.html',
            controller: 'liveStreamHomeController',
            resolve: {authenticate: authenticate}
        })

        .state('addLiveStream', {
            url: '/add-livestream',
            templateUrl: 'edit-livestream.html',
            controller: 'addLiveController',
            resolve: {authenticate: authenticate}
        })

        .state('mediaHome', {
            url: '/media',
            templateUrl: 'media.html',
            controller: 'mediaHomeController',
            resolve: {authenticate: authenticate}
        })

        .state('editMedia', {
            url: '/edit-media?id&mediaType',
            params:{id:null, mediaType:null},
            templateUrl: 'edit-media.html',
            controller: 'editMediaController',
            resolve: {authenticate: authenticate}
        })

        .state('gamesHome', {
            url: '/games',
            templateUrl: 'games.html',
            controller: 'gamesHomeController',
            resolve: {authenticate: authenticate}
        })

        .state('editGames', {
            url: '/edit-games?id',
            params:{id:null},
            templateUrl: 'edit-games.html',
            controller: 'editGamesController',
            resolve: {authenticate: authenticate}
        })

        .state('scoreGames', {
            url: '/score?id',
            params:{id:null},
            templateUrl: 'score-games.html',
            controller: 'scoreGamesController',
            resolve: {authenticate: authenticate}
        })


        .state('login', {
            url: '/login',
            templateUrl: 'login.html',
            controller: 'loginController'
        })

        .state('admin', {
            url: '/admin-home',
            templateUrl: 'admin.html',
            controller: 'adminHomeController',
            resolve: {authenticate: adminAuthenticate}

        })

        .state('adminAccounts', {
            url: '/admin-accounts?tournamentId',
            params:{tournamentId:null},
            templateUrl: 'admin-accounts.html',
            controller: 'accountsHomeController',
            resolve: {authenticate: adminAuthenticate}
        })

        .state('editAdminAccounts', {
            url: '/edit-account?id&tournamentId&username',
            params:{id:null, tournamentId:null, username:null},
            templateUrl: 'edit-account.html',
            controller: 'editAdminAccountsController',
            resolve: {authenticate: adminAuthenticate}
        })

});

function authenticate($q, $http, $state, $timeout, $cookies) {
    var username = $cookies.get("username");
    var password = $cookies.get("password");

    if (username != null && password != null) {
        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/admin/verify',
            data: {
                "username": username,
                "password": password
            },
            transformResponse: []
        }).then(function successCallback(response) {
           return $q.when()         //Allow access to page
        }, function errorCallback(response) {
            alert("Fail");      //Show unauthorized error
            $timeout(function () {
                $state.go('login')      //Redirect to login page
            });
            return $q.reject()      //Reject request for access to the page

        });
    } else {
        $state.go('login');
    }
}

function adminAuthenticate($q, $http, $state, $timeout, $cookies, $stateParams) {
    var username = $cookies.get("username");
    var password = $cookies.get("password");

    if (username != null && password != null) {

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/admin/verify',
            data: {
                "username": username,
                "password": password
            },
        }).then(function successCallback(response) {
            if(response.data === ""){
                return $q.when()
            }else{
                alert("Sorry, your account is not authorized to access the Admin portal");
                $state.go('login')
            }
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

    $scope.adminUser = false;
    if($cookies.get("access")==="0"){
        $scope.adminUser = true;
    }
    $cookies.remove("workingTournament");
    $cookies.put("workingTournament", tournamentId);

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments/participants/?tournamentId='+tournamentId
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
            url: 'http://142.93.212.170:8080/saisa-live/tournaments/participant/edit?participantId='+$scope.tournamentData.pools[pool].participants[participantId].id,
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


        window.location.href = 'http://142.93.212.170/admin-saisa-live/#!/edit-participant?pool='+$scope.tournamentData.pools[pool1].pool;

    }

    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };
    $scope.editTournament = function () {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/edit-tournament?id="+tournamentId);

    };

    $scope.manageLive = function () {

        $state.go('liveStreamHome');

    };

    $scope.media = function () {

        $state.go('mediaHome');

    };

    $scope.games = function () {

        $state.go('gamesHome');

    };

    $scope.adminHome = function(){
        $state.go("admin");

    }

});

saisaLiveAdminApp.controller('liveStreamHomeController', function ($scope, $http, $state, $cookies) {

    var tournamentId = $cookies.get("workingTournament");

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId='+tournamentId
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
        url: 'http://142.93.212.170:8080/saisa-live/livestreams/admin?tournamentId='+tournamentId
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
            url: 'http://142.93.212.170:8080/saisa-live/livestreams/edit?livestreamId='+$scope.liveStreamData[liveIndex].id,
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

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);

    };


    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };
});

saisaLiveAdminApp.controller('mediaHomeController', function ($scope, $http, $state, $cookies) {

    $scope.newsText = false;

    var tournamentId = $cookies.get("workingTournament");

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId=' + tournamentId
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
        url: 'http://142.93.212.170:8080/saisa-live/media/admin?tournamentId='+tournamentId+'&type='+1
    }).then(function successCallback(response) {
        $scope.photos = response.data;

        var ts = new Date;


        for(var i=0; i<$scope.photos.length;i++){

            let ts = new Date($scope.photos[i].timestamp*1000);
            console.log(ts);
            console.log(ts.toDateString());
            $scope.photos[i].timestamp = ts.toDateString();
        }

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)
    });

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/media/admin?tournamentId='+tournamentId+'&type='+2
    }).then(function successCallback(response) {
        $scope.videos = response.data;

        var ts = new Date;


        for(var i=0; i<$scope.videos.length;i++){

            let ts = new Date($scope.videos[i].timestamp*1000);
            console.log(ts);
            console.log(ts.toDateString());
            $scope.videos[i].timestamp = ts.toDateString();
        }
    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)
    });

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/media/admin?tournamentId='+tournamentId+'&type='+3
    }).then(function successCallback(response) {
        $scope.news = response.data;

        var ts = new Date;


        for(var i=0; i<$scope.news.length;i++){

            let ts = new Date($scope.news[i].timestamp*1000);
            console.log(ts);
            console.log(ts.toDateString());
            $scope.news[i].timestamp = ts.toDateString();
        }
    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)
    });

    $scope.applyPhotoChanges = function(photoIndex){

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/media/edit?mediaId='+$scope.photos[photoIndex].id,
            data: {
                "active": $scope.photos[photoIndex].active,
                "contentUrl": $scope.photos[photoIndex].contentUrl,
                "coverImg": $scope.photos[photoIndex].coverImg,
                "text": $scope.photos[photoIndex].text,
                "title": $scope.photos[photoIndex].title,
                "tournamentId": tournamentId,
                "type": $scope.photos[photoIndex].type
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');

            window.location.reload();
        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while applying the changes");
            console.log(response)
        });
    };

    $scope.applyVideoChanges = function(videoIndex){

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/media/edit?mediaId='+$scope.videos[videoIndex].id,
            data: {
                "active": $scope.videos[videoIndex].active,
                "contentUrl": $scope.videos[videoIndex].contentUrl,
                "coverImg": $scope.videos[videoIndex].coverImg,
                "text": $scope.videos[videoIndex].text,
                "title": $scope.videos[videoIndex].title,
                "tournamentId": tournamentId,
                "type": $scope.videos[videoIndex].type
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');

            window.location.reload();
        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while applying the changes");
            console.log(response)
        });
    };

    $scope.applyNewsChanges = function(newsIndex){

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/media/edit?mediaId='+$scope.news[newsIndex].id,
            data: {
                "active": $scope.news[newsIndex].active,
                "contentUrl": $scope.news[newsIndex].contentUrl,
                "coverImg": $scope.news[newsIndex].coverImg,
                "text": $scope.news[newsIndex].text,
                "title": $scope.news[newsIndex].title,
                "tournamentId": tournamentId,
                "type": $scope.news[newsIndex].type
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');

            window.location.reload();
        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while applying the changes");
            console.log(response)
        });
    };



    $scope.viewCover = function(type, contentIndex){

        if(type ==1) {
            window.open($scope.photos[contentIndex].coverImg);
        }else if(type ==2){
            window.open($scope.videos[contentIndex].coverImg);

        }else{
            window.open($scope.news[contentIndex].coverImg);
        }
    };

    $scope.viewMedia = function(type, contentIndex){

        if(type ==1) {
            window.open($scope.photos[contentIndex].contentUrl);
        }else if(type == 2){
            window.open($scope.videos[contentIndex].contentUrl);

        }else if(type==3){
            window.location.replace("http://142.93.212.170/admin-saisa-live/#!/edit-media?id="+$scope.news[contentIndex].id);

        }
    };

    $scope.addMedia = function(type){
        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/edit-media?mediaType="+type);
    };


    $scope.home = function () {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);

    };

    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };
});

saisaLiveAdminApp.controller('gamesHomeController', function ($scope, $http, $state, $cookies) {


    var tournamentId =     $cookies.get("workingTournament");

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId=' + tournamentId
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
        url: 'http://142.93.212.170:8080/saisa-live/games?activeStatus=1&tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.liveGames = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)
    });

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/games?activeStatus=0&tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.upcomingGames = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)
    });

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/games?activeStatus=2&tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.completedGames = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)
    });

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/games?activeStatus=3&tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.inactiveGames = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)
    });


    $scope.applyLiveChanges = function(liveIndex){

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/games/status?gameId='+$scope.liveGames[liveIndex].id+'&newStatus='+$scope.liveGames[liveIndex].activeStatus,

        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');
            window.location.reload();


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });

    };

    $scope.applyUpcomingChanges = function(upcomingIndex){

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/games/status?gameId='+$scope.upcomingGames[upcomingIndex].id+'&newStatus='+$scope.upcomingGames[upcomingIndex].activeStatus,

        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');
            window.location.reload();


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });

    };

    $scope.applyCompletedChanges = function(completedIndex){

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/games/result?gameId='+$scope.completedGames[completedIndex].id+'&result='+$scope.completedGames[completedIndex].result,

        }).then(function successCallback(response) {
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/games/status?gameId='+$scope.completedGames[completedIndex].id+'&newStatus='+$scope.completedGames[completedIndex].activeStatus,

            }).then(function successCallback(response) {
                alert('Databases Successfully Updated');
                window.location.reload();


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });

    };

    $scope.applyInactiveChanges = function(inactiveIndex){

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/games/result?gameId='+$scope.inactiveGames[inactiveIndex].id+'&result='+$scope.inactiveGames[inactiveIndex].result,

        }).then(function successCallback(response) {
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/games/status?gameId='+$scope.inactiveGames[inactiveIndex].id+'&newStatus='+$scope.inactiveGames[inactiveIndex].activeStatus,

            }).then(function successCallback(response) {
                alert('Databases Successfully Updated');
                window.location.reload();


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });

    };



    $scope.viewLive = function(type, index){
      if(type ===1){
          window.open($scope.liveGames[index].livestream.url);
      }else if(type === 0){
          window.open($scope.upcomingGames[index].livestream.url);
      }else if(type === 2){
          window.open($scope.completedGames[index].livestream.url);
      }else{
          window.open($scope.inactiveGames[index].livestream.url);

      }
    };

    $scope.home = function () {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);

    };

    $scope.editGames = function (gameId) {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/edit-games?id="+gameId);

    };

    $scope.addGames = function(){
        $state.go('editGames');
    };

    $scope.startScoring = function(gameId){
        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/score?id="+gameId);
    }

    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };
});

saisaLiveAdminApp.controller('editGamesController', function ($scope, $http, $state, $cookies, $stateParams) {

    var tournamentId =     $cookies.get("workingTournament");

    $scope.newGames = true;
    $scope.editGames = false;

    if($stateParams.id!=null) {
        $scope.editGames = true;
        $scope.newGames = false;

        $http({
            method: 'GET',
            url: 'http://142.93.212.170:8080/saisa-live/games?gameId=' + $stateParams.id
        }).then(function successCallback(response) {

            $scope.gameData = response.data;

            $scope.mT1 = $scope.gameData[0].team1.id.toString();
            $scope.mT2 = $scope.gameData[0].team2.id.toString();

            $scope.gameDescription = $scope.gameData[0].gameDescription;
            $scope.location = $scope.gameData[0].location;
            $scope.startTime = $scope.gameData[0].startTime;


            $scope.mLivestream = $scope.gameData[0].livestream.id.toString();
            $scope.mActiveStatus = $scope.gameData[0].activeStatus.toString();


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while retrieving your data");
            console.log(response)

        });

    }

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId=' + tournamentId
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
        url: 'http://142.93.212.170:8080/saisa-live/tournaments/participants/minified?tournamentId=' + tournamentId
    }).then(function successCallback(response) {

        $scope.teams = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/livestreams?tournamentId=' + tournamentId
    }).then(function successCallback(response) {

        $scope.livestreams = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.saveGames = function(){
        console.log("lol");

        if($scope.newGames === true){

            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/games/new',
                data: {
                    "activeStatus": parseInt($scope.mActiveStatus),
                    "gameDescription": $scope.gameDescription,
                    "livestreamId": parseInt($scope.mLivestream),
                    "location": $scope.location,
                    "result": 0,
                    "startTime": $scope.startTime,
                    "team1": parseInt($scope.mT1),
                    "team1Score": "",
                    "team2": parseInt($scope.mT2),
                    "team2Score": "",
                    "tournamentId": tournamentId
                }
            }).then(function successCallback(response) {
                alert('Databases Successfully Updated');
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/games");


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });

        }else{
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/games/edit?gameId='+$stateParams.id,
                data: {
                    "activeStatus": parseInt($scope.mActiveStatus),
                    "gameDescription": $scope.gameDescription,
                    "livestreamId": parseInt($scope.mLivestream),
                    "location": $scope.location,
                    "result": $scope.gameData[0].result,
                    "startTime": $scope.startTime,
                    "team1": parseInt($scope.mT1),
                    "team1Score": $scope.gameData[0].team1Score,
                    "team2": parseInt($scope.mT2),
                    "team2Score": $scope.gameData[0].team2Score,
                    "tournamentId": tournamentId
                }
            }).then(function successCallback(response) {
                alert('Databases Successfully Updated');
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/games");


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        }

    };


    $scope.back = function () {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/games");

    };

    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };
});

saisaLiveAdminApp.controller('scoreGamesController', function ($scope, $http, $state, $cookies, $stateParams) {

    var tournamentId =     $cookies.get("workingTournament");


    $scope.gameComplete = false;

    if($stateParams.id!=null) {
        $http({
            method: 'GET',
            url: 'http://142.93.212.170:8080/saisa-live/games?gameId=' + $stateParams.id
        }).then(function successCallback(response) {

            $scope.gameData = response.data;

            $scope.gameDescription = $scope.gameData[0].gameDescription;
            $scope.team1Score = $scope.gameData[0].team1Score;
            $scope.team2Score = $scope.gameData[0].team2Score;

            $scope.team1 = $scope.gameData[0].team1.team.name;
            $scope.team2 = $scope.gameData[0].team2.team.name;

            if($scope.gameData[0].activeStatus===0){
                $http({
                    method: 'POST',
                    url: 'http://142.93.212.170:8080/saisa-live/games/status?gameId='+$stateParams.id+'&newStatus='+1,

                }).then(function successCallback(response) {
                    $scope.gameData[0].activeStatus=1;
                    window.location.reload();


                }, function errorCallback(response) {
                    // The next bit of code is asynchronously tricky.
                    alert("We encountered an error while saving your information.");
                    console.log(response)
                });
            }


            $scope.activeStatus = $scope.gameData[0].activeStatus;


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while retrieving your data");
            console.log(response)

        });

    }else{
        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/games");

    }

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId=' + tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;
        console.log($scope.tournamentData);


    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.saveScores = function(){

        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/games/scores?gameId='+$stateParams.id+'&t1Score='+$scope.team1Score+'&t2Score='+$scope.team2Score,

        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });
    };

    $scope.endGame = function(){
        $scope.gameComplete = true;

    };

    $scope.saveResult = function(){
        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/games/result?gameId='+$stateParams.id+'&result='+parseInt($scope.result)

        }).then(function successCallback(response) {
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/games/status?gameId='+$stateParams.id+'&newStatus=2',

            }).then(function successCallback(response) {
                alert('Databases Successfully Updated. You can update standings in the next page');
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });

    };

    $scope.back = function () {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/games");

    };

    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };

});

saisaLiveAdminApp.controller('editMediaController', function ($scope, $http, $state, $cookies, $stateParams) {

    var tournamentId = $cookies.get("workingTournament");


    $scope.isNews = false;
    $scope.typeSelected=false;

    $scope.newMedia = true;
    $scope.editMedia = false;

    console.log($stateParams.mediaType);

    if($stateParams.id!=null){
        $scope.editMedia = true;
        $scope.newMedia = false;

        $scope.typeSelected=true;
        $http({
            method: 'GET',
            url: 'http://142.93.212.170:8080/saisa-live/media?mediaId='+$stateParams.id+'&tournamentId=0&type=0'
        }).then(function successCallback(response) {
            $scope.mediaData = response.data;

            $scope.mType = $scope.mediaData.type.toString();
            $scope.title = $scope.mediaData.title;
            $scope.coverImg = $scope.mediaData.coverImg;
            $scope.active = $scope.mediaData.active;
            $scope.contentUrl = $scope.mediaData.contentUrl;
            $scope.text = $scope.mediaData.text;

            if($scope.mediaData.type===3){
                $scope.isNews = true;
            }

        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while retrieving your data");
            console.log(response)

        });

    }
    if($stateParams.mediaType!=null) {
        $scope.typeSelected = true;
        $scope.mType=$stateParams.mediaType;
        if ($stateParams.mediaType === "3") {
            $scope.isNews = true;
            console.log($scope.isNews);
        }
    }

    $scope.selectMedia = function(){

        $scope.typeSelected=true;
        if($scope.mType==="3"){
            $scope.isNews = true;
        }

    };

    $scope.saveMedia = function () {
        if($scope.editMedia){
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/media/edit?mediaId='+$stateParams.id,
                data: {
                    "active": $scope.active,
                    "contentUrl": $scope.contentUrl,
                    "coverImg": $scope.coverImg,
                    "text": $scope.text,
                    "title": $scope.title,
                    "tournamentId": tournamentId,
                    "type": parseInt($scope.mType)
                }
            }).then(function successCallback(response) {
                alert('Databases Successfully Updated');
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/media");


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        }

        if($scope.newMedia){
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/media/new',
                data: {
                    "active": $scope.active,
                    "contentUrl": $scope.contentUrl,
                    "coverImg": $scope.coverImg,
                    "text": $scope.text,
                    "title": $scope.title,
                    "tournamentId": tournamentId,
                    "type": parseInt($scope.mType)
                }
            }).then(function successCallback(response) {
                alert('Databases Successfully Updated');
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/media");


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        }

    };


    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;
        console.log($scope.tournamentData);


    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.home = function () {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);

    };


});

saisaLiveAdminApp.controller('addLiveController', function ($scope, $http, $state, $cookies) {

    var tournamentId = $cookies.get("workingTournament");

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId='+tournamentId
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
            url: 'http://142.93.212.170:8080/saisa-live/livestreams/new',
            data: {
                "active": $scope.activeStatus,
                "description": $scope.description,
                "live": $scope.liveStatus,
                "tournamentId": tournamentId,
                "url": $scope.url
            }
        }).then(function successCallback(response) {
            alert('Databases Successfully Updated');
            window.location.replace("http://142.93.212.170/admin-saisa-live/#!/livestream");


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });
    };


    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };

    $scope.home = function () {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);

    };

});

saisaLiveAdminApp.controller('editParticipantController', function ($scope, $http, $state, $cookies, $stateParams) {

    var tournamentId = $cookies.get("workingTournament");

    if($stateParams.pool!=null){
        $scope.poolNumber = $stateParams.pool;
    }

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments/participants/?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/teams?teamId=0'
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
            url: 'http://142.93.212.170:8080/saisa-live/tournaments/participant/new',
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
            window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);


        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while saving your information.");
            console.log(response)
        });
    };


    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };

    $scope.home = function () {

        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);
    };
});

saisaLiveAdminApp.controller('editTournamentController', function ($scope, $http, $state, $cookies, $stateParams) {

    $scope.newTournament = true;
    $scope.editTournament = false;

    if($stateParams.id!=null){

        $scope.editTournament = true;
        $scope.newTournament = false;
        var tournamentId = $stateParams.id;

        $http({
            method: 'GET',
            url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId='+tournamentId
        }).then(function successCallback(response) {
            $scope.tournamentData = response.data;

        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("We encountered an error while retrieving your data");
            console.log(response)

        });
    }


    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/sports?sportId=0'
    }).then(function successCallback(response) {
        $scope.sportData = response.data;
    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.saveTournament = function () {

        if($stateParams.id!=null){
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/tournaments/edit?tournamentId='+$stateParams.id,
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

                $http({
                    method: 'POST',
                    url: 'http://142.93.212.170:8080/saisa-live/tournaments/status?newStatus=+'+$scope.tournamentData.active+'+&tournamentId='+tournamentId,
                }).then(function successCallback(response) {

                    alert('Databases Successfully Updated');
                    window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+tournamentId);


                }, function errorCallback(response) {
                    // The next bit of code is asynchronously tricky.
                    alert("We encountered an error while saving your information.");
                    console.log(response)
                });


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        }else{
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/tournaments/new',
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
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/admin-home");

            }, function errorCallback(response) {
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        }

    };

    $scope.home = function () {

        if($scope.editTournament==true) {
            window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id=" + tournamentId);
        }else{
            $state.go("admin");
        }
    };

    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };

});

saisaLiveAdminApp.controller('adminHomeController', function ($scope, $http, $state, $cookies) {

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId=' + 0
    }).then(function successCallback(response) {
        $scope.activeTournaments = response.data;
    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });


    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments/inactive'
    }).then(function successCallback(response) {
        $scope.inActiveTournaments = response.data;


    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.manageTournament = function(id){
        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id=" + id);

    };

    $scope.createTournament = function(id){
        $state.go("editTournament");

    };

    $scope.manageAdminAccounts = function(id){
        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/admin-accounts?tournamentId=" + id);
    };

    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };
});

saisaLiveAdminApp.controller('accountsHomeController', function ($scope, $http, $state, $cookies, $stateParams) {

    var tournamentId = $stateParams.tournamentId;

    if( $stateParams.tournamentId == null){
        $state.go("admin");
    }


    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId='+tournamentId
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
        url: 'http://142.93.212.170:8080/saisa-live/admin?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.adminAccountData = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.createAccount = function(){
        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/edit-account?tournamentId="+tournamentId);
    };

    $scope.editCredentials = function(id, username){
        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/edit-account?tournamentId="+tournamentId+'&id='+id+'&username='+username);

    };

    $scope.home = function(){
        $state.go("admin");
    };
    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };

});

saisaLiveAdminApp.controller('editAdminAccountsController', function ($scope, $http, $state, $cookies, $stateParams) {


    $scope.newAccount = true;
    $scope.editAccount = false;

    var tournamentId = $stateParams.tournamentId;

    if($stateParams.tournamentId == null){
        $state.go("admin");
    }

    if($stateParams.id!=null){
        $scope.editAccount = true;
        $scope.newAccount = false;
        if($stateParams.username===null){
            $state.go("admin");
        }
        $scope.username = $stateParams.username;
    }

    $http({
        method: 'GET',
        url: 'http://142.93.212.170:8080/saisa-live/tournaments?tournamentId='+tournamentId
    }).then(function successCallback(response) {
        $scope.tournamentData = response.data;

    }, function errorCallback(response) {
        // The next bit of code is asynchronously tricky.
        alert("We encountered an error while retrieving your data");
        console.log(response)

    });

    $scope.saveCredentials = function(){
        var creatorUsername = $cookies.get("username");
        var creatorPassword = $cookies.get("password");

        if($scope.editAccount === true){
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/admin/edit',
                data: {
                    "active": $scope.activeStatus,
                    "creatorPassword": creatorPassword,
                    "creatorUsername": creatorUsername,
                    "password": $scope.password,
                    "tournamentId": tournamentId,
                    "username": $scope.username
                }
            }).then(function successCallback(response) {

                alert('Databases Successfully Updated');
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/admin-accounts?tournamentId="+tournamentId);


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        }else{
            $http({
                method: 'POST',
                url: 'http://142.93.212.170:8080/saisa-live/admin/new',
                data: {
                    "active": $scope.activeStatus,
                    "creatorPassword": creatorPassword,
                    "creatorUsername": creatorUsername,
                    "password": $scope.password,
                    "tournamentId": tournamentId,
                    "username": $scope.username
                }
            }).then(function successCallback(response) {

                alert('Databases Successfully Updated');
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/admin-accounts?tournamentId="+tournamentId);


            }, function errorCallback(response) {
                // The next bit of code is asynchronously tricky.
                alert("We encountered an error while saving your information.");
                console.log(response)
            });
        }

    };

    $scope.logout = function () {

        $cookies.remove("username");
        $cookies.remove("password");
        $cookies.remove("access");
        $cookies.remove("workingTournament");

        $state.go('login')

    };

    $scope.back = function(){
        window.location.replace("http://142.93.212.170/admin-saisa-live/#!/admin-accounts?tournamentId=" + tournamentId);
    }
});

saisaLiveAdminApp.controller('loginController', function ($scope, $http, $cookies, $state) {


    $scope.login = function () {
        $http({
            method: 'POST',
            url: 'http://142.93.212.170:8080/saisa-live/admin/verify',
            data: {
                "username": $scope.username,
                "password": $scope.password
            },
        }).then(function successCallback(response) {
            $scope.response = response.data;

            if($scope.response === ""){         //Response is blank if the account has full access
                console.log("admin");
                $cookies.put("access", 0);      //Access level is set to 0 if account has full access
                $cookies.put("username", $scope.username);
                $cookies.put("password", $scope.password);

                $state.go('admin');

            }else{
                $cookies.put("access", $scope.response.id);    //Response contains tournamentId user has access to if user only has tournament level access
                $cookies.put("username", $scope.username);
                $cookies.put("password", $scope.password);
                window.location.replace("http://142.93.212.170/admin-saisa-live/#!/tournament-home?id="+$scope.response.id);

            }

        }, function errorCallback(response) {
            // The next bit of code is asynchronously tricky.
            alert("Login Failed, Please try again");
            console.log(response)

        });

    }


});





