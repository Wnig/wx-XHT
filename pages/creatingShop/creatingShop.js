//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isOpenShop: 0,
    pFansUserId: 0,
    userFormId: '', //formId传到下一页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('开店：：：', options);
    app.globalData.enterOpenShop = true;
    console.log('this is creating page test:', app.globalData.enterOpenShop)
    
    const str = '免费开通旅行社';
    this.setTitleText(str);

    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getInfo});
      }
    });
    console.log('options::::', options);
    //判断是否有传值-无传值-默认为0-平台
    if (JSON.stringify(options) != "{}") {
      if (options.scene) {
        let scene = options.scene;
        let returnContent = '2';

        console.log('二维码进入');

        //解析店铺id
        app.dataGet({
          url: 'mobile/fansUserShop/loadInfoByRedisId?redisId=' + scene + '&returnContent=' + returnContent, success: this.loadInfoByRedisId
        });

      } else {
        this.setData({
          pFansUserId: options.userid,
          userFormId: options.formid
        });
      };

      console.log('通过粉丝邀请开店');
    } else {
      this.setData({
        pFansUserId: 0,
        userFormId: '',
      });
      console.log('通过平台开店');
    };
  },

  getInfo(res) {
    console.log('获取用户信息', res);

    let isOpenShop = app.globalData.isOpenShop || this.data.isOpenShop;
    this.setData({
      isOpenShop: isOpenShop
    });
    console.log('是否开店', isOpenShop);
    
    if (isOpenShop) {
      app.globalData.enterOpenShop = false
      wx.switchTab({
        url: '../shop/shop'
      });
    } else {
      console.log('未开过店铺');
      this.setData({
        isLoad: true
      });
    };
  },

  loadInfoByRedisId(res) {
    console.log('二维码参数解析：：：', res);

    this.setData({
      pFansUserId: res.data.userId,
      userFormId: res.data.shareUserFormId,
    });
  },

  /**
   * 动态设置title
   */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
    })
  },

  //免费开店-判断是否登录
  openShop(e) {
    this.checkGetSetting();
  },

  //查看是否授权
  checkGetSetting() {
    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getUser });
      }
    });
  },

  //获取用户信息
  getUser(res) {
    let _this = this;
    console.log('判断用户是否登录');
    console.log(res);
    if (res.userInfo != '' && res.userInfo != null && res.userInfo != undefined && res.userInfo.sex != '') {
      wx.navigateTo({
        url: '../freeOpen/freeOpen?userid=' + this.data.pFansUserId + '&formid=' + this.data.userFormId,
      });
    } else {
      let page = 'open';
      wx.navigateTo({
        url: '../login/login?page='+ page +'&userid=' + this.data.pFansUserId + '&formid=' + this.data.userFormId,
      });
    };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // wx.reLaunch({
    //   url: '../index/index'
    // })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})