// pages/friendShare/friendShare.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productList: [], //分享商品列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('好友分享options', options);
    if (options.scene) {
      let scene = options.scene;
      let returnContent = '1';

      this.setData({
        scene: options.scene
      });

      console.log('二维码进入');

      //解析店铺id
      app.dataGet({
        url: 'mobile/fansUserShop/loadInfoByRedisId?redisId=' + scene + '&returnContent=' + returnContent, success: this.loadInfoByRedisId
      });
    } else {
      this.setData({
        formid: options.formid,
        shopid: options.shopid,
        userid: options.userid,
        productIds: JSON.parse(options.id),
      });
      this._load();
    };
  },

  loadInfoByRedisId(res) {
    console.log('二维码参数解析：：：', res);

    this.setData({
      productIds: res.data.productId,
      shopid: res.data.userShopId,
      formid: res.data.shareUserFormId,
      userid: '',
    });

    this._load();
  },

  _load() {
    let postData = {
      productIds: this.data.productIds,
      businessId: app.globalData.businessId
    };
    app.dataPost({
      url: 'rest/product/shareProductList', data: postData, success: this.shareProductList
    });
  },

  shareProductList(res) {
    console.log('分享列表:::', res);

    if(res.status == 1) {
      this.setData({
        productList: res.data.productList
      });
    };
  },

  //进入详情
  enterDetail(e) {
    let id = e.currentTarget.dataset.id;
    console.log(e);
    wx.navigateTo({
      url: '../details/details?id=' + JSON.stringify(id) + '&userid=' + this.data.userid + '&shopid=' + this.data.shopid + '&formid=' + this.data.formid
    });
  },

  //分享链接
  onShareAppMessage(res) {
      // 来自页面内转发按钮
      let nickName = app.globalData.appName || '欣宏途旅游'
      if (app.globalData.userInfo) {
        nickName = app.globalData.userInfo.nickName
      };

    let paths = '';

    paths = 'pages/friendShare/friendShare?id=' + JSON.stringify(this.data.productIds) + '&userid=' + this.data.userId + '&shopid=' + this.data.shopid + '&formid=' + this.data.formid;

      return {
        from: 'button',
        title: nickName + '向你推荐好物',
        path: paths,
        imageUrl: '../../images/sample/shareshop.jpg'
      }
  },

  //进入开店页面
  enterOpen(e) {
    let url = e.currentTarget.dataset.url + '?userid=' + this.data.userid + '&formid=' + this.data.formid;
    if (url)
      wx.navigateTo({
        url: url
      })
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