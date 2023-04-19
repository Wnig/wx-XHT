//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    hasMore: true,
    pageNum: 0,
    pageSize: 20,
    withdrawalDetailList: [],
    planTime: '',
    plantime: 48, //预计48小时后到账
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._load();
  },

  _load() {
    let postData = {
      fansUserId: app.globalData.userId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };

    app.dataPost({ url: 'mobile/fansUserShop/withdrawalDetail', data: postData, success: this.withdrawalDetail });
  },

  withdrawalDetail(res) {
    console.log(res);

    if (!res.data.withdrawalDetailList) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let withdrawalDetailList = this.data.withdrawalDetailList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    res.data.withdrawalDetailList.forEach(item => {
      if (item.financeStatusName) {
        var timetamp = new Date(item.withdrawTime.substring(0, 10)).getTime();
        var plantamp = this.data.plantime * 1000 * 60 * 60 + timetamp;
        var plantime = new Date(plantamp);

        item.planTime = this.getdate(plantime);
      } else {
        item.planTime = '';
      };

      withdrawalDetailList.push(item);
    });


    if (pageNum + 1 == res.data.totalPage && (res.data.withdrawalDetailList.length < pageSize || res.data.withdrawalDetailList.length == pageSize)) {
      this.setData({ hasMore: false })
    };

    if (pageNum + 1 > res.data.totalPage) {
      this.setData({ hasMore: false, isLoad:true })
    } else {
      pageNum++;
      this.setData({ pageNum: pageNum, withdrawalDetailList: withdrawalDetailList, isLoad: true });
    };
  },

  getdate(time) {
    var now = new Date(time),
    y = now.getFullYear(),
    m = now.getMonth() + 1,
    d = now.getDate();
    return m + "月" + d + "日";
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
    this._load();
  }
})