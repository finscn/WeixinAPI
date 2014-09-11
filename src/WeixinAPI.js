/**
 微信API封装, finscn ( @大城小胖 ) 版.
    参考了  https://github.com/zxlie/WeixinApi
    感谢原作者.
**/

var WeixinAPI = function(options) {
    for (var p in options) {
        this[p] = options[p];
    }
};

WeixinAPI.prototype = {
    constructor: WeixinAPI,

    //是否初始化完毕
    isReady: false,

    //超时时间, 如果超时后 isReady仍然为false, 通常表示不在微信的环境里.
    timeout: 2000,

    // 微信分享数据的基础模板, 通常不需要修改
    _shareDataTemplate: {
        "link": window.top.location.href,
        "img_width": "256",
        "img_height": "256",
        "img_url": undefined,
        "appid": undefined,
        "title": undefined,
        "desc": undefined
    },

    // 基本微信分享数据, 会与实际设置的数据进行merge
    baseShareData: null,

    // shareReady 时的后续动作是否是异步的
    asyncShareReady: false,

    // 初始化方法, 用户需要主动调用. init之后才能进行其他操作.不要问我为什么不在构造函数里主动调用 :P
    init: function() {
        var Me = this;
        this.dataHolder = {};
        this.callbackHolder = {};

        this.baseShareData = this.baseShareData || {};
        for (var p in this._shareDataTemplate) {
            this.baseShareData[p] = this._shareDataTemplate[p];
        }

        var callback = function() {
            Me._initShareListeners();
            Me.isReady = true;
            Me.onReady();
        };
        if (typeof WeixinJSBridge == "undefined") {
            document.addEventListener("WeixinJSBridgeReady", callback, false);
            setTimeout(function() {
                if (typeof WeixinJSBridge == "undefined") {
                    Me.onTimeout();
                }
            }, this.timeout);
        } else {
            callback();
        }

    },

    // WeixinJSBridge 初始化完毕后的回调
    onReady: function() {},

    // WeixinJSBridge 初始化超时的回调,此时通常意味着不在微信环境.
    onTimeout: function() {},


    /*********************************************/
    /********* 分享相关内部函数, "_" 开头的用户无需关心  *********/
    /*********************************************/

    _initShareListeners: function() {
        var Me = this;
        // iOS微信5.4开始,只支持 general share
        WeixinJSBridge.on("menu:general:share", function(general) {
            Me._invokeGeneral("generalShare", general);
        });
        // 以下3个事件只在微信5.4之前版本以及部分Android版本可用
        WeixinJSBridge.on("menu:share:appmessage", function() {
            Me._invoke("sendAppMessage");
        });
        WeixinJSBridge.on("menu:share:timeline", function() {
            Me._invoke("shareTimeline");
        });
        WeixinJSBridge.on("menu:share:weibo", function() {
            Me._invoke("shareWeibo");
        });
    },

    _invokeCallBack: function(action, resp, callback) {
        var msg = resp["err_msg"];
        var type;
        if (/:cancel$/.test(msg)) {
            type = "cancel";
        } else if (/:ok$/.test(msg)) {
            type = "succeed";
        } else if (/:fail$/.test(msg)) {
            type = "fail";
        }
        if (callback) {
            if (typeof callback == "function") {
                callback(resp, action, type);
            } else {
                callback[type] && callback[type](resp, action, type);
            }
            callback["complete"] && callback["complete"](resp, action, "complete");
        }
    },


    _invoke: function(action) {

        var data = this.mergerData(this.dataHolder[action]);
        if (action == "shareTimeline") {
            var title = data["title"] || data["desc"];
            data["title"] = data["desc"] || title;
            data["desc"] = title;
        }
        var callback = this.callbackHolder[action];
        var readyCallback = callback ? callback["ready"] : null;

        var Me = this;

        // 微信 5.4 Android版下, 分享到朋友圈时, 总是返回ok,
        // 且返回两次.疑似微信android版本的bug.
        // 建议在 shareTimeline 的 ready事件中做回调, 避免重复操作.

        var doShare = function() {
            WeixinJSBridge.invoke(action, data, function(resp) {
                Me._invokeCallBack(action, resp, callback);
            });
        };

        if (this.asyncShareReady && readyCallback) {
            readyCallback(data, action, doShare);
        } else {
            if (!readyCallback || readyCallback(data, action, null) !== false) {
                doShare();
            }
        }

    },

    _invokeGeneral: function(action, wxGeneral) {
        // this.dataHolder[action]
        // general.generalShare
        var shareTo = wxGeneral.shareTo;
        switch (shareTo) {
            case "friend":
            case "appmessage":
            case "sendappmessage":
                shareTo = "friend";
                action = "sendAppMessage";
                break;
            case "timeline":
                shareTo = "timeline";
                action = "shareTimeline";
                break;
            case "weibo":
                shareTo = "weibo";
                action = "shareWeibo";
                break;
        }

        var data = this.mergerData(this.dataHolder[action]);
        if (action == "shareTimeline") {
            var title = data["title"] || data["desc"];
            data["title"] = data["desc"] || title;
            data["desc"] = title;
        }
        var callback = this.callbackHolder[action];
        var readyCallback = callback ? callback["ready"] : null;

        var Me = this;

        var doShare = function() {
            wxGeneral.generalShare(data, function(resp) {
                Me._invokeCallBack(action, resp, callback);
            });
        };

        if (this.asyncShareReady && readyCallback) {
            readyCallback(data, action, doShare);
        } else {
            readyCallback && readyCallback(data, action, null);
            doShare();
        }
    },

    /*
        以下4个函数的参数说明:
        data: 微信所需要的分享时的数据
        callback: 分享的回调函数. 如果callback为一个函数,则此函数为分享后续操作的通用回调函数.
                  即,无论回调成功/失败/取消都会调用该函数.
                    参数为  resp, action, type
                    resp: 微信返回的原始数据.
                    action:  分享的动作
                    type: 分享操作回调事件的类型: succeed,fail,cancel

            如果callback为如下格式, 则相当于分别指定相应回调:
                {
                    succeed: function(resp, action, type){},   // 分享成功
                    fail: function(resp, action, type){},      // 分享失败
                    cancel: function(resp, action, type){},    // 分享取消
                    complete: function(resp, action, type){},  //通用回调函数

                    ready: function(data, action){},     // 同步分享准备就绪

                    ready: function(data, action, doShare){},     // 异步分享准备就绪
                    //异步时, 需要在 ready里主动调用 doShare函数.
                }
    */

    // 设置 所有分享操作 所使用的数据, 以及回调函数. 若要移除, 设置为null
    generalShare: function(data, callback) {
        this.shareToFriend(data, callback);
        this.shareToTimeline(data, callback);
        this.shareToWeibo(data, callback);
    },

    // 设置 分享给朋友 时所使用的数据, 以及回调函数. 若要移除, 设置为null
    shareToFriend: function(data, callback) {
        this.dataHolder["sendAppMessage"] = data;
        this.callbackHolder["sendAppMessage"] = callback;
    },

    // 设置 分享到朋友圈 时所使用的数据, 以及回调函数. 若要移除, 设置为null
    shareToTimeline: function(data, callback) {
        this.dataHolder["shareTimeline"] = data;
        this.callbackHolder["shareTimeline"] = callback;
    },

    // 设置 分享到腾讯微博 时所使用的数据, 以及回调函数. 若要移除, 设置为null
    shareToWeibo: function(data, callback) {
        this.dataHolder["shareWeibo"] = data;
        this.callbackHolder["shareWeibo"] = callback;
    },

    /*******************************/
    /********* 其他功能函数  *********/
    /*******************************/

    previewImages: function(curSrc, srcList) {
        if (!curSrc || !srcList || srcList.length == 0) {
            return;
        }
        WeixinJSBridge.invoke("imagePreview", {
            "current": curSrc,
            "urls": srcList
        });
    },

    getNetworkType: function(callback) {
        if (callback && typeof callback == "function") {
            WeixinJSBridge.invoke("getNetworkType", {}, function(resp) {
                var type = resp["err_msg"];
                //  network_type:wifi     wifi
                //  network_type:edge     edge
                //  network_type:wwan     2G/3G
                //  network_type:fail     网络断开
                var idx = 0;
                var preix = "network_type:";
                if (type && type.indexOf(preix) == 0) {
                    type = type.substring(preix.length);
                }
                callback(type);
            });
        }
    },

    callWeixin: function(cmd) {
        WeixinJSBridge.call(cmd);
    },

    showOptionMenu: function() {
        WeixinJSBridge.call("showOptionMenu");
    },

    hideOptionMenu: function() {
        WeixinJSBridge.call("hideOptionMenu");
    },

    showToolbar: function() {
        WeixinJSBridge.call("showToolbar");
    },

    hideToolbar: function() {
        WeixinJSBridge.call("hideToolbar");
    },

    closeWindow: function() {
        WeixinJSBridge.call("closeWindow");
    },

    mergerData: function(data) {
        if (!data) {
            return data;
        }
        var _data = JSON.parse(JSON.stringify(this.baseShareData));
        for (var p in data) {
            _data[p] = data[p];
        }
        _data["title"] === undefined && (_data["title"] = _data["desc"]);
        _data["desc"] === undefined && (_data["desc"] = _data["title"]);
        return _data;
    },

    // 将相对路径变为绝对路径
    getAbsolutePath: function(relativePath) {
        var img = new Image();
        img.src = relativePath;
        var absolute = img.src;
        return absolute;
    }

};
