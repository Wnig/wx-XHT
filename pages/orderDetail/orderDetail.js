//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isKfMask: false, //客服蒙版
    status: '',
    good: {},
    orderId: '', //订单id
    mallOrderInfo: [], //订单信息
    serviceField: [], //服务时间
    // orderStatus: [
    //   {
    //     status: 0,
    //     flag: '砍价失败，退款中'
    //   },
    //   {
    //     status: 1,
    //     flag: '待分享'
    //   },
    //   {
    //     status: 2,
    //     flag: '砍价成功，待出行'
    //   },
    //   {
    //     status: 3,
    //     flag: '待评价'
    //   }
    // ],
    orderStatus: [
      {
        status: '06', //已完成
        flag: '已完成',
        btn: '再次购买'
      },
      {
        status: '11', //已取消
        flag: '已取消',
        btn: '再次购买'
      },
      {
        status: '12', //退款中
        flag: '砍价失败，退款中',
        btn: '再次购买'
      },
      {
        status: '16', //已退款
        flag: '已退款',
        btn: '再次购买'
      },
      {
        status: '02', //待砍价
        flag: '待砍价',
        btn: '分享砍价'
      },
      {
        status: '04', //待出行
        flag: '待出行',
        btn: '联系客服'
      },
      {
        status: '07', //待评价
        flag: '待评价',
        btn: '立即评价'
      },
      {
        status: '03', //待确认
        flag: '待确认',
        btn: '联系客服'
      },
      {
        status: '09', //待取消
        flag: '待取消',
        btn: '取消详情'
      },
      {
        status: '10', //取消成功
        flag: '取消成功',
        btn: ''
      },
      {
        status: '18', //取消失败
        flag: '取消失败',
        btn: ''
      },
      {
        status: '19', //退款失败
        flag: '退款失败',
        btn: '联系客服'
      },
    ], 
    aPrice: '', //成人价
    cPrice: '', //儿童价
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ 
      orderId: options.order,
      status: options.status,
      serviceField: app.globalData.serviceField
    });

    this._load();
  },

  _load() {
    let orderId = this.data.orderId;

    app.dataGet({ url: 'mobile/order/orderDetail?orderId=' + orderId, success: this.myOrder });
  },

  myOrder(res) {
    console.log(res);
    let obj = res.data.mallOrderInfo;
    this.setData({
      proInfo: res.data.mallOrderInfo
    });
    for (let i = 0; i < obj.skuProperty.length; i++) {
      if (obj.skuProperty[i].field == 'departure_date') {
        obj.departure_date = obj.skuProperty[i].option;
      };
      if (obj.skuProperty[i].field == 'departure') {
        obj.departure = obj.skuProperty[i].option;
      };
    };
    
    obj.statusText = this.analysisStatus(obj.orderStatusCode);
    obj.btnText = this.analysisBtnText(obj.orderStatusCode);

    if (res.data.mallOrderInfo.type == 0) {
      this.setData({
        aPrice: this.calculateSub(res.data.mallOrderInfo.adultRealPrice, res.data.mallOrderInfo.less),
        cPrice: this.calculateSub(res.data.mallOrderInfo.childrenRealPrice, res.data.mallOrderInfo.less),
      });
    } else {
      this.setData({
        aPrice: res.data.mallOrderInfo.adultRealPrice,
        cPrice: res.data.mallOrderInfo.childrenRealPrice,
      });
    };
    
    console.log(obj);
    this.setData({
      mallOrderInfo: obj,
      isLoad: true
    });
  },

  //取消订单
  cancelOrder(e) {
    let id = e.currentTarget.dataset.id;
    let type = 1;
    wx.navigateTo({
      url: '../orderCancelDetail/orderCancelDetail?id=' + id + '&type=' + type,
    });
  },

  //取消订单详情
  orderDetail(e) {
    let id = e.currentTarget.dataset.id;
    let type = 2;
    wx.navigateTo({
      url: '../orderCancelDetail/orderCancelDetail?id=' + id + '&type=' + type,
    });
  },

  //客服蒙弹窗
  isMaskShow() {
    this.setData({
      isKfMask: !this.data.isKfMask
    });
  },

  //浮点数相减
  calculateSub(a, b) {
    var c, d, e;
    try {
      c = a.toString().split(".")[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split(".")[1].length;
    } catch (f) {
      d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (this.calculateMul(a, e) - this.calculateMul(b, e)) / e;
  },

  //浮点数相乘
  calculateMul(a, b) {
    var c = 0,
      d = a.toString(),
      e = b.toString();
    try {
      c += d.split(".")[1].length;
    } catch (f) { }
    try {
      c += e.split(".")[1].length;
    } catch (f) { }
    return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
  },

  /**
   * 根据当前订单状态计算操作按钮文字
   */
  analysisBtnText(sta) {
    let TEXT
    this.data.orderStatus.forEach(item => {
      if (item.status == sta) TEXT = item.btn
    })
    return TEXT
  },

  /**
   * 根据订单状态码规则计算当前订单状态
   */
  analysisStatus(sta) {
    let CONTENT
    this.data.orderStatus.forEach(item => {
      if (item.status == sta) CONTENT = item.flag
    })
    return CONTENT
  },

  //进入评价页 
  enterEval(e) {
    let item = e.target.dataset.item;
    let url = '../evaluate/evaluate?item=' + JSON.stringify(item);
    this.enterPage(url);
  },

  //分享弹窗
  maskShow() {
    this.setData({
      isMask: !this.data.isMask
    });
  },

  //打开弹窗
  openMask(e) {
    this.setData({
      orderProductId: e.target.dataset.id,
      isMask: !this.data.isMask
    });
  },

  //确认收货
  confirmReceipt(e) {
    let id = e.target.dataset.id;

    this.setData({
      orderId: id,
      orderstatus: '07',
    });

    this.updateOrder();
  },

  //再次购买
  buyAgain(e) {
    console.log(e);
    let id = e.target.dataset.id;
    console.log(id);
    let url = '../details/details?id=' + JSON.stringify(id);
    this.enterPage(url);
  },

  /**
  * 进入页面
  */
  enterPage(url) {
    wx.navigateTo({
      url: url
    })
  },

  //分享链接
  onShareAppMessage(res) {
    if (res.from === 'button') {
     this.maskShow(); 
    }
    
    let nickName = app.globalData.appName || '欣宏途旅游'
    if (app.globalData.userInfo) {
      nickName = app.globalData.userInfo.nickName
    }

    return {
      from: 'button',
      title: nickName + '邀请你帮TA砍价',
      path: 'pages/share/share?scene=' + this.data.orderProductId,
      imageUrl: this.data.proInfo.skuImage
    }
  },

  //分享图片
  share() {
    this.load();
    wx.showLoading({
      title: '图片生成中',
    });
    this.maskShow();
  },

  load() {
    //分享砍价
    let productId = this.data.productId;
    let userId = app.globalData.userId;
    let page = 'pages/share/share';

    let obj = {
      objectId: this.data.orderProductId, //商品id
      userId: userId,
      page: page,
      model: 'MallOrderProduct',
      field: 'share_Less_QrCode',
    };

    app.dataGet({
      url: 'mobile/fansUserShop/qrCode?objectId=' + obj.objectId + '&userId=' + obj.userId + '&page=' + obj.page + '&model=' + obj.model + '&field=' + obj.field, success: this.getQE
    });
  },

  getQE(res) {
    console.log(res);
    let obj = {
      nickName: res.data.nickName,
      avatar: res.data.avatarImageUrl,
      goodImg: this.data.proInfo.skuImage,
      qrcode: res.data.imgUrl,
      productName: this.data.proInfo.productName,
      oprice: this.data.proInfo.realPrice,
      aprice: '',
      text1: '“邀请你帮TA砍价”',
      text2: '长按识别小程序码查看详情',
      shareNum: this.data.proInfo.shareTotal,
      less: this.data.proInfo.less,
    }

    this.setData({
      drawInfo: obj
    });

    console.log(this.data.drawInfo);

    //设置下载进度
    this.data.downloadProgress = this.data.imgCount;
    this.loadImg(this.data.drawInfo.avatar, 'avatar');
    this.loadImg(this.data.drawInfo.goodImg, 'goodImg');
    this.loadImg(this.data.drawInfo.qrcode, 'qrcode');

  },

  //画图
  draw() {
    let { nickName, avatar, goodImg, qrcode, productName, oprice, aprice, text1, text2, shareNum, less } = this.data.drawInfo;

    // 画白底
    const ctx = wx.createCanvasContext('myCanvas')

    ctx.setFillStyle('#ECF5FF')
    ctx.fillRect(0, 0, 375, 580)

    ctx.drawImage(goodImg, 15, 15, 345, 340)
    ctx.setFillStyle('#000')
    ctx.setFontSize(14)
    ctx.fillText('￥', 20, 390)
    ctx.setFontSize(20)
    const metrics = ctx.measureText('' + oprice + '');
    const len = metrics.width + 40;

    ctx.fillText(oprice, 32, 390)
    ctx.setFontSize(14)
    ctx.setFillStyle('#FFA816')
    ctx.fillText('分享' + shareNum + '砍价，立省' + less + '元', len, 390)

    ctx.setFontSize(14)
    ctx.setFillStyle('#000')

    ctx.fillText(productName.slice(0, 24), 20, 416)
    ctx.fillText(productName.slice(24), 20, 436)

    ctx.setLineJoin('round')
    ctx.setShadow(0, 1, 6, 'rgba(0,0,0,0.15)')
    ctx.setFillStyle('#fff')
    ctx.fillRect(15, 455, 345, 112)
    ctx.setShadow(0, 0, 0, '#fff')
    ctx.setLineJoin('bevel')

    ctx.drawImage(qrcode, 257, 467, 88, 88)

    ctx.setFillStyle('#000')
    ctx.setFontSize(16)
    ctx.setFillStyle('#000')
    ctx.fillText(nickName, 30, 486)
    ctx.setFontSize(16)
    ctx.fillText(text1, 30, 517)
    ctx.setFillStyle('#FFA816')
    ctx.setFontSize(12)
    ctx.fillText(text2, 30, 544)

    // ctx.save()
    // ctx.beginPath()
    ctx.arc(257 + 44, 467 + 44, 20, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#fff')
    ctx.stroke()
    ctx.clip()
    ctx.drawImage(avatar, 257 + 24, 467 + 24, 40, 40)
    // ctx.restore()
    ctx.draw(false, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 375,
          height: 580,
          destWidth: 375 * 3,
          destHeight: 580 * 3,
          canvasId: 'myCanvas',
          success(res) {
            let shareList = [];
            shareList[0] = res.tempFilePath;
            wx.hideLoading()
            wx.previewImage({
              current: shareList[0],
              urls: shareList
            })
          }
        })
      }, 100)
    })
  },

  //加载图片进度
  loadImg(url, name) {
    wx.downloadFile({
      url,
      success: res => {
        this.data.downloadProgress--;
        this.data.drawInfo[name] = res.tempFilePath;
        !this.data.downloadProgress && this.draw();
      }
    })
  },


  /**
  * 进入页面
  */
  // enterPage(e) {
  //   let url = e.target.dataset.url
  //   if (url)
  //     wx.navigateTo({
  //       url: url
  //     })
  // },

  // 电话客服
  callKf() {
    wx.makePhoneCall({
      phoneNumber: this.data.serviceField.customerTelephone //仅为示例，并非真实的电话号码
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
    
  }
})