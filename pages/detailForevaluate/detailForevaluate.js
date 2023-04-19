const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nomore: false,
    pageNum: 0,
    pageSize: 20,
    evaluate: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let productId = options.id;
    this.setData({ productId: productId });
    this._load();
  },
  _load() {
    let postData = {
      productId: this.data.productId,
      pageNum: this.data.pageNum,
      pageSize: 20
    }

    app.dataPost({
      url: 'rest/product/productComment', data: postData, success: this.productComment
    });
  },

  productComment(res) {
    console.log(res);
    if (res.data.totalPage - 1 <= this.data.pageNum) {
      this.setData({
        nomore: true
      });
    };
    this.data.pageNum++;

    res.data.productCommentList.forEach(item => {
      for (let i = 0; i < item.skuProperty.length; i++) {
        if (item.skuProperty[i].field == 'departure_date') {
          item.departure_date = item.skuProperty[i].option
        };
        if (item.skuProperty[i].field == 'departure') {
          item.departure = item.skuProperty[i].option;
        };
      };
    });

    this.setData({
      evaluate: res.data.productCommentList,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
    if (this.data.nomore) return;
    this._load();
  },
  /**
   * 用户点击评价列表的图片 显示预览
   */
  previewEvaImg(e) {
    console.log(e);
    let curr = e.currentTarget.dataset.curr
    let arr = e.currentTarget.dataset.imgs
    wx.previewImage({
      current: curr, // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    })
  }
})