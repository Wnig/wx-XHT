//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMask: false, //客服蒙版弹窗
    user: false,
    versions: '1.0.2', //当前版本号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkGetSetting();
  },

  //查看是否授权
  checkGetSetting() {
    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        _this.setData({
          code: res.code
        });

        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getUser });
      }
    });
  },

  //获取用户信息
  getUser(res) {
    // console.log(res);
    let _this = this;

    if (res.userInfo != '' && res.userInfo != undefined && res.userInfo.sex != '') {
      // 已经授权，可以直接调用 getUserInfo 获取头像昵称
      let obj = {
        userId: res.userId,
        nickName: res.userInfo.name,
        gender: res.userInfo.sex,
        avatarUrl: res.userInfo.avatarImageUrl,
        address: res.userInfo.area,
        phone: res.userInfo.phone,
      };

      app.globalData.userInfo = obj;
      _this.setData({ user: obj });

    } else {
      _this.setData({ user: false });
    };
  },

  /**
   * 进入页面
   */
  enterPage(e) {
    let url = e.currentTarget.dataset.url;
    if (url)
      wx.navigateTo({
        url: url
      })
  },

  //客服蒙弹窗
  isMaskShow() {
    this.setData({
      isMask: !this.data.isMask
    });
  },

  // 电话客服
  callKf() {
    let customerTelephone = app.globalData.serviceField.customerTelephone;
    wx.makePhoneCall({
      phoneNumber: customerTelephone //仅为示例，并非真实的电话号码
    })
  },

  //获取手机号
  getPhoneNumber(e) {
    let _this = this;

    wx.login({
      success: res => {
        if (e.detail.encryptedData) {
          let postData = {
            code: res.code,
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
          };

          app.dataPost({ url: 'rest/getPhoneNumber', data: postData, success: _this.getPhone });
        };
      }
    });
  },

  getPhone(res) {
    let _this = this;

    // console.log(res);

    wx.login({
      success: res2 => {
        console.log(res2);
        let obj = {
          code: res2.code,
          userId: app.globalData.userId,
          nickName: app.globalData.userInfo.nickName,
          gender: app.globalData.userInfo.gender,
          avatarUrl: app.globalData.userInfo.avatarUrl,
          address: app.globalData.userInfo.address,
          phone: res.data.phoneNumber,
          encryptedData: res2.encryptedData,
          iv: res2.iv
        };

        app.globalData.userInfo = obj;
        // console.log(obj);
        app.dataGet({ url: 'rest/updateMallFansUser?code=' + obj.code + '&userId=' + obj.userId + '&nickName=' + obj.nickName + '&gender=' + obj.gender + '&avatarUrl=' + obj.avatarUrl + '&address=' + obj.address + '&phone=' + obj.phone + '&encryptedData=' + obj.encryptedData + '&iv=' + obj.iv, success: _this.getUserData });

      }
    });
  },

  //获取用户信息
  getUserData(res) {
    console.log(res);
    this.setData({ user: app.globalData.userInfo });
    // console.log(app.globalData.userInfo);
  },

  // 弹窗提示
  tipsAlert(str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 2000
    });
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