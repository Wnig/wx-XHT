const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nomore: true,
    pageNum: 0,
    pageSize: 20,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.id) return;
    let productId = options.id;
    this.setData({ productId: productId });
    this._load();
  },
  
  _load() {
    let postData = {
      productId: this.data.productId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };

    app.dataPost({
      url: 'rest/product/productShareUser', data: postData, success: this.productShareUser
    });
  },

  productShareUser(res) {
    console.log(res);
    if (res.data.totalPage - 1 <= this.data.pageNum) {
      this.setData({ nomore: true })
    };

    this.data.pageNum++;

    res.data.shareUserList.forEach(item => {
      if (item.remainTime === 0) {
        item.isEnd = true;
        return
      };

      if (item.remainTime) {
        item.restTimeArr = this.analysisRestTime(item.remainTime)
      };
    });

    // console.log(res.data.shareUserList);

    let share = [];

    for (let i = 0; i < res.data.shareUserList.length; i++) {
      share.push(res.data.shareUserList[i])
    }

    this.setData({
      share: share
    });

    this.countDown();
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    if (this.data.nomore) return;
    this._load();
  },

  setTitleText() {
    let num = this.data.share.length
    wx.setNavigationBarTitle({
      title: num + '人在分享立减'
    })
  },

  /**
   * 根据可分享订单剩余时间多少秒转换成时分秒格式
   */
  analysisRestTime(time) {
    let ARR = new Array()
    if (time > -1) {
      let hour = Math.floor(time / 3600)
      let min = Math.floor(time / 60) % 60
      let sec = time % 60
      hour < 10 ? ARR[0] = '0' + hour : ARR[0] = hour
      min < 10 ? ARR[1] = '0' + min : ARR[1] = min
      sec < 10 ? ARR[2] = '0' + sec : ARR[2] = sec
    }
    return ARR
  },

  /**
   * 页面定时开始倒计时
   */
  countDown() {
    setInterval(() => {
      let obj = this.data.share
      obj.forEach(item => {
        if (item.remainTime) {
          item.remainTime--
          if (item.remainTime <= 0) {
            item.isEnd = true;
          } else {
            item.restTimeArr = this.analysisRestTime(item.remainTime)
          }
        }
      })
      this.setData({ share: obj })
    }, 1000)
  },
})