//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isMask: false,
    hasGoods: true,
    isShoper: false,
    shopId: '', //店铺id
    pageNum: 0, //当前页
    pageSize: 6, //显示几条
    totalPage: 0, //总页数
    hasMore: true,//列表是否加载完
    shopProductList: [],//店铺商品列表
    userShopInfo: [], //店铺信息
    isTopMenu: 0, //判断是否点击头部菜单
    downloadProgress: null,//图片加载进度
    imgCount: 3,
    isopen: false, //是否开过店铺
    userFormId: '', //传到下一页的formId
    serPromise: [
      {
        text: '自营产品'
      },
      {
        text: '自买省钱'
      },
      {
        text: '分享赚钱'
      }
    ],
    productList: [], //人气推荐
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let str = '';
    if (JSON.stringify(options) != "{}") {
      console.log('通过链接-二维码进入');
      if (options.isopen) {
        this.setData({
          isopen: true
        });
      } else {
        this.setData({
          isopen: false
        });
      };
      if (options.scene) {
        console.log('通过二维码进入');
        let scene = options.scene;
        let returnContent = '3';

        //解析店铺id
        app.dataGet({
          url: 'mobile/fansUserShop/loadInfoByRedisId?redisId=' + scene + '&returnContent=' + returnContent, success: this.loadInfoByRedisId
        });
      } else {
        this.setData({
          userShopId: options.shopid,
          userFormId: options.formid
        });
        this._loads();
      };

      this.setData({
        isShoper: false,
      });

      str = 'TA的小店';
    } else {
      console.log('从我的店铺进入');
      this.setData({
        isShoper: true
      });

      str = '我的店铺';
      this.setData({ isTopMenu: 1});
      this._load();
    };
    this._loadData();
    this.setTitleText(str);
  },

  loadInfoByRedisId(res) {
    console.log('二维码参数解析：：：', res);

    this.setData({
      userShopId: res.data.userShopId,
      userFormId: res.data.shareUserFormId,
    });

    this._loads();
  },

  //我的店铺
  _load() {
    let postData = {
      fansUserId: app.globalData.userId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }

    app.dataPost({ url: 'mobile/fansUserShop/myShop', data: postData, success: this.myShop });
  },

  myShop(res) {
    console.log(res);

    if (res.data.userShopInfo) {
      //用户店铺信息
      this.setData({
        userShopInfo: res.data.userShopInfo,
        shopId: res.data.userShopInfo.id,
      });
    };
  },

  _loadData() {
    let postData = {
      businessId: app.globalData.businessId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };
    console.log('我的店铺:::;', postData);
    app.dataPost({ url: 'rest/product/homePageContent', data: postData, success: this.homePage });
  },

  //首页数据
  homePage(res) {
    console.log('数据:::', res);
    if (res.status == 1) {
      this.setData({
        categoryList: res.data.categoryList,
        serviceTerms: res.data.serviceTerms
      });

      this.loadPopular();
    };
  },

  //加载人气推荐
  loadPopular() {
    if (this.data.hasMore) {
      let postData = {
        businessId: app.globalData.businessId,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      };
      console.log('人气推荐:::', postData);
      app.dataPost({ url: 'rest/product/homePageContent', data: postData, success: this.getPopular });
    }
  },

  //获取人气推荐数据
  getPopular(res) {
    console.log('人气推荐::::', res);
    if (!res.data.popularRecommend.productList && res.status == 1) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let productList = this.data.productList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    if (this.data.isTopMenu == 0) {
      res.data.popularRecommend.productList.forEach(arr => {
        productList.push(arr);
      });
    } else {
      productList = res.data.popularRecommend.productList
    };

    if (pageNum + 1 == res.data.popularRecommend.totalPage && (res.data.popularRecommend.productList.length < pageSize || res.data.popularRecommend.productList.length == pageSize)) {
      this.setData({ hasMore: false, isLoad: true })
    };

    if (pageNum + 1 > res.data.popularRecommend.totalPage) {
      this.setData({ hasMore: false, isLoad: true })
    } else {
      pageNum++;
      this.setData({ pageNum: pageNum });
    };

    this.setData({
      classifyMenuLabel: res.data.popularRecommend.label,
      productList: productList,
      isLoad: true
    });
  },

  //TA的小店
  _loads() {
    let postData = {
      userShopId: this.data.userShopId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }

    app.dataPost({ url: 'mobile/fansUserShop/hisShop', data: postData, success: this.hisShop });
  },

  hisShop(res) {
    console.log('他的小店:::', res);

    this.setData({
      fansUserId: res.data.userShopInfo.fansUserId
    });

    if (res.data.userShopInfo) {
      //用户店铺信息
      this.setData({
        userShopInfo: res.data.userShopInfo,
        shopId: res.data.userShopInfo.id,
      });
    };
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
      title: nickName + '邀请你光临TA的小店',
      path: 'pages/myShop/myShop?shopid=' + this.data.shopId + '&formid=' + this.data.shareUserFormId,
      imageUrl: '../../images/sample/shareshop.jpg'
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
    //邀请好友开店-生成小程序码
    let userId = app.globalData.userId;
    let page = 'pages/myShop/myShop';
    let shareUserFormId = this.data.shareUserFormId;

    let obj = {
      objectId: this.data.shopId,
      userId: userId,
      shareUserFormId: shareUserFormId,
      page: page,
      model: 'MallFansUserShop',
      field: 'share_Shop_QrCode',
    };

    app.dataGet({
      url: 'mobile/fansUserShop/qrCode?objectId=' + obj.objectId + '&userId=' + obj.userId + '&page=' + obj.page + '&model=' + obj.model + '&field=' + obj.field + '&shareUserFormId=' + obj.shareUserFormId, success: this.getQE
    });
  },

  getQE(res) {
    console.log(res);
    let obj = {
      nickName: res.data.nickName,
      avatar: res.data.avatarImageUrl,
      bgImg: res.data.backgroundImageUrl,
      qrcode: res.data.imgUrl,
      text1: '“邀请你光临TA的小店”',
      text2: '长按识别小程序码查看详情'
    }

    this.setData({
      drawInfo: obj
    });

    console.log(obj);

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
  * 进入页面
  */
  enterPage(e) {
    let url = e.currentTarget.dataset.url
    if (url)
      wx.navigateTo({
        url: url
      })
  },

  //进入开店页面
  enterOpen(e) {
    let url = e.currentTarget.dataset.url + '?userid=' + this.data.fansUserId + '&formid=' + this.data.userFormId;
    if (url)
      wx.navigateTo({
        url: url
      })
  },

  //进入上架商品页
  enterAddGoods() {
    let url = '../addedGoods/addedGoods?shopid=' + this.data.shopId;
    if (url)
      wx.navigateTo({
        url: url
      })
  },

  //进入详情页
  enterDetail(e) {
    let commodity = e.currentTarget.dataset.id;
    let isShoper = e.currentTarget.dataset.ishop;

    wx.navigateTo({
      url: '../details/details?id=' + JSON.stringify(commodity) + '&ishop=' + isShoper + '&shopid=' + this.data.shopId + '&formid=' + this.data.userFormId
    });
  },

  //进入分类列表
  enterPageClass(e) {
    let item = e.currentTarget.dataset.data;
    let isShoper = e.currentTarget.dataset.ishop;
    wx.navigateTo({
      url: '../classifyItem/classifyItem?item=' + JSON.stringify(item) + '&ishop=' + isShoper + '&shopid=' + this.data.shopId + '&formid=' + this.data.userFormId
    })
  },

  //移出店铺-加入店铺
  removeShop(e) {
    let join = 0;

    let postData = {
      fansUserShopId: this.data.shopId,
      productId: e.currentTarget.dataset.id,
      type: join,
    };

    app.dataPost({ url: 'mobile/fansUserShop/shopAddOrDeleteProduct', data: postData, success: this.shopAddOrDeleteProduct });
  },

  shopAddOrDeleteProduct(res) {
    this.setData({
      pageNum: 0,
      isTopMenu: 1
    });
    
    this._load();
  },

  /**
   * 动态设置title
   */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
    })
  },

  //分享弹窗
  maskShow() {
    this.setData({
      isMask: !this.data.isMask
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
    let str = '';
    // console.log(this.data.isShoper);
    // this.setData({ isTopMenu: 1, hasMore: true, pageNum: 0, shopProductList: [] });

    if (this.data.isShoper) {
      str = '我的店铺';
      this._load();
    } else {
      str = 'TA的小店';
      this.setData({
        userShopId: this.data.userShopId,
        userFormId: this.data.userFormId
      });
      this._loads();
    };

    this.setTitleText(str);
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
    // wx.reLaunch({
    //   url: '../shop/shop'
    // })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let str = '';
    // console.log(this.data.isShoper);
    this.setData({ isTopMenu: 1, hasMore: true, pageNum: 0, productList: [] });

    if (this.data.isShoper) {
      str = '我的店铺';
      this._load();
    } else {
      str = 'TA的小店';
      this.setData({
        userShopId: this.data.userShopId
      });
      this._loads();
    };
    this._loadData();
    this.setTitleText(str);

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let str = '';
    // console.log(this.data.isShoper);
    this.setData({ isTopMenu: 0});

    if (this.data.isShoper) {
      this._load();
    } else {
      this.setData({
        userShopId: this.data.userShopId
      });
      this._loads();
    };

    this._loadData();
  }
})