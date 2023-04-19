//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false, 
    amount: 0, //可提现金额
    todayIncome: 0, //今日收入
    currentWeekIncome: 0, //本周收入
    currentMonthIncome: 0, //本月收入
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myWallet();
  },

  //我的钱包
  myWallet() {
    let fansUserId = app.globalData.userId;
    app.dataGet({ url: 'mobile/fansUserShop/myWallet?fansUserId=' + fansUserId, success: this.wallet });
  },

  wallet(res) {
    console.log(res);

    this.setData({
      amount: res.data.amount,
      todayIncome: res.data.todayIncome,
      currentWeekIncome: res.data.currentWeekIncome,
      currentMonthIncome: res.data.currentMonthIncome,
      isLoad: true
    });
  },

  /**
  * 进入页面
  */
  enterPage(e) {
    let url = e.currentTarget.dataset.url
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
    // wx.reLaunch({
    //   url: '../shop/shop',
    // })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.myWallet();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  }
})