//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isTopMenu: 0,
    pageNum: 0, 
    pageSize: 8,
    hasMore: false,
    myCollectList: [], //收藏列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  _load() {
    let postData = {
      fansUserId: app.globalData.userId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }
    app.dataPost({ url: 'mobile/fansUser/myCollect', data: postData, success: this.myCollect });
  },

  myCollect(res) {
    console.log(res);

    if (!res.data.myCollectList) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let myCollectList = this.data.myCollectList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;


    if (this.data.isTopMenu == 0) {
      res.data.myCollectList.forEach(arr => {
        myCollectList.push(arr);
      });
    } else {
      myCollectList = res.data.myCollectList;
    };

    if (pageNum + 1 == res.data.totalPage && (res.data.myCollectList.length < pageSize || res.data.myCollectList.length == pageSize)) {
      this.setData({ hasMore: false })
    };

    if (pageNum + 1 > res.data.totalPage) {
      this.setData({ hasMore: false, isLoad: true })
    } else {
      pageNum++;
      this.setData({ pageNum: pageNum, myCollectList: myCollectList, isLoad: true });
    };
  },

  //进入详情页
  enterDetail(e) {
    let commodity = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '../details/details?id=' + JSON.stringify(commodity)
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
    this.setData({ isTopMenu: 1, hasMore: true, pageNum: 0, myCollectList: [] });
    this._load();
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
    this.setData({
      isTopMenu: 0
    });
    this._load();
  }
})