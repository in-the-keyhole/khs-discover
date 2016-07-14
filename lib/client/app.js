(function(angular){

    function configFunc () {

    }

    mainController.$inject = ['$scope', '$http'];
    function mainController($scope, $http) {
        $http.get('api/instanceInfo')
            .success(function(data){
                $scope.info = data;
            });

        getApps();
        function getApps(){
            $http.get('api/apps')
                .success(function(data){
                    $scope.apps = data;
                });
            setTimeout(getApps,5000);
        }


    }

    angular.module('khs-discover', [])
        .config(configFunc)
        .controller('MainController',mainController);

})(angular);