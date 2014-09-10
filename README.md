WeixinAPI
=========

Another Weixin WebView API

-------------------

微信API封装, finscn ( @大城小胖 ) 版.

参考了 <https://github.com/zxlie/WeixinApi> 的实现, 但做了非常大的改动，所以没有fork。

和 zxlie版本比 ，代码方面设计思路不同, 代码体积更小.


其他的详见代码注释 和 example 吧.


##### 已知bug

微信 5.4 Android版下, 分享到朋友圈时, 总是返回ok,
且返回两次.疑似微信android版本的bug.

建议在 shareTimeline 的 ready事件中做回调, 避免重复操作.


-------------------
#### 简单示例:

```

var weixin = new WeixinAPI({
    timeout: 2500,
    onReady: function() {
        $id("weixinState").innerHTML = "WeixinAPI is ready";
    },
    onTimeout: function() {
        $id("weixinState").innerHTML = "WeixinAPI is timeout";
    }
});
weixin.init();



var shareData = {
    title: "标题: 测试",
    desc: "描述: WeixinAPI 大城小胖 版 测试.",
    img_url: weixin.getAbsolutePath("share-icon.jpg")
};

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

```