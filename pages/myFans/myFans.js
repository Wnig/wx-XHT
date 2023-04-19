//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isHas: '',
    wxHao: '',
    pageNum: 0, //当前页
    pageSize: 20, //显示页数
    userShopList: [],//用户店铺列表
    hasMore: true, //列表是否加载完
    isNoData: false, //判断是否有数据
    userShopId: '', //店铺id
    loadType: 0, 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    
    this.setData({
      userShopId: options.shopid
    });
    this.loadFriendShop();
  },

  loadFriendShop() {
    if (this.data.hasMore) {
      let postData = {
        userShopId: this.data.userShopId,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      }

      console.log(postData);

      app.dataPost({ url: 'mobile/fansUserShop/myFans', data: postData, success: this.friendShop });
    }
  },

  //朋友的店-获取数据
  friendShop(res) {
    console.log(res);
    if (!res.data.myFansList) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let myFansList = this.data.myFansList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    if (this.data.loadType == 1) {
      res.data.myFansList.forEach(item => {
        item.createDate = item.createDate.substring(0, 4) + '年' + item.createDate.substring(5, 7) + '月' + item.createDate.substring(8, 10) + '日';
      });

      res.data.myFansList.forEach(item => {
        myFansList.push(item);
      });
    } else {
      myFansList = res.data.myFansList;
    };

    this.setData({
      myFansList: myFansList,
      isLoad: true,
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

      this.loadFriendShop();
    }

  }
})