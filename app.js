//app.js
let req = require('utils/request.js')
App({
  onLaunch: function () {
    let _this = this;
    let businessId = this.globalData.businessId;

    //登录
    wx.login({
      success: res => {
        console.log('app.js - onLaunch - 登录:::::', res);
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let code = res.code;
        console.log(businessId);
        _this.dataGet({ url: 'rest/newMallFansUser?code=' + code + '&businessId=' + businessId, success: _this.getUserData });
      }
    })
  },
  onHide() {
    let _this = this;
    let businessId = this.globalData.businessId;

    //登录
    wx.login({
      success: res => {
        console.log('app.js - onHide - 登录:', res);

        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let code = res.code;
        console.log(businessId);
        _this.dataGet({ url: 'rest/newMallFansUser?code=' + code + '&businessId=' + businessId, success: _this.getUserData });
      }
    })
  },
  getUserData(res2) {
    console.log('获取用户信息:', res2);

    let _this = this;
    // 如果有用户信息则将用户信息保存到全局 此后以此globalData为辨识 globalData没有则需要向后台提交保存当前用户的信息
    _this.globalData.userId = res2.userId;
    _this.globalData.appName = res2.businessName;
    _this.globalData.serviceField = res2.serviceField;
    console.log('userId::::::', res2.userId);
    console.log('userId::::::', _this.globalData.userId);
    _this.globalData.isOpenShop = res2.isOpenShop;

    let obj = {
      nickName: res2.userInfo.name,
      avatarUrl: res2.userInfo.avatarImageUrl,
    };

    _this.globalData.userInfo = obj;

    console.log('globalData:', _this.globalData);
  },  
  dataPost (options) {
    req.POST(options)
  },
  dataGet (options) {
    req.GET(options)
  },
  globalData: {
    userInfo: null,
    isOpenShop: 0,
    businessId: 'wxd3e134bfe257e910',
    isKnowRule: false,
    loginPrompt: '',
    appName: '',
    serviceField: null,
    city: '',
    enterOpenShop: false //判断是否有通过判断店铺是否开通然后跳转到店铺开通页面 
  }
})