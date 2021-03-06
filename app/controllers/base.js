/**
 * @overview The parent controller that stores all function used in the child controllers.
 * @author Martin Vach
 */

/**
 * Angular module instance
 */

var appController = angular.module('appController', []);
/**
 * The app base controller.
 * @class BaseController
 */
appController.controller('BaseController', function ($scope, $rootScope, $cookies, $filter, $location, $anchorScroll, $window, $route, $interval, $timeout, cfg, dataService, deviceService, myCache) {
    $scope.loading = false;
    $scope.alert = {message: false, status: 'is-hidden', icon: false};
    $scope.languages = {};


    // Custom IP
    $scope.customIP = {
        'url': cfg.server_url,
        'message': false,
        'connected': false
    };
    $scope.showHome = true;
    if (cfg.custom_ip === true) {
        $scope.showHome = false;
    }

    // Url array
    $scope.urlArray = [];


    // Show page content
    $scope.showContent = false;
    // Global config
    $scope.cfg = cfg;

// Lang settings
    $scope.lang_list = cfg.lang_list;
    // Set language
    $scope.lang = (angular.isDefined($cookies.lang) ? $cookies.lang : cfg.lang);
    $('.current-lang').html($scope.lang);
    $scope.changeLang = function (lang) {
        $window.alert($scope._t('language_select_reload_interface'));
        $cookies.lang = lang;
        $scope.lang = lang;
    };
    // Load language files
    $scope.loadLang = function (lang) {
        // Is lang in language list?
        var lang = (cfg.lang_list.indexOf(lang) > -1 ? lang : cfg.lang);
        dataService.getLanguageFile(lang).then(function (response) {
            angular.extend($scope.languages, response.data);
        }, function (error) {
        });
        // todo: deprecated
        /*// Is lang in language list?
        var lang = (cfg.lang_list.indexOf(lang) > -1 ? lang : cfg.lang);
        dataService.getLanguageFile(function (data) {
            $cookies.langFile = {'ab': 25};
            $scope.languages = data;
        }, lang);*/


    };
    // Get language lines
    $scope._t = function (key, replacement) {
        return deviceService.getLangLine(key, $scope.languages, replacement);
    };

    // Watch for lang change
    //TODO: display a dialog "Page will be reloaded..." and auto reload page
    $scope.$watch('lang', function () {
        $('.current-lang').html($scope.lang);
        $scope.loadLang($scope.lang);
    });
    // Order by
    $scope.orderBy = function (field) {
        $scope.predicate = field;
        $scope.reverse = !$scope.reverse;
    };
    // Get body ID
    $scope.getBodyId = function () {
        var path = $location.path();
        var lastSegment = path.split('/').pop();
        $scope.urlArray = path.split('/');
        return lastSegment;
    };
    /*
     * Menu active class
     */
    $scope.isActive = function (route, segment) {
        var path = $location.path().split('/');
        return (route === path[segment] ? 'active' : '');
    };
    
    /**
     * Check if route match the pattern.
     * @param {string} path
     * @returns {Boolean}
     */
    $scope.routeMatch = function (path) {
        if ($route.current && $route.current.regexp) {
            return $route.current.regexp.test(path);
        }
        return false;
    };

    /**
     *
     * Mobile detect
     */
    $scope.isMobile = deviceService.isMobile(navigator.userAgent || navigator.vendor || window.opera);

    $scope.scrollTo = function (id) {
        $location.hash(id);
        $anchorScroll();
    };

    /**
     *Reload data
     */
    $scope.reloadData = function () {

        myCache.removeAll();
        $route.reload();
    };

    // todo: deprecated
    /**
     * Route on change start
     */
    /*$rootScope.$on("$routeChangeStart", function(event, next, current) {
        if(config_data.cfg.app_type === "installer") {
            console.log(event);
            console.log(current);
            var input = config_data.cfg.auth;
            dataService.logInApi(input).then(function (response) {
                var user = response.data.data;
                deviceService.setZWAYSession(user.sid);
                deviceService.setUser(user);
                //$window.location.reload();
            }, function (error) {
                $scope.loading = false;
                var message = $scope._t('error_load_data');
                if (error.status == 401) {
                    message = $scope._t('error_load_user');
                }
                alertify.alertError(message);
            });
        }
        console.log(event);
        console.log(current);
    });*/

    $scope.naviExpanded = {};
    /**
     * Expand/collapse navigation
     * @param {string} key
     * @param {object} $event
     * @param {boolean} status
     * @returns {undefined}
     */
    $scope.expandNavi = function (key, $event, status) {
        if ($scope.naviExpanded[key]) {
            $scope.naviExpanded = {};
            $event.stopPropagation();
            return;
        }
        $scope.naviExpanded = {};
        if (typeof status === 'boolean') {
            $scope.naviExpanded[key] = status;
        } else {
            $scope.naviExpanded[key] = !$scope.naviExpanded[key];
        }
        $event.stopPropagation();
    };
    // Collapse element/menu when clicking outside
    window.onclick = function () {
        if ($scope.naviExpanded) {
            angular.copy({}, $scope.naviExpanded);
            $scope.$apply();
        }
    };

    $scope.modalArr = {};
    /**
     * Open/close a modal window
     * @param {string} key
     * @param {object} $event
     * @param {boolean} status
     * @returns {undefined}
     */
    $scope.handleModal = function (key, $event, status) {
       if (typeof status === 'boolean') {
            $scope.modalArr[key] = status;
        } else {
           if(key){
               $scope.modalArr[key] = !($scope.modalArr[key]);
           }else{
               $scope.modalArr = {};
           }

        }
        if($event){
            $event.stopPropagation();
        }

    };
    // Collapse element/menu when clicking outside
    window.onclick = function () {
        if ($scope.naviExpanded) {
            angular.copy({}, $scope.naviExpanded);
            $scope.$apply();
        }
    };

    $scope.filterExpanded = {};
    /**
     * Expand/collapse filter
     * @param {string} key
     * @param {object} $event
     * @param {boolean} status
     * @returns {undefined}
     */
    $scope.expandFilter = function (key, $event, status) {
        if ($scope.filterExpanded[key]) {
            $scope.filterExpanded = {};
            $event.stopPropagation();
            return;
        }
        $scope.filterExpanded = {};
        if (typeof status === 'boolean') {
            $scope.filterExpanded[key] = status;
        } else {
            $scope.filterExpanded[key] = !$scope.filterExpanded[key];
        }
        $event.stopPropagation();
    };

    $scope.expand = {};
    /**
     * Expand/collapse an element
     * @param {string} key
     * @returns {undefined}
     */
    $scope.expandElement = function (key) {
        $scope.expand[key] = !($scope.expand[key]);
    };

    $scope.rowSpinner = [];
    /**
     * Toggle row spinner
     * @param {string} key
     * @returns {undefined}
     */
    $scope.toggleRowSpinner = function (key) {
        if (!key) {
            $scope.rowSpinner = [];
            return;
        }
        $scope.rowSpinner[key] = !$scope.rowSpinner[key];
    };

    /**
     * Get array from custom config
     * @param {string} key
     * @returns {Array}
     */
    $scope.getCustomCfgArr = function (key) {
        if (cfg.custom_cfg[cfg.app_type]) {
            return cfg.custom_cfg[cfg.app_type][key] || '';
        }
        return '';
    };

    // Alertify defaults
    alertify.defaults.glossary.title = cfg.app_name;
    alertify.defaults.glossary.ok = 'OK';
    alertify.defaults.glossary.cancel = 'CANCEL';

    // Extend existing alert (ERROR) dialog
    if (!alertify.alertError) {
        //define a new errorAlert base on alert
        alertify.dialog('alertError', function factory() {
            return{
                build: function () {
                    var errorHeader = '<span class="fa fa-exclamation-triangle fa-lg text-danger" '
                            + 'style="vertical-align:middle;">'
                            + '</span> ' + cfg.app_name + ' - ERROR';
                    this.setHeader(errorHeader);
                }
            };
        }, true, 'alert');
    }

    // Extend existing alert (WARNING) dialog
    if (!alertify.alertWarning) {
        alertify.dialog('alertWarning', function factory() {
            return{
                build: function () {
                    var errorHeader = '<span class="fa fa-exclamation-circle fa-lg text-warning" '
                            + 'style="vertical-align:middle;">'
                            + '</span> ' + cfg.app_name + ' - WARNING';
                    this.setHeader(errorHeader);
                }
            };
        }, true, 'alert');
    }

    /// --- Common APIs  --- ///
    /**
     * Run zwave command
     * @param {string} cmd
     * @param {int} timeout
     */
    $scope.runZwaveCmd = function (cmd, timeout) {
        timeout = timeout || 1000;
        $scope.toggleRowSpinner(cmd);
        dataService.runZwaveCmd(cfg.store_url + cmd).then(function (response) {
            $timeout($scope.toggleRowSpinner, timeout);
        }, function (error) {
            $scope.toggleRowSpinner();
            alertify.alertError($scope._t('error_update_data') + '\n' + cmd);
        });
    };

    /**
     * Set zwave configuration
     * @returns {undefined}
     */
    $scope.loadZwaveConfig = function (nocache) {
        // Set config
        dataService.getApi('configget_url', null, nocache).then(function (response) {
            // todo: deprecated
            //angular.extend(cfg.zwavecfg, {debug: response.data.debug});
            //angular.extend(cfg.zwavecfg, {notes: response.data.notes});
            angular.extend(cfg.zwavecfg, response.data);
        }, function (error) {});
    };

    /**
     * Load zwave dongles
     */
    $scope.setDongle = function () {
        dataService.getApi('zwave_list').then(function (response) {
            if (response.data.length === 1) {
                angular.extend(cfg, {dongle: response.data[0]});
                $cookies.dongle = response.data[0];
                angular.extend(cfg,{dongle_list: response.data});

                angular.extend(cfg, {
                    update_url: '/ZWave.' + cfg.dongle + '/Data/',
                    store_url: '/ZWave.' + cfg.dongle + '/Run/',
                    restore_url: '/ZWave.' + cfg.dongle + '/Restore',
                    queue_url: '/ZWave.' + cfg.dongle + '/InspectQueue',
                    fw_update_url: '/ZWave.' + cfg.dongle + '/FirmwareUpdate',
                    zme_bootloader_upgrade: '/ZWave.' + cfg.dongle + '/ZMEBootloaderUpgrade',
                    zme_firmware_upgrade: '/ZWave.' + cfg.dongle + '/ZMEFirmwareUpgrade',
                    license_load_url: '/ZWave.' + cfg.dongle + '/ZMELicense',
                    zddx_create_url: '/ZWave.' + cfg.dongle + '/CreateZDDX/',
                    'stat_url': '/ZWave.' + cfg.dongle + '/CommunicationStatistics',
                    'postfixget_url': '/ZWave.' + cfg.dongle + '/PostfixGet',
                    'postfixadd_url': '/ZWave.' + cfg.dongle + '/PostfixAdd',
                    'postfixremove_url': '/ZWave.' + cfg.dongle + '/PostfixRemove',
                    //'communication_history_url': '/ZWave.' + cfg.dongle + '/CommunicationHistory',
                    'configget_url': '/ZWave.' + cfg.dongle + '/ExpertConfigGet',
                    'configupdate_url': '/ZWave.' + cfg.dongle + '/ExpertConfigUpdate'

                });
            }
        }, function (error) {
            if (error.status === 401 && cfg.app_type !== 'installer') {
                window.location.href = cfg.smarthome_login;
            }
            // todo: deprecated
            /*if (error.status === 401) {
             //var redirectTo = $location.$$protocol+'://' + $location.$$host + ':' + $location.$$port + cfg.smarthome_login
             //if( cfg.app_type === 'installer'){
             //deviceService.logOut();
             return;
             //}
             //window.location.href = cfg.smarthome_login;
             }*/
        });
    };


    /**
     * Set timestamp and ping server if request fails
     * @returns {undefined}
     */
    $scope.setTimeStamp = function () {
        dataService.getApi('time', null, true).then(function (response) {
            $interval.cancel($scope.timeZoneInterval);
            angular.extend(cfg.route.time, {string: $filter('setTimeFromBox')(response.data.data.localTimeUT)},
                {timestamp: response.data.data.localTimeUT});
            var refresh = function () {
                cfg.route.time.timestamp += (cfg.interval < 1000 ? 1 : cfg.interval/1000)
                cfg.route.time.string = $filter('setTimeFromBox')(cfg.route.time.timestamp)
            };
            cfg.zwavecfg.time_zone = response.data.data.localTimeZone;
            $scope.timeZoneInterval = $interval(refresh, $scope.cfg.interval);
        }, function (error) {});

    };


    /**
     * Load Box API data
     */
    $scope.boxData = {
        controller: {}
    };
    $scope.loadBoxApiData = function () {
        dataService.loadZwaveApiData().then(function (ZWaveAPIData) {
             var hasDevices = Object.keys(ZWaveAPIData.devices).length;
             var homeId = ZWaveAPIData.controller.data.homeId.value;

            // todo: deprecated
            //$scope.boxData.controller.isPrimary = ZWaveAPIData.controller.data.isPrimary.value;
            //$scope.boxData.controller.isRealPrimary = ZWaveAPIData.controller.data.isRealPrimary.value;
            //$scope.boxData.controller.hasDevices =  hasDevices < 2 ? false : true;
            //$scope.boxData.controller.homeId =   '0x' + ('00000000' + (homeId + (homeId < 0 ? 0x100000000 : 0)).toString(16)).slice(-8);
            //$scope.boxData.controller.softwareRevisionVersion = ZWaveAPIData.controller.data.softwareRevisionVersion.value;
            //$scope.boxData.controller.homeNotes = ZWaveAPIData.controller.data.homeNotes.value ;
            //$scope.boxData.controller.homeName = ZWaveAPIData.controller.data.homeName.value || cfg.controller.network_name;

            // Changes MK
            //$scope.boxData.controller.controllerState = ZWaveAPIData.controller.data.controllerState.value;
            // Rewrite config
            var cfgController = {
                homeName: ZWaveAPIData.controller.data.homeName.value || cfg.controller.homeName,
                isRealPrimary: ZWaveAPIData.controller.data.isRealPrimary.value,
                homeId: homeId,
                homeIdHex: '0x' + ('00000000' + (homeId + (homeId < 0 ? 0x100000000 : 0)).toString(16)).slice(-8),
                hasDevices: hasDevices < 2 ? false : true
            }
            angular.extend(cfg.controller,cfgController);
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));

        });
    };
    /**
     * Load queue data
     */
    $scope.loadBusyIndicator = function () {
        var refresh = function() {
            dataService.getApi('queue_url',null,true).then(function (response) {
                setBusyIndicator(response.data);
            }, function (error) {});

        };
        $interval(refresh, 1000);
    };
    /**
     * Load common APIs
     */
    if($scope.getBodyId() !== ''){
        $scope.loadZwaveConfig();
        $scope.setDongle();
        $scope.setTimeStamp();
        if(cfg.app_type === 'installer'){
            $scope.loadBusyIndicator();
            $scope.loadBoxApiData();
        }

    }

    /// --- Private functions --- ///
    /**
     * Set busy indicator
     * @param {object} ZWaveAPIData
     */
    function setBusyIndicator(data) {
        var ret = {
            queueLength: data.length,
            busyLength: 0,
            result: 0,
            arrCnt: {
            v: 0,
            s: 0,
            d: 0
        }
        }
        var arrCnt = {
            v: 0,
            s: 0,
            d: 0
        }

        angular.forEach(data, function(job, jobIndex) {
            if(job[1][1] === 1 || job[1][2] === 1 || job[1][4] === 1){
                ret.busyLength += 1;
            }
            ret.arrCnt.v += job[1][1];
            ret.arrCnt.s += job[1][2];
            ret.arrCnt.d += job[1][4];
        });
        ret.result = (ret.queueLength - ret.busyLength);
        angular.extend(cfg.busy_indicator, ret);
    }

});
