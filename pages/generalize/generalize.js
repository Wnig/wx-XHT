//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    pageNum: 0,
    pageSize: 20,
    list: [],
    loadType : 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.rewardOrder();
  },

  //资产详情
  rewardOrder() {
    let postData = {
      fansUserId: app.globalData.userId,
      type: 2,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };

    app.dataPost({ url: 'mobile/fansUserShop/rewardDetailOrPromoteOrder', data: postData, success: this.rewardDetail });
  },

  rewardDetail(res) {
    console.log(res);

    if (!res.data.list) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let list = this.data.list;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    if (this.data.loadType == 1) {
      res.data.list.forEach(item => {
        for (let i = 0; i < item.skuProperty.length; i++) {
          if (item.skuProperty[i].field == 'departure_date') {
            item.departure_date = item.skuProperty[i].option;
          };
          if (item.skuProperty[i].field == 'departure') {
            item.departure = item.skuProperty[i].option;
          };
        };
      });

      res.data.list.forEach(item => {
        list.push(item);
      });
    } else {
      list = res.data.list;
    };

    this.setData({
      list: list,
      isLoad: true
    });

    if (pageNum + 1 < res.data.totalPage) {
      pageNum++;
      this.setData({ pageNum: pageNum, hasMore: true });
    } else {
      this.setData({ hasMore: false });
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
    if (this.data.hasMore) {
      this.setData({
        loadType: 1
      });

      this.rewardOrder();
    }

  }
})