
var weixin = new WeixinAPI({
    timeout: 2500,
    onReady: function() {
        $id("weixinState").innerHTML = "WeixinAPI is ready";
    },
    onTimeout: function() {
        $id("weixinState").innerHTML = "WeixinAPI is timeout";
    }
});

window.onload = function() {

    weixin.init();

    var shareData = {
        title: "标题: 测试",
        desc: "描述: WeixinAPI 大城小胖 版 测试.",
        img_url: weixin.getAbsolutePath("share-icon.jpg")
    };

    // 如果不想区分不同动作对应的数据和回调, 可以只使用 weixin.generalShare ,
    // 然后在每个回调里面根据action参数自行判断对应动作
    /*

        weixin.generalShare(shareData, {
            ready: function(shareData, action) {
                alert(action+" 操作 准备好了:" + shareData.title || shareData.desc);
            },
            cancel: function(resp, action) {
                alert(action+" 操作 被取消 了." + resp.err_msg);
            },
            succeed: function(resp, action) {
                alert(action+" 操作 成功 了." + resp.err_msg);
            },
            fail: function(resp, action) {
                alert(action+" 操作 失败 了." + resp.err_msg);
            },
            complate: function(resp, action) {
                alert(action+" 结束 了." + resp.err_msg);
            },
        });

    */

    weixin.shareToFriend(shareData, {
        ready: function(shareData, action) {
            alert("发送给朋友 操作 准备好了:" + shareData.title || shareData.desc);
        },
        cancel: function(resp, action) {
            alert("发送给朋友 操作 被取消 了." + resp.err_msg);
        },
        succeed: function(resp, action) {
            alert("发送给朋友 操作 成功 了." + resp.err_msg);
        },
        fail: function(resp, action) {
            alert("发送给朋友 操作 失败 了." + resp.err_msg);
        },
        complate: function(resp, action) {
            alert("发送给朋友 结束 了." + resp.err_msg);
        },
    });

    weixin.shareToTimeline(shareData, {
        ready: function(shareData, action) {
            alert("分享到朋友圈 操作 准备好了:" + shareData.title || shareData.desc);
        },
        cancel: function(resp, action) {
            alert("分享到朋友圈 操作 被取消 了." + resp.err_msg);
        },
        succeed: function(resp, action) {
            alert("分享到朋友圈 操作 成功 了." + resp.err_msg);
        },
        fail: function(resp, action) {
            alert("分享到朋友圈 操作 失败 了." + resp.err_msg);
        },
        complate: function(resp, action) {
            alert("分享到朋友圈 结束 了." + resp.err_msg);
        },
    });
    weixin.shareToWeibo(shareData, {
        ready: function(shareData, action) {
            alert("分享到腾讯微博 操作 准备好了:" + shareData.title || shareData.desc);
        },
        cancel: function(resp, action) {
            alert("分享到腾讯微博 操作 被取消 了." + resp.err_msg);
        },
        succeed: function(resp, action) {
            alert("分享到腾讯微博 操作 成功 了." + resp.err_msg);
        },
        fail: function(resp, action) {
            alert("分享到腾讯微博 操作 失败 了." + resp.err_msg);
        },
        complate: function(resp, action) {
            alert("分享到腾讯微博 结束 了." + resp.err_msg);
        },
    });

    initButtons();
};

function $id(id) {
    return document.getElementById(id);
}

function initButtons() {
    $id('getNetworkType').addEventListener('click', function() {
        weixin.getNetworkType(function(type) {
            $id('networkType').innerHTML = type;
        });
    });
    $id('showOptionMenu').addEventListener('click', function() {
        weixin.showOptionMenu();
    });
    $id('hideOptionMenu').addEventListener('click', function() {
        weixin.hideOptionMenu();
    });
    $id('showToolbar').addEventListener('click', function() {
        weixin.showToolbar();
    });
    $id('hideToolbar').addEventListener('click', function() {
        weixin.hideToolbar();
    });
    $id('closeWindow').addEventListener('click', function() {
        weixin.closeWindow();
    });

    $id('previewImages').addEventListener('click', function() {
        var picList = [
            "http://content.52pk.com/files/121122/1284656_175821_1_lit.jpg",
            "http://www.520bizhi.com/uploads/allimg/1009/1-1009140646300-L.jpg",
            "http://himg2.huanqiu.com/attachment2010/110223/c929b22ce3.jpg", "http://p3.gexing.com/kongjianpifu/20121216/1544/50cd7be750bcf.jpg",
            "http://img.973.com/newspic/7db/7db758a2215a803fad99f586ae7c9787.jpg",
            "http://pic9.nipic.com/20100908/1304280_110709063517_2.jpg",
            "http://ww3.sinaimg.cn/large/a8a2249djw1dxcnox2sirj.jpg",
            "http://pic6.nipic.com/20100408/3017209_004258840970_2.jpg"
        ];
        weixin.previewImages(picList[2], picList);
    });


}
