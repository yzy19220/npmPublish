import {WebRTCTest, MicTest, CameraTest} from './webRTCSupport.js'

var isWebRTCSupported = false;
var support = {};
var backCallFunc;
var isMobile = {
    Android: function() {
        return /Android/i.test(navigator.userAgent);
    },
    iOS: function() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    safari: function() {
        return navigator.userAgent.toLowerCase().indexOf('safari/') > -1 &&  navigator.userAgent.toLowerCase().indexOf('chrome/') === -1;
    },
    PC: function() {

    }
};
['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer'].forEach(function(item) {
    if (isWebRTCSupported) {
        return;
    }
    if (item in window) {
        isWebRTCSupported = true;
    }
});
try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
} catch (e) {
    console.log('Failed to instantiate an audio context, error: ' + e);
}
// 截取版本号
function checkTBSVersion(ua) {
    var list = ua.split(" ");
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (item.indexOf("TBS") !== -1 || item.indexOf("tbs") !== -1) {
            var versionStr = item.split("/")[1];
            var version = parseInt(versionStr) || 0;
            return version
        }
    }
    return null;
}
// 打印成功失败原因
function onMessage(str) {
    console.log(str)
}
// 分辨率检测结果
function onSupportTestDone(result) {
    if (result === 0) {
        support.resolution = true
    } else {
        support.resolution = false
    }
    // alert(JSON.stringify(support))
    backCallFunc(support)
    // 是否需要连接测试
    // startConnectionTest();
}
// 分辨率检测
function startSupportTest() {
    var supportTest = new WebRTCTest();
    supportTest.setListener({
        onMessage : onMessage,
        done : onSupportTestDone
    });
    var resolutionArray = [
        [1280,720],[960,540], [640,360], [640,480], [480,264], [320,180]
    ];
    var supTest = new CameraTest(supportTest, resolutionArray);
    supTest.run();
}
// 视频检测结果
function onVideoTestDone(result) {
    if (result === 0) {
        support.video = true
    } else {
        support.video = false
    }
    // 开始分辨率检测
    startSupportTest();
}
// 视频检测
function startVideoTest() {
    var videoTest = new WebRTCTest();
    videoTest.setListener({
        onMessage : onMessage,
        done : onVideoTestDone
    });
    var camTest = new CameraTest(videoTest, [ [640,360], [640,480]]);
    camTest.run();
}
// 音频检测结果
function onAudioTestDone(result) {
    if (result === 0) {
        support.audio = true
    } else {
        support.audio = false
    }
    // 开始视频检测
    startVideoTest();
}
// 音频检测
function startAudioTest() {
    var audioTest = new WebRTCTest();
    audioTest.setListener({
        onMessage : onMessage,
        done : onAudioTestDone
    });
    var micTest = new MicTest(audioTest);
    micTest.run();
}
// 浏览器检测
function startBrowserTest(backCall){
    backCallFunc = backCall
    var isMobileBrowser = false;
    for(var a in isMobile){
        if( isMobile[a]() ){
            isMobileBrowser = true
            var version = checkTBSVersion(navigator.userAgent);
            if( a === 'Android' && version && version < 43600 ){
                console.log("Android (version:"+ version + ") 不支持 !!!");
                support.browser = false
            }
            else if(!isWebRTCSupported || (!isMobile.safari() && isMobile.iOS())) {
                console.log(a + "当前浏览器不支持 !!!");
                support.browser = false
            }else{
                if( isMobile.safari() && isMobile.iOS()  ){
                    //ios 11 版本 11.0.3 以下不支持
                    var matches = (navigator.userAgent).match(/OS (\d+)_(\d+)_?(\d+)?/);
                    if(matches && matches[1]>=11 && (matches[2]>=1 || matches[3] >= 3) ){
                        console.log(matches[0] + " 当前浏览器支持 !!!");
                        support.browser = true
                    }else{
                        console.log(matches[0] + "  不支持 !!!");
                        support.browser = false
                    }
                }else{
                    console.log(a + " 当前浏览器支持 !!!");
                    support.browser = true
                }
            }
            break;
        }
    }

    if( !isMobileBrowser){
        if(isWebRTCSupported){
            console.log("pc当前浏览器 支持 !!!");
            support.browser = true
        }else{
            console.log("pc当前浏览器 不支持 !!!");
            support.browser = false
        }
    }
    if(support.browser) {
        // 开始音频检测
        startAudioTest()
    } else {
        // alert(JSON.stringify(support))
        backCallFunc(support)
    }
}
// window.onload = function () {
//     // 开始浏览器检测
//     startBrowserTest();
// }

export default startBrowserTest

// 是否需要检测连接
// 权限谁要
// 是否需要每项的权限检测
// 怎么引入
