//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    promoteMakeMoney: '',
    howToList: [{
        id: '1',
        title: '如何推广赚钱1'
      }, {
        id: '2',
        title: '如何推广赚钱2'
      }, {
        id: '3',
        title: '如何推广赚钱3'
      }, {
        id: '4',
        title: '如何推广赚钱4'
    }],
    menus: ['分享商品', '分享店铺', '邀请开店'],
    selInd: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this._load();
  },

  _load() {
    let interfaceType = '2';
    let tabType = this.data.selInd + 1;
    console.log('tab值', tabType);
    app.dataGet({ url: 'mobile/fansUserShop/aboutUsOrPromoteMakeMoney?interfaceType=' + interfaceType + '&tabType=' + tabType, success: this.aboutUsOrPromoteMakeMoney });
  },

  aboutUsOrPromoteMakeMoney(res) {
    console.log(res);
    this.setData({
      promoteMakeMoney: res.data.promoteMakeMoney,
      isLoad: true
    });
  },

  //菜单点击
  menuTab(e) {
    // console.log(e);
    this.setData({
      selInd: e.currentTarget.dataset.index
    });
    this._load();
  },

  //进入商品详情页面
  enterDetail(e) {
    let howtolist = e.currentTarget.dataset.howtolist
    wx.navigateTo({
      url: '../howToDetail/howToDetail?list=' + JSON.stringify(howtolist)
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
    
  }
})