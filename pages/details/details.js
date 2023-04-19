//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isKfMask: false, //客服弹窗
    is_first_action: true, //判断是否第一次点
    tipShow: false, //弹窗
    isLoad: false,
    isMask: false,
    isShoper: false,
    isAdd: true,
    isCollect: false,
    good: {},
    banner: {
      autoplay: true,
      interval: 3000,
      duration: 400,
      circular: true,
    },
    current: 1,
    productId: '', //商品id
    mall: [], //商品详情
    productCommentList: [], //评论列表
    shareUserList: [], //分享列表
    fansUserShopId: '', //店铺id
    skuInfo: [], //规格信息
    type: '', //1：原价购买，0：分享购买
    shareType: 0, //0:普通分享;1:分享赚钱
    imgCount: 3,
    downloadProgress: null,//图片加载进度
    shareUserFormId: '', //formId - 分享出去的
    userFormId: '', //带到下一页的formId
    scene: '', //二维码传参
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('商品详情： options:');
    console.log(options);
    options.ishop == 'yes' ? this.setData({ isShoper: true }) : this.setData({ isShoper: false});  

    if (options.id) {
      this.setData({
        productId: JSON.parse(options.id)
      });

      if (options.shopid) {
        this.setData({
          fansUserShopId: options.shopid,
          userFormId: options.formid, //链接进入-fromId为-options.formid
        });
      } else {
        this.setData({
          fansUserShopId: 0,
          userFormId: '', //平台进入-formid为空
        });
      };
      console.log('首页进入-链接进入');
      this._load();
    } else {
      let scene = options.scene;
      let returnContent = '1';

      this.setData({
        scene: options.scene
      });

      console.log('二维码进入');

      //解析店铺id
      app.dataGet({
        url: 'mobile/fansUserShop/loadInfoByRedisId?redisId=' + scene + '&returnContent=' + returnContent, success: this.loadInfoByRedisId
      });
    };
  },

  loadInfoByRedisId(res) {
    console.log('二维码参数解析：：：', res);
    console.log('返回数据是否为空', JSON.stringify(res.data) == "{}");

    this.setData({
      productId: res.data.productId,
      fansUserShopId: res.data.userShopId,
      userFormId: res.data.shareUserFormId,
    });

    this._load();
  },

  _load() {
    let postData = {
      productId: this.data.productId,
      userId: app.globalData.userId,
      fansUserShopId: this.data.fansUserShopId,
    };

    console.log('商品详情： postData:');
    console.log(postData);

    app.dataPost({
      url: 'rest/product/productDetail', data: postData, success: this.getGoods });
  },

  //获取商品信息
  getGoods(res) {
    console.log('获取商品信息：');
    console.log(res);

    // 设置分享信息倒计时
    if (res.data.detail.shareUserList) {
      res.data.detail.shareUserList.forEach(item => {
        if (item.remainTime) {
          item.restTimeArr = this.analysisRestTime(item.remainTime)
        }
      })
    };

    let productCommentList = [];
    res.data.detail.productCommentList.forEach(item => {
      // console.log(item);
      for (let i = 0; i < item.skuProperty.length; i++) {
        if (item.skuProperty[i].field == 'departure_date') {
          item.departure_date = item.skuProperty[i].option;
        };
        if (item.skuProperty[i].field == 'departure') {
          item.departure = item.skuProperty[i].option;
        };
      };
    });
    productCommentList = res.data.detail.productCommentList;

    this.setData({
      mall: res.data.detail.mallProduct,
      shareUserList: res.data.detail.shareUserList,
      productCommentList: productCommentList,
      isLoad: true,
    });

    res.data.detail.isCollect ? this.setData({ isCollect: true }) : this.setData({ isCollect: false });

    let obj = {
      skuProperty: res.data.detail.skuProperty,
      mallProductNorm: res.data.detail.mallProductNorm,
      skus: res.data.skus,
      prices: res.data.detail.prices,
      cityCodeAndNameOuts: res.data.detail.cityCodeAndNameOuts,
      datePrices: res.data.detail.datePrices
    };

    this.setData({
      skuInfo: obj
    });

    this.countDown();

    console.log(this.data.skuInfo);
  },

  //图片滚动事件-获取当前滚动页
  onSlideChangeEnd: function (e) {
    var that = this;
    that.setData({
      current: e.detail.current + 1
    })
  },

  //客服蒙弹窗
  isMaskShow() {
    this.setData({
      isKfMask: !this.data.isKfMask
    });
  },

  // 电话客服
  callKf() {
    let customerTelephone = app.globalData.serviceField.customerTelephone;
    wx.makePhoneCall({
      phoneNumber: customerTelephone //仅为示例，并非真实的电话号码
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
      if (!this.data.shareUserList) return
      this.data.shareUserList.forEach(item => {
        if (item.remainTime) {
          item.remainTime--
          if (item.remainTime <= 0) {
            item.isEnd = true;
          } else {
            item.restTimeArr = this.analysisRestTime(item.remainTime)
          }
        }
      })
      this.setData({ shareUserList: this.data.shareUserList })
    }, 1000)
  },

  //分享弹窗
  maskShow() {
    this.setData({
      isMask: !this.data.isMask,
    });
  },

  isLogin() {
    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getUserLogin });
      }
    });
  },

  getUserLogin(res2) {
    console.log(res2);

    if (res2.userInfo != '' && res2.userInfo != null && res2.userInfo != undefined && res2.userInfo.sex != '') {
      this.maskShow();
    } else {
      let page = 'detailshare';

      wx.navigateTo({
        url: '../login/login?page=' + page,
      });
    };
  },

  //普通分享-弹窗
  openMask() {
    this.isLogin();
  },

  //分享赚钱-弹窗
  openShow() {
    // this.setData({
    //   shareType: 1, //0:普通分享;1:分享赚钱
    // });
    this.maskShow();
  },

  //分享链接
  onShareAppMessage(res) {
    if (this.data.isShoper) {
      if (res.from === 'button') {
        this.maskShow();
      };
      this.setData({
        shareType: 1, //0:普通分享;1:分享赚钱
      });
    } else {
      if (res.from === 'button') {
        this.maskShow();
      };
      this.setData({
        shareType: 0, //0:普通分享;1:分享赚钱
      });
    };
    
    let nickName = app.globalData.appName || '欣宏途旅游';
    let url = '';
    if (app.globalData.userInfo) {
      nickName = app.globalData.userInfo.nickName
    };

    let userId = app.globalData.userId;

    if (this.data.shareType) {
      url = '&userid=' + userId + '&shopid=' + this.data.fansUserShopId + '&formid=' + this.data.shareUserFormId;
    };

    return {
      from: 'button',
      title: nickName + '向你推荐好物',
      path: '/pages/details/details?id=' + JSON.stringify(this.data.productId) + url,
      imageUrl: this.data.mall.listCoverImage
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

  postForm(e) {
    console.log('商品详情fromid:::', e.detail.formId);

    this.setData({
      shareUserFormId: e.detail.formId
    });
  },

  load() {
    //普通分享-分享赚钱
    let productId = this.data.productId;
    let userId = app.globalData.userId;
    let page = 'pages/details/details';
    let shareUserFormId = this.data.shareUserFormId;

    let obj = {
      objectId: productId, //商品id
      userId: userId,
      shareUserFormId: shareUserFormId, //formId
      page: page,
      model: 'MallProduct',
      field: 'share_Product_QrCode',
    };

    app.dataGet({
      url: 'mobile/fansUserShop/qrCode?objectId=' + obj.objectId + '&userId=' + obj.userId + '&page=' + obj.page + '&model=' + obj.model + '&field=' + obj.field + '&shareUserFormId=' + obj.shareUserFormId, success: this.getQE
    });
  },

  getQE(res) {
    console.log('二维码：');
    console.log(res);
    let obj = {
      nickName: res.data.nickName,
      avatar: res.data.avatarImageUrl,
      goodImg: this.data.mall.listCoverImage,
      qrcode: res.data.imgUrl,
      productName: this.data.mall.name,
      oprice: this.data.mall.realPrice,
      aprice: '',
      text1: '“向你推荐好物”',
      text2: '长按识别小程序码查看详情',
      shareNum: this.data.mall.shareNum,
      less: this.data.mall.less,
    }

    this.setData({
      drawInfo: obj
    });
    
    console.log('商品详情分享图片信息：');
    console.log(this.data.drawInfo);

    //设置下载进度
    this.data.downloadProgress = this.data.imgCount;
    this.loadImg(this.data.drawInfo.avatar, 'avatar');
    this.loadImg(this.data.drawInfo.goodImg, 'goodImg');
    this.loadImg(this.data.drawInfo.qrcode, 'qrcode');
    console.log(this.data.downloadProgress);
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
            console.log(res);
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
   * 动态设置title
   */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
    })
  },

  /**
   * 点击轮播图预览详情
   */
  previewImg(e) {
    let curr = e.currentTarget.dataset.current
    let imgs = this.data.good.banner
    wx.previewImage({
      current: curr, // 当前显示图片的http链接
      urls: imgs // 需要预览的图片http链接列表
    })
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
  },

  //点击收藏
  collect() {
    let postData = {
      fansUserId: app.globalData.userId,
      productId: this.data.productId,
      isCollect: this.data.isCollect ? 0 : 1
    };

    app.dataPost({
      url: 'mobile/fansUser/collectOrDisCollect', data: postData, success: this.collectOrDisCollect
    });
  },

  collectOrDisCollect(res) {
    this.setData({
      isCollect: !this.data.isCollect
    });
    this.data.isCollect ? this.tipsAlert('收藏成功') : this.tipsAlert('取消收藏');
  },

  // 弹窗提示
  tipsAlert(str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 2000
    });
  },

  //提示弹窗
  tipsRule() {
    this.setData({
      tipShow: !this.data.tipShow
    });
  },

  /**
   * 商品详情点击首页返回首页
   */
  backPage() {
    let _this = this;
    if (this.data.is_first_action) {
      this.setData({ is_first_action: false });
      wx.switchTab({
        url: '../index/index',
        success: function (res) {
          _this.setData({ is_first_action: true });
        },
        fail: function(res) {
          _this.setData({is_first_action: false});
        }
      });
    };
  },

  /**
   * toast函数
   */
  showToast(text) {
    wx.showToast({
      title: text,
      icon: 'none'
    })
  },

  /**
  * 进入页面
  */
  enterPage(e) {
    let id = e.currentTarget.dataset.id;
    let url = e.currentTarget.dataset.url + '?id=' + id;
    
    if (url)
      wx.navigateTo({
        url: url
      })
  },

  //点击购买
  buyNow(e) {
    if (this.data.is_first_action) {
      this.setData({
        type: e.currentTarget.dataset.type, //判断是单独购买或者分享购买
        less: e.currentTarget.dataset.less, //立减金额
        is_first_action: false
      });
      this.checkGetSetting();
    };
  },

  //查看是否授权
  checkGetSetting() {
    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getUser });
      }
    });
  },

  //获取用户信息
  getUser(res2) {
    console.log('商品详情-点击购买-判断是否授权-获取用户信息:');
    console.log(res2);
    let _this = this;
    console.log('规格信息');
    console.log(this.data.skuInfo);
    if (res2.userInfo != '' && res2.userInfo != null && res2.userInfo != undefined && res2.userInfo.sex != '') {
      let url = '../selCourse/selCourse';
      wx.navigateTo({
        url: url + '?sku=' + JSON.stringify(this.data.skuInfo) + '&type=' + this.data.type + '&shopid=' + this.data.fansUserShopId + '&less=' + this.data.less + '&formid=' + this.data.userFormId,
      });
      this.setData({
        is_first_action: true
      });
    } else {
      let page = 'detail';
      wx.navigateTo({
        url: '../login/login?page=' + page + '&sku=' + JSON.stringify(this.data.skuInfo) + '&type=' + this.data.type + '&shopid=' + this.data.fansUserShopId + '&less=' + this.data.less + '&formid=' + this.data.userFormId,
      });
      this.setData({
        is_first_action: true
      });
    };
  },

  //移出店铺-加入店铺
  removeShop(e) {
    let types = e.currentTarget.dataset.join;
    let join = 0;
    types ? join = 0 : join = 1;

    let postData = {
      fansUserShopId: this.data.fansUserShopId,
      productId: this.data.productId,
      type: join,
    };

    app.dataPost({ url: 'mobile/fansUserShop/shopAddOrDeleteProduct', data: postData, success: this.shopAddOrDeleteProduct });
  },

  shopAddOrDeleteProduct(res) {
    this._load();
  },
})