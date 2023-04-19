//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    aboutUs: '', //关于我们
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let interfaceType = '1';
    let tabType = '';
    app.dataGet({ url: 'mobile/fansUserShop/aboutUsOrPromoteMakeMoney?interfaceType=' + interfaceType + '&tabType=' + tabType, success: this.aboutUsOrPromoteMakeMoney });
  },

  aboutUsOrPromoteMakeMoney(res) {
    console.log(res);
    this.setData({
      aboutUs: res.data.aboutUs
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