//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMask: false,
    downloadProgress: null,//图片加载进度
    imgCount: 3,
    userId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    };
    
    let nickName = app.globalData.appName || '欣宏途'
    if (app.globalData.userInfo) {
      nickName = app.globalData.userInfo.nickName
    }
    console.log('推荐开店用户id:', app.globalData.userInfo.userId);

    let userId = this.data.userId;

    return {
      from: 'button',
      title: nickName + '邀请你开通旅行社网店',
      path: 'pages/creatingShop/creatingShop?userid=' + userId + '&formid=' + this.data.shareUserFormId,
      imageUrl: '../../images/sample/shareopen.jpg'
    }
   
  },

  /**
  * 进入页面
  */
  enterPage() {
    app.globalData.enterOpenShop = false;
    wx.switchTab({
      url: '../shop/shop',
    });
  },

  //分享图片
  share() {
    this.load();
    wx.showLoading({
      title: '图片生成中',
    });
    this.maskShow();
  },

  postForm(e) {
    console.log('商品详情fromid:::', e.detail.formId);

    this.setData({
      shareUserFormId: e.detail.formId
    });
  },


  load() {
    ///邀请好友开店-生成小程序码
    let objectId = app.globalData.userId;
    let page = 'pages/creatingShop/creatingShop';
    let shareUserFormId = this.data.shareUserFormId;

    let dataPost = {
      objectId: objectId,
      userId: objectId,
      shareUserFormId: shareUserFormId,
      page: page,
      model: 'MallFansUserShop',
      field: 'open_Shop_QrCode',
    };

    app.dataPost({ url: 'mobile/fansUserShop/qrCode', data: dataPost, success: this.getQE });
  },

  getQE(res) {
    console.log(res);
    let obj = {
      nickName: res.data.nickName, 
      avatar: res.data.avatarImageUrl, 
      bgImg: res.data.backgroundImageUrl, 
      qrcode: res.data.imgUrl, 
      text1: '“邀请你免费开通旅行社网店”',
      text2: '长按识别小程序码查看详情'
    }

    this.setData({
      drawInfo: obj
    });

    //设置下载进度
    this.data.downloadProgress = this.data.imgCount;
    this.loadImg(this.data.drawInfo.avatar, 'avatar');
    this.loadImg(this.data.drawInfo.bgImg, 'bgImg');
    this.loadImg(this.data.drawInfo.qrcode, 'qrcode');

  },

  //画图
  draw() {
    let { nickName, avatar, bgImg, qrcode, text1, text2 } = this.data.drawInfo;

    // 画白底
    const ctx = wx.createCanvasContext('myCanvas')

    ctx.setFillStyle('#64A5FF')
    ctx.fillRect(0, 0, 375, 580)

    ctx.drawImage(bgImg, 0, 0, 375, 580)

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
    ctx.setFillStyle('#FF972C')
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
            console.log(res);
            let shareList = [];
            shareList[0] = res.tempFilePath;
            wx.hideLoading();
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
    let _this = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getUserLogin });
      }
    });
  },

  getUserLogin(res) {
    console.log(res);
    this.setData({
      userId: res.userId
    });
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