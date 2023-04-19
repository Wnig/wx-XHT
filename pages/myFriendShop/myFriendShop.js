//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isMask: false,
    isHas: '',
    wxHao: '',
    pageNum: 0, //当前页
    pageSize: 20, //显示页数
    userShopList: [],//用户店铺列表
    hasMore: true, //列表是否加载完
    isNoData: false, //判断是否有数据
    loadType: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadFriendShop();
  },

  loadFriendShop() {
    if (this.data.hasMore) {
      let postData = {
        fansUserId: app.globalData.userId,
        businessId: app.globalData.businessId,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      }

      app.dataPost({ url: 'mobile/fansUserShop/friendShop', data: postData, success: this.friendShop });
    }
  },

  //朋友的店-获取数据
  friendShop(res) {
    console.log(res);
    if (!res.data.userShopList) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let userShopList = this.data.userShopList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    if (this.data.loadType == 1) {
      res.data.userShopList.forEach(item => {
        item.createDate = item.createDate.substring(0, 4) + '年' + item.createDate.substring(5, 7) + '月' + item.createDate.substring(8, 10) + '日';
      });
      res.data.userShopList.forEach(item => {
        userShopList.push(item);
      });
    } else {
      userShopList = res.data.userShopList;
    };

    this.setData({
      userShopList: userShopList,
      isLoad: true
    });

    if (pageNum + 1 < res.data.totalPage) {
      pageNum++;
      this.setData({ pageNum: pageNum, hasMore: true });
    } else {
      this.setData({ hasMore: false });
    };
  },

  //加微信
  isMaskShow(e) {
    let has = e.currentTarget.dataset.has;
    let wx = e.currentTarget.dataset.wx;

    if(has == 'no') {
      this.setData({
        isHas: true,
        wxHao: wx
      });
    } else {
      this.setData({
        isHas: false,
        wxHao: wx
      });
    };

    this.setData({
      isMask: true
    });
  },

  //关闭
  closeMask() {
    this.setData({
      isMask: false
    });
  },

  //一键复制
  copyTBL: function (e) {
    var self = this;
    wx.setClipboardData({
      data: self.data.wxHao,
      success: function (res) {
        wx.showToast({
          title: '成功',
          duration: 1000
        })  
      }
    });
  },

  //查看店铺
  hisShop(e) {
    let isopen = true;
    let userFormId = '';
    wx.navigateTo({
      url: '../myShop/myShop?shopid=' + e.currentTarget.dataset.shopid + '&isopen=' + isopen + '&formid=' + userFormId,
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
    if (this.data.hasMore) {
      this.setData({
        loadType: 1
      });

      this.loadFriendShop();
    }

  }
})