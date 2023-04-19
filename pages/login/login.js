const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
      page: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.page) {
      this.setData({
        page: options.page,
      });

      if(this.data.page == 'open') {
        this.setData({
          pFansUserId: options.userid,
          userFormId: options.formid,
        });
      };
      if (this.data.page == 'detail') {
        this.setData({
          skuInfo: JSON.parse(options.sku),
          type: options.type,
          fansUserShopId: options.shopid,
          less: options.less,
          userFormId: options.formid
        });
      };
    };
    
  },

  //获取用户信息
  bindGetUserInfo(e) {
    console.log(e);
    let _this = this;

    // if (e.detail.userInfo == '' && e.detail.userInfo == undefined) {
      wx.login({
        success: res => {
          console.log(res.code);
          let code = res.code;
          let userId = app.globalData.userId;
          let nickName = e.detail.userInfo.nickName;
          let gender = e.detail.userInfo.gender;
          let avatarUrl = e.detail.userInfo.avatarUrl;
          let address = e.detail.userInfo.country + ' ' + e.detail.userInfo.province + ' ' + e.detail.userInfo.city;
          let phone = '';
          let encryptedData = e.detail.encryptedData;
          let iv = e.detail.iv;

          console.log(app.globalData);

          let obj = {
            code: code,
            userId: userId,
            nickName: e.detail.userInfo.nickName,
            gender: e.detail.userInfo.gender,
            avatarUrl: e.detail.userInfo.avatarUrl,
            address: address,
            phone: '',
            encryptedData: encryptedData,
            iv: iv
          };

          app.globalData.userInfo = obj;

          console.log(app.globalData.userInfo);

          app.dataPost({ url: 'rest/updateMallFansUser', data: obj, success: _this.getUserData });
        }
      });
    // };
  },

  getUserData(res2) {
    console.log(res2);

    if (res2.status == 1) {
      let _this = this;
      //参数传回上一页
      let pages = getCurrentPages();//当前页面
      let prevPage = pages[pages.length - 2];//上一页面

      if (prevPage) {
        prevPage.setData({//直接给上一页面赋值
          user: app.globalData.userInfo
        });
      };
      
      console.log('当前从page进来', _this.data.page);

      if (_this.data.page == 'open') {
        console.log('从开通店铺进来:::::');
        let url = '../freeOpen/freeOpen?userid=' + _this.data.pFansUserId + '&formid=' + _this.data.userFormId;
        wx.redirectTo({
          url: url
        });
      };

      if (_this.data.page == 'detail') {
        console.log('从商品详情进来:::::');
        let url = '../selCourse/selCourse?sku=' + JSON.stringify(_this.data.skuInfo) + '&type=' + _this.data.type + '&shopid=' + _this.data.fansUserShopId + '&less=' + _this.data.less + '&formid=' + _this.data.userFormId;
        wx.redirectTo({
          url: url
        });
      };

      if(_this.data.page == 'index') {
        console.log('从首页进来:::::');
        wx.switchTab({
          url: '../index/index',
        });
      };
      if (_this.data.page == 'shop') {
        console.log('从店铺进来:::::');
        wx.switchTab({
          url: '../shop/shop',
        });
      };
      if (_this.data.page == 'my') {
        console.log('从个人中心进来:::::');
        wx.switchTab({
          url: '../my/my',
        });
      };
      
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

  //登录
  login(res) {
    console.log(res);
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
    
  }
})