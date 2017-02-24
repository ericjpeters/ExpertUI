/**
 * @overview This controller renders and handles network statistics.
 * @author Martin Vach
 */

/**
 * Network statistics controller
 * @class NetworkStatisticsController
 *
 */
appController.controller('NetworkStatisticsController', function ($scope, $filter, $timeout, $interval, dataService, cfg, _, deviceService) {
    $scope.networkStatistics = {
        all: [],
        collection: [],
        show: false,
        whiteList: ['RFRxCRC16Errors', 'RFRxForeignHomeID', 'RFRxFrames', 'RFRxLRCErrors', 'RFTxFrames', 'RFTxLBTBackOffs']
    };

    $scope.netStat = {
        all: {},
        show: false
    };

    var cOptions = {
        colorSet: "statisticsColors",
        title:{
            text: "Success on Reception (% ok versus % corrupted)",
            fontFamily: "arial",
            fontSize: 20
        },
        legend: {
            verticalAlign: "bottom",
            horizontalAlign: "center",
            fontFamily: "arial",
            fontSize: 15
        },
        theme: "theme2",
        data: [
            {
                indexLabelFontColor: "#ffffff",
                //indexLabelLineColor: "darkgrey",
                type: "pie",
                indexLabelFontFamily: "arial",
                indexLabelFontSize: 20,
                indexLabelFontWeight: "bold",
                startAngle:0,
                indexLabelPlacement: "inside",
                toolTipContent: "{name}: {y}",
                showInLegend: true,
                percentFormatString: "#0",
                indexLabel: "#percent %",
                dataPoints: [
                    {  y: 64, name: "Value 1"},
                    {  y: 36, name: "Value 2"},
                    {  y: 1, name: "Value 3"}
                ]
            //{  y: 100, name: "Not shown",color: '#f5f5f5'}
            }
        ]
    };
    var cColors =  ["#80AD80","#d9534f","#f0ad4e"];

    $scope.testGraph = function(){

        CanvasJS.addColorSet("statisticsColors",cColors);
        var chart = new CanvasJS.Chart('chartContainer',cOptions);
        chart.render();
    };

    //$scope.testGraph();
    /**
     * Load network statistics
     */
    $scope.loadNetworkStatistics = function () {
        var cmd = cfg.store_url + 'controller.data.statistics';
        dataService.runZwaveCmd(cmd).then(function (response) {
            var percentCnt = function (total, num) {
                if (total === 0 && num === 0) {
                    return 0;
                }
                var out = parseInt(((num / total) * 100).toFixed());
                // Sets 1 percent if num is not 0 and out is 0
                return out === 0 && num > 0 ? 1 : out;
            }
            // Total Number of Frames Sent RFTxFrames
            var RFTxFrames = parseInt(response.data.RFTxFrames.value);
            // Frames with Frequency Backoff (in % of frames sent) RFTxLBTBackOffs
            var RFTxLBTBackOffs = parseInt(response.data.RFTxLBTBackOffs.value);
            var objRFTxLBTBackOffs = response.data.RFTxLBTBackOffs;

            objRFTxLBTBackOffs['RFTxFrames'] = RFTxFrames;
            objRFTxLBTBackOffs['frameName'] = 'RFTxFrames';
            objRFTxLBTBackOffs['frameValue'] = RFTxFrames;
            objRFTxLBTBackOffs['fail'] = percentCnt(RFTxFrames, RFTxLBTBackOffs);
            objRFTxLBTBackOffs['success'] = (RFTxFrames > 0 ?(100 - objRFTxLBTBackOffs['fail']) : 0);
            objRFTxLBTBackOffs['dateTime'] = $filter('getDateTimeObj')(response.data.RFTxLBTBackOffs.updateTime);
            $scope.netStat.all[0] = objRFTxLBTBackOffs;

            // Number of correct Frames received RFRxFrames
            var RFRxFrames = parseInt(response.data.RFRxFrames.value);
            var RFRxLRCErrors = parseInt(response.data.RFRxLRCErrors.value);
            var RFRxCRC16Errors = parseInt(response.data.RFRxCRC16Errors.value);
             var RFRxForeignHomeID = parseInt(response.data.RFRxForeignHomeID.value);

            // Number of corrupted CRC8 Frames received
            var objRFRxLRCErrors = response.data.RFRxLRCErrors;
            objRFRxLRCErrors['fail'] = percentCnt(RFRxFrames, RFRxLRCErrors);
            objRFRxLRCErrors['failCRC8'] = percentCnt(RFRxFrames, RFRxLRCErrors);
            objRFRxLRCErrors['failCRC16'] = percentCnt(RFRxFrames, RFRxCRC16Errors);
            objRFRxLRCErrors['success'] = (RFRxFrames > 0 ?(100 - (objRFRxLRCErrors['failCRC8'] + objRFRxLRCErrors['failCRC16'])) : 0);
            objRFRxLRCErrors['RFRxFrames'] = RFRxFrames;
            objRFRxLRCErrors['frameName'] = 'RFRxFrames';
            objRFRxLRCErrors['frameValue'] = RFRxFrames;
            objRFRxLRCErrors['failCRC8Name'] = 'RFRxLRCErrors';
            objRFRxLRCErrors['failCRC16Name'] = 'RFRxCRC16Errors';
            objRFRxLRCErrors['failCRC8Value'] = RFRxLRCErrors;
            objRFRxLRCErrors['failCRC16Value'] = RFRxCRC16Errors;
            objRFRxLRCErrors['dateTime'] = $filter('getDateTimeObj')(response.data.RFRxLRCErrors.updateTime);
            $scope.netStat.all[1] = objRFRxLRCErrors;


            /********** Graph init ***********************/


            /*cOptions.data.dataPoints = [
                {  y: 100, name: "Not shown",color: '#f5f5f5'}
            ]*/
            console.log(cOptions.data[0].dataPoints)
            CanvasJS.addColorSet("statisticsColors",cColors);
            var chart = new CanvasJS.Chart('chartContainer',cOptions);
            chart.render();

            // Number of corrupted CRC16 Frames received
            /*var objRFRxCRC16Errors = response.data.RFRxCRC16Errors;
            objRFRxCRC16Errors['fail'] = percentCnt(RFRxFrames, RFRxCRC16Errors);
            objRFRxCRC16Errors['success'] = (RFRxFrames > 0 ?(100 - objRFRxCRC16Errors['fail']) : 0);
            objRFRxCRC16Errors['RFRxFrames'] = RFRxFrames;
            objRFRxCRC16Errors['dateTime'] = $filter('getDateTimeObj')(response.data.RFRxCRC16Errors.updateTime);
            $scope.netStat.all[2] = objRFRxCRC16Errors;*/

            // RFRxForeignHomeID RFRxForeignHomeID
            var objRFRxForeignHomeID = response.data.RFRxForeignHomeID;
            objRFRxForeignHomeID['fail'] = percentCnt(RFRxFrames, RFRxForeignHomeID);
            objRFRxForeignHomeID['success'] =  (RFRxFrames > 0 ?(100 - objRFRxForeignHomeID['fail']) : 0);
            objRFRxForeignHomeID['RFRxFrames'] = RFRxFrames;
            objRFRxForeignHomeID['frameName'] = 'RFRxFrames';
            objRFRxForeignHomeID['frameValue'] = RFRxFrames;

            objRFRxForeignHomeID['dateTime'] = $filter('getDateTimeObj')(response.data.RFRxForeignHomeID.updateTime);
            $scope.netStat.all[3] = objRFRxForeignHomeID;
            //return;
            /*$scope.netStat.all['RFTxLBTBackOffs'] = response.data.RFTxLBTBackOffs;
             $scope.netStat.all['RFRxCRC16Errors'] = response.data.RFRxCRC16Errors;
             $scope.netStat.all['RFRxForeignHomeID'] = response.data.RFRxForeignHomeID;*/


            //console.log(response);
            //return;

            /* $scope.netStat.all = _.chain(response.data)
             .filter(function (v,k) {


             }).value();*/

            //Old
            $scope.networkStatistics.all = _.chain(response.data)
                .filter(function (v, k) {
                    if ($scope.networkStatistics.whiteList.indexOf(k) > -1) {
                        v.name = k;
                        v.isUpdated = (v.updateTime > v.invalidateTime ? true : false);
                        v.dateTime = $filter('getDateTimeObj')(v.updateTime);
                        return v;
                    }

                }).value();
            if (_.isEmpty($scope.networkStatistics.all)) {
                $scope.alert = {
                    message: $scope._t('device_404'),
                    status: 'alert-warning',
                    icon: 'fa-exclamation-circle'
                };
                return;
            }
            $scope.networkStatistics.show = true;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data') + '\n' + cmd);
        });
    };
    $scope.loadNetworkStatistics();

    /**
     * Update network statistics
     * @param {string} cmd
     */
    $scope.updateNetworkStatistics = function (cmd) {
        var timeout = 1000;
        $scope.runZwaveCmd(cmd, timeout);
        $timeout(function () {
            $scope.loadNetworkStatistics()
        }, timeout);
    };

});