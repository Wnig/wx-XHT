//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderFail: false,
    isPay: true,
    isEnd: false, //判断分享活动是否结束
    inputval: 0,
    plantime: 48, //预计到账时间
    productId: '', //订单商品id
    orderId: '', //订单id
    tips: [{
        status: 0,
        tip: '付款失败'
      }, {
        status: 1,
        tip: '付款成功'
      }, {
        status: 2,
        tip: '提现失败'
      }, {
        status: 2,
        tip: '提现成功'
    }],
    render: [], //订单信息
    downloadProgress: null,//图片加载进度
    imgCount: 3,
    // timer: '',//倒计时定时器
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('订单提示');
    console.log(options);
    options.orderfail == 'yes' ? this.setData({ orderFail: true }) : this.setData({ orderFail: false });
    options.ispay == 'yes' ? this.setData({ isPay: true, orderId: options.orderid}) : this.setData({ isPay: false, inputval: options.inputval });

    if (options.ispay == 'yes') {
        this._load();
    };

    if (options.ispay == 'no' && options.orderfail == 'no') {
      this.getPlanTime();
    };
    
  },

  // 分享-付款成功-显示订单详情-倒计时
  _load() {
    app.dataGet({ url: 'mobile/order/orderDetail?orderId=' + this.data.orderId, success: this.orderDetail });
  },

  orderDetail(res) {

    this.assignmentRender(res.data.mallOrderInfo);

    this.setData({
      productId: res.data.mallOrderInfo.orderProductId,
      proInfo: res.data.mallOrderInfo,
      isLoad: true
    });
  },

  //提现成功-预计时间
  getPlanTime() {
    var timetamp = Number(new Date());
    var plantamp = this.data.plantime * 1000 * 60 * 60 + timetamp;
    var ti = new Date(plantamp);

    this.setData({
      planTime: this.getdate(ti),
      isLoad: true
    });
  },

  getdate(time) {
    var now = new Date(time),
      y = now.getFullYear(),
      m = now.getMonth() + 1,
      d = now.getDate();
    return m + "月" + d + "日 ";
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
   * 渲染数据赋值
   */
  assignmentRender(obj) {
    let render = this.data.render
    console.log(obj);
    if (obj) {
      if (obj.remainTime) obj.restTimeArr = this.analysisRestTime(obj.remainTime);
      render.push(obj);
    } else {
      render = [];
    };
    this.setData({ render: render });

    if (render[0].type == '0') {
      this.countDown();
    };

  },

  /**
   * 页面定时开始倒计时
   */
  countDown() {
    let _this = this;
    setInterval(() => {
      let item = _this.data.render[0];
      if (item.remainTime) {
        item.remainTime--
        if (item.remainTime <= 0) {
          _this.setData({
            isEnd: false
          });
        } else {
          _this.setData({
            isEnd: true
          });
          item.restTimeArr = _this.analysisRestTime(item.remainTime)
        }
        
      } else {
        _this.setData({
          isEnd: false
        });
      };
      _this.setData({ render: this.data.render, isLoad: true })
    }, 1000)

  },

  enterShare() {
    let url = '../share/share?scene=' + this.data.productId;
    wx.navigateTo({
      url: url,
    });
  },

  /**
  * 进入页面-首页
  */
  enterPage(e) {
    let url = e.currentTarget.dataset.url
    if (url)
      wx.reLaunch({
        url: url
      })
  },

  // 进入页面
  enterPage2(e) {
    let url = e.currentTarget.dataset.url
    if (url)
      wx.navigateTo({
        url: url
      })
  },

  //分享弹窗
  maskShow() {
    this.setData({
      isMask: !this.data.isMask
    });
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
    // console.log(this.data.productId);
    return {
      from: 'button',
      title: nickName + '邀请你帮TA砍价',
      path: 'pages/share/share?scene=' + this.data.productId,
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
      objectId: productId, //商品id
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
    ctx.fillText('分享' + shareNum + '人砍价，立省' + less + '元', len, 390)

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
    
  }
})