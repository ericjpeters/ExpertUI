/**
 * ZnifferController
 * @author Martin Vach
 */
appController.controller('ZnifferController', function ($scope, $interval, $filter, cfg, dataService, myCache, _) {
     $scope.zniffer = {
        interval: null,
        controller: {},
        trace: 'start',
        cmdClass: [],
        all: []
       
    };

    /**
     * Cancel interval on page destroy
     */
    $scope.$on('$destroy', function () {
        //$interval.cancel( $scope.zniffer.interval);
    });

    /**
     * Load zwave API
     */
    $scope.loadZwaveApi = function () {
        dataService.loadZwaveApiData().then(function (ZWaveAPIData) {
             $scope.zniffer.controller.nodeId = ZWaveAPIData.controller.data.nodeId.value;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            return;
        });
    };
    $scope.loadZwaveApi();

    /**
     * Load zwave command classes
     * @returns {undefined}
     */
    $scope.loadCmdClass = function () {
        dataService.xmlToJson(cfg.zwave_classes_url).then(function (response) {
             $scope.zniffer.cmdClass = response.zw_classes.cmd_class;
        }, function (error) {
            alertify.alertError($scope._t('error_xml_load'));
        });

    };
    $scope.loadCmdClass();

    /**
     * Load cached packet
     * @returns {undefined}
     */
    $scope.loadCachedPackets = function () {
        if (myCache.get('inout_packet')) {
             $scope.zniffer.all = myCache.get('inout_packet');
        }

    };
    $scope.loadCachedPackets();

    /**
     * Load packet data
     * @returns {undefined}
     */
    $scope.loadIncomingPacket = function () {
        dataService.getApi('incoming_packet_url', null, true).then(function (response) {
            var exist = _.find( $scope.zniffer.all, {updateTime: response.data.updateTime});
            if (exist) {
                return;
            }
             $scope.zniffer.all.push(
                    {
                        type: 'incoming',
                        updateTime: response.data.updateTime,
                        value: response.data.value,
                        dateTime: $filter('getDateTimeObj')(response.data.updateTime),
                        src: response.data.value[3],
                        dest:  $scope.zniffer.controller.nodeId,
                        data: setZnifferDataType(response.data.value[2]),
                        application: packetApplication(response.data.value)
                    }
            );
            myCache.put('inout_packet',  $scope.zniffer.all);
            //console.log(exist)
        }, function (error) {});
    };
    //$scope.loadIncomingPacket();
    /**
     * Load packet data
     * @returns {undefined}
     */
    $scope.loadOutgoingPacket = function () {
        dataService.getApi('outgoing_packet_url', null, true).then(function (response) {
            var exist = _.find( $scope.zniffer.all, {updateTime: response.data.updateTime});
            if (exist) {
                return;
            }
             $scope.zniffer.all.push(
                    {
                       type: 'outgoing',
                        updateTime: response.data.updateTime,
                        value: response.data.value,
                        dateTime: $filter('getDateTimeObj')(response.data.updateTime),
                        src:  $scope.zniffer.controller.nodeId,
                        dest: response.data.value[3],
                        data: setZnifferDataType(response.data.value[2]),
                        application: packetApplication(response.data.value)
                    }
            );
            myCache.put('inout_packet',  $scope.zniffer.all);
            //console.log(exist)
        }, function (error) {});
    };
    //$scope.loadOutgoingPacket();

    /**
     * Refresh packet
     */
    $scope.refreshPacket = function () {
        var refresh = function () {
            $scope.loadIncomingPacket();
            $scope.loadOutgoingPacket();
        };
        if ( $scope.zniffer.trace === 'start') {
             $scope.zniffer.interval = $interval(refresh, $scope.cfg.interval);
        }

    };

    $scope.refreshPacket();
    /**
     * Set trace
     */
    $scope.setTrace = function (trace) {
        switch (trace) {
            case 'pause':
                 $scope.zniffer.trace = 'pause';
                $interval.cancel( $scope.zniffer.interval);
                break;
            case 'stop':
                 $scope.zniffer.trace = 'stop';
                $interval.cancel( $scope.zniffer.interval);
                myCache.remove('incoming_packet');
                angular.copy([],  $scope.zniffer.all);
                break;
            default:
                 $scope.zniffer.trace = 'start';
                $scope.loadCachedPackets();
                $scope.refreshPacket();
                break;

        }
        //console.log('Set trace: ',  $scope.zniffer.trace)
    };

    /// --- Private functions --- ///
    /**
     * Set an application col
     * @param {array} packet
     * @returns {undefined}
     */
    function packetApplication(packet) {
        // Get a command class from position 5
        var cmdClassKey = $filter('decToHex')(packet[5], 2, '0x');
        //key = '0x20'; // cc with cmd array
        var cmdKey = $filter('decToHex')(packet[6], 2, '0x');
        //keyCmd = '0x03';
        //console.log('cmdClassKey: ', cmdClassKey)

        var cmdClassVersion = '1';
        var ret = {};
        //var cc = _.findWhere( $scope.zniffer.cmdClass, {_key: cmdClassKey, _version: cmdClassVersion });

        if (_.isEmpty( $scope.zniffer.cmdClass)) {
            return;
        }
        var findCmdClass = _.where( $scope.zniffer.cmdClass, {_key: cmdClassKey});
        if (!findCmdClass) {
            return ret;
        }
        var cmdClass = findCmdClass.pop();
        if (_.isArray(cmdClass.cmd)) {
            ret = _.findWhere(cmdClass.cmd, {_key: cmdKey});
        } else {
            ret = cmdClass.cmd;
        }
        return ret;
    }
    
    function setZnifferDataType(data) {
        switch(data){
            case 0:
                return 'Singlecast';
             case 255:
                return 'Predicast'; 
            default:
                return 'Multicast';
        }
    }

});
/**
 * ZnifferController - NEW
 * @author Martin Vach
 */
appController.controller('ZnifferNewController', function ($scope, $interval, $filter, cfg, dataService, myCache, _) {
     $scope.zniffer = {
        interval: null,
        controller: {},
        cmdClass: [],
        all: [],
        collection: {},
        filter: {
            model: {
                src: {
                    value: '',
                    show: 1
                },
                dest: {
                    value: '',
                    show: 1
                },
                data: {
                    value: '',
                    show: 1
                }
            },
            items:{
                data: ['Singlecast','Predicast','Multicast']
            }
        }
       
    };
    /**
     * Cancel interval on page destroy
     */
    $scope.$on('$destroy', function () {
        //$interval.cancel( $scope.zniffer.interval);
    });
      /**
     * Load communication history
     * @returns {undefined}
     */
   $scope.loadCommunication = function () {
        dataService.getApi('communication_history_url', null, true).then(function (response) {
           
             $scope.zniffer.all = response.data;
        }, function (error) {});
    };
    $scope.loadCommunication();

    
   

    /**
     * Refresh packet
     */
    $scope.refreshPacket = function () {
        var refresh = function () {
            $scope.loadIncomingPacket();
            $scope.loadOutgoingPacket();
        };
         $scope.zniffer.interval = $interval(refresh, $scope.cfg.interval);

    };
    //$scope.refreshPacket();
    
     /**
     * Set zniffer filter
     * @returns {undefined}
     */
    $scope.setZnifferFilter = function (filter) {
        var params = JSON.stringify($scope.zniffer.filter.model);
        //filter.show = parseInt(filter.show);
        //$scope.zniffer.filter.model = filter;
        console.log('filter=' + params)
       //$scope.loadIncomingPacket();
        //$scope.loadOutgoingPacket();
    };
    /**
     * Reset zniffer filter
     * @returns {undefined}
     */
    $scope.resetZnifferFilter = function () {
//        $scope.zniffer.filter.model = false;
//        $scope.loadIncomingPacket();
//            $scope.loadOutgoingPacket();
    };

    /// --- Private functions --- ///
    /**
     * Set an application col
     * @param {array} packet
     * @returns {undefined}
     */
    function packetApplication(packet) {
        // Get a command class from position 5
        var cmdClassKey = $filter('decToHex')(packet[5], 2, '0x');
        //key = '0x20'; // cc with cmd array
        var cmdKey = $filter('decToHex')(packet[6], 2, '0x');
        //keyCmd = '0x03';
        //console.log('cmdClassKey: ', cmdClassKey)

        var cmdClassVersion = '1';
        var ret = {};
        //var cc = _.findWhere( $scope.zniffer.cmdClass, {_key: cmdClassKey, _version: cmdClassVersion });

        if (_.isEmpty( $scope.zniffer.cmdClass)) {
            return;
        }
        var findCmdClass = _.where( $scope.zniffer.cmdClass, {_key: cmdClassKey});
        if (!findCmdClass) {
            return ret;
        }
        var cmdClass = findCmdClass.pop();
        if (_.isArray(cmdClass.cmd)) {
            ret = _.findWhere(cmdClass.cmd, {_key: cmdKey});
        } else {
            ret = cmdClass.cmd;
        }
        return ret;
    }
    
    function setZnifferDataType(data) {
        switch(data){
            case 0:
                return 'Singlecast';
             case 255:
                return 'Predicast'; 
            default:
                return 'Multicast';
        }
    }

});

/**
 * ZnifferControllerDemo
 * @author Martin Vach
 */
appController.controller('ZnifferControllerDemo', function ($scope, $interval, $filter, cfg, dataService, myCache, _) {
    $scope.zniffer = {
        all: {},
        frequency: 0,
        uzb: {
            current: 0,
            all: ['COM 1', 'COM 2', 'COM 3', 'COM 4']
        },
        filter: {
            model: false,
            items: ['homeid', 'src', 'dest', 'rssi', 'speed', 'data'],
            data: [],
            search: '',
            suggestions: []
        }
    };

    /**
     * Load zniffer data
     * @returns {undefined}
     */
    $scope.loadZniffer = function () {
        dataService.getApiLocal('zniffer.json').then(function (response) {
            setZniffer(response.data);
        }, function (error) {
            alert('Unable to load data');
        });
    };
    $scope.loadZniffer();

    /**
     * Set zniffer filter
     * @returns {undefined}
     */
    $scope.setZnifferFilter = function (filter) {
        $scope.zniffer.filter.search = '';
        $scope.zniffer.filter.model = filter;
        //$scope.loadZniffer();
    };

    /**
     * Reset zniffer filter
     * @returns {undefined}
     */
    $scope.resetZnifferFilter = function () {
        $scope.zniffer.filter.search = '';
        $scope.zniffer.filter.model = false;
        $scope.loadZniffer();
    };

    /**
     * Apply zniffer filter
     * @param {type} value
     * @returns {undefined}
     */
    $scope.applyZnifferFilter = function (value) {
        $scope.zniffer.filter.suggestions = [];
        $scope.zniffer.filter.search = value;
        $scope.loadZniffer();
    };

    /**
     * Set zniffer frequency
     * @returns {undefined}
     */
    $scope.setZnifferFrequency = function (frq) {
        $scope.zniffer.frequency = frq;
        $scope.loadZniffer();
    };

    /**
     * Set zniffer uzb
     * @returns {undefined}
     */
    $scope.setZnifferUzb = function (uzb) {
        $scope.zniffer.uzb.current = uzb;
        $scope.loadZniffer();
    };

    /**
     * Search in the zniffer by filter
     */
    $scope.searchZniffer = function () {
        $scope.zniffer.filter.suggestions = [];
        if ($scope.zniffer.filter.search.length >= 2) {
            var searchArr = _.keys($scope.zniffer.filter.data[$scope.zniffer.filter.model]);
            var search = $scope.zniffer.filter.search;
            findText(searchArr, search);
        }
    };

    /// --- Private functions --- ///

    /**
     * Find text
     */
    function findText(n, search, exclude) {
        var gotText = false;
        for (var i in n) {
            var re = new RegExp(search, "ig");
            var s = re.test(n[i]);
            if (s && (!_.isArray(exclude) || exclude.indexOf(n[i]) === -1)) {
                $scope.zniffer.filter.suggestions.push(n[i]);
                gotText = true;
            }
        }
        return gotText;
    }
    ;

});