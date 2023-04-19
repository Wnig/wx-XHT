//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    isMask: false,
    pageNum: 0, //当前页
    pageSize: 8, //当前显示页数
    betfairProductList: [], //必发素材
    hasMore: true, //加载更多
    productId: '', //商品id
    productIdArr: [], //商品id数组
    productDataArr: [], //选中商品数组
    proInfo: '', //商品信息
    shopid: '', //店铺id
    downloadProgress: null,//图片加载进度
    imgCount: 3,
    shareLen: 10, //分享数量
    gwcMask: false, //购物车弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      shopid: options.shopid
    });
    this._load();
  },

  //今日必发
  _load() {
    let postData = {
      businessId: app.globalData.businessId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };

    app.dataPost({ url: 'mobile/fansUserShop/todayBetfairProduct', data: postData, success: this.todayBetfairProduct });
  },

  todayBetfairProduct(res) {
    console.log(res);

    if (!res.data.betfairProductList) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let betfairProductList = this.data.betfairProductList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;


    if (this.data.isTopMenu == 0) {
      res.data.betfairProductList.forEach(arr => {
        arr.isSelected = false;
        betfairProductList.push(arr);
      });
    } else {
      res.data.betfairProductList.forEach(arr => {
        arr.isSelected = false;
      });
      betfairProductList = res.data.betfairProductList;
    };

    if (pageNum + 1 == res.data.totalPage && (res.data.betfairProductList.length < pageSize || res.data.betfairProductList.length == pageSize)) {
      this.setData({ hasMore: false })
    };

    if (pageNum + 1 > res.data.totalPage) {
      this.setData({ hasMore: false, isLoad: true })
    } else {
      pageNum++;
      this.setData({ pageNum: pageNum, betfairProductList: betfairProductList, isLoad: true });
    };
  },

  //购物车弹窗蒙版
  gwcOpen() {
    this.setData({
      gwcMask: !this.gwcMask
    });
  },

  gwcMaskShow() {
    this.setData({
      gwcMask: false
    });
  },

  //多选-分享
  itemSelected(e) {
    console.log('当前选择索引', e.currentTarget.dataset.index);
    console.log('当前选择id', e.currentTarget.dataset.id);

    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;

    let item = this.data.betfairProductList[index];

    let productIdArr = this.data.productIdArr;
    let productDataArr = this.data.productDataArr;

    if (item.isSelected) {
      let ind = productIdArr.indexOf(id);

      if (ind > -1) {
        productIdArr.splice(ind, 1);
        this.setData({
          productIdArr: productIdArr
        });
      };

      for (let j = 0; j < productDataArr.length; j++) {
        if (item.id == productDataArr[j].id) {
          productDataArr.splice(j, 1);
        };
      }

      this.setData({
        productDataArr: productDataArr
      });
    } else {
      productIdArr.push(id);
      productDataArr.push(item);
      this.setData({
        productIdArr: productIdArr,
        productDataArr: productDataArr
      }); 

      if (productIdArr.length > this.data.shareLen) {
        //超过10个，删除第一个
        productIdArr.splice(0, 1);
        this.setData({
          productIdArr: productIdArr
        });

        this.data.betfairProductList.forEach(item => {
          if (item.id == productDataArr[0].id) {
            item.isSelected = false;
          };
        });

        productDataArr.splice(0, 1);
        this.setData({
          productDataArr: productDataArr
        });
      };
    };

    item.isSelected = !item.isSelected;

    this.setData({
      betfairProductList: this.data.betfairProductList,
    });

    console.log('多选id数组:::::', this.data.productIdArr);
    console.log('多选数组数据:::::', this.data.productDataArr);
  },

  //删除选中商品
  delSel(e) {
    console.log('当前选择删除索引', e.currentTarget.dataset.index);
    console.log('当前选择删除id', e.currentTarget.dataset.id);

    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;

    let item = this.data.betfairProductList[index];

    let productIdArr = this.data.productIdArr;
    let productDataArr = this.data.productDataArr;

    let ind = productIdArr.indexOf(id);

    if (ind > -1) {
      productIdArr.splice(ind, 1);
      this.setData({
        productIdArr: productIdArr
      });
    };

    this.data.betfairProductList.forEach(arr => {
      if (arr.id == productDataArr[index].id) {
        arr.isSelected = false;
      };
    });

    productDataArr.splice(ind, 1);
    this.setData({
      productDataArr: productDataArr
    });

    this.setData({
      betfairProductList: this.data.betfairProductList,
    });
  },

  openMask(e) {
    this.setData({
      proInfo: e.target.dataset.item,
      productId: e.target.dataset.item.id,
      isMask: !this.data.isMask
    });
    console.log(this.data.proInfo);
    console.log(this.data.productId);
  },

  //分享弹窗
  maskShow() {
    this.setData({
      isMask: !this.data.isMask
    });
  },

  //进入详情
  enterPage(e) {
    let id = e.currentTarget.dataset.id;
    let isShoper = 'yes';
    let formid = '';
    console.log(id);
    console.log(this.data.shopid);
    wx.navigateTo({
      url: '../details/details?id=' + JSON.stringify(id) + '&ishop=' + isShoper + '&shopid=' + this.data.shopid + '&formid=' + formid
    });
  },

  //分享链接
  onShareAppMessage(res) {
    this.setData({
      proInfo: this.data.productDataArr,
      productId: this.data.productIdArr.join(',')
    });
    if (res.from === 'button') {
      // 来自页面内转发按钮
      this.maskShow();
      let nickName = app.globalData.appName || '欣宏途'
      if (app.globalData.userInfo) {
        nickName = app.globalData.userInfo.nickName
      };

      let userId = app.globalData.userId;
      let paths = '';
      let imageUrl = '';

      if (this.data.productIdArr.length == 1) {
        paths = 'pages/details/details?id=' + JSON.stringify(this.data.productId) + '&userid=' + userId + '&shopid=' + this.data.shopid + '&formid=' + this.data.shareUserFormId;
        imageUrl = this.data.proInfo[0].listCoverImage;
      } else {
        paths = 'pages/friendShare/friendShare?id=' + JSON.stringify(this.data.productId) + '&userid=' + userId + '&shopid=' + this.data.shopid + '&formid=' + this.data.shareUserFormId;
        imageUrl = '../../images/sample/shareshop.jpg';
      };

      console.log('商品信息:::', this.data.proInfo);
      console.log('商品id:::', this.data.productId);
      return {
        from: 'button',
        title: nickName + '向你推荐好物',
        path: paths,
        imageUrl: imageUrl
      }
    };
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
    console.log('分享赚钱商品详情fromid:::', e.detail.formId);

    this.setData({
      shareUserFormId: e.detail.formId
    });
  },

  load() {
    this.setData({
      proInfo: this.data.productDataArr,
      productId: this.data.productIdArr
    });
    //分享赚钱
    let productId = this.data.productIdArr.join(',');
    let userId = app.globalData.userId;
    let page = '';
    if (this.data.productIdArr.length == 1) {
      page = 'pages/details/details';
      this.setData({
        imageUrl: this.data.proInfo[0].listCoverImage
      });
    } else {
      page = 'pages/friendShare/friendShare';
      this.setData({
        imageUrl: this.data.proInfo[0].listCoverImage
      });
    };
    
    let shareUserFormId = this.data.shareUserFormId;
    console.log('分享赚钱fromid', shareUserFormId);
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
    console.log(res);
    if (this.data.productIdArr.length == 1) {
     let  obj = {
        nickName: res.data.nickName,
        avatar: res.data.avatarImageUrl,
        goodImg: this.data.imageUrl,
        qrcode: res.data.imgUrl,
        productName: this.data.proInfo[0].name,
        oprice: this.data.proInfo[0].realPrice,
        aprice: '',
        text1: '“向你推荐好物”',
        text2: '长按识别小程序码查看详情',
        shareNum: this.data.proInfo[0].shareNum,
        less: this.data.proInfo[0].less,
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
    } else {
      let obj = {
        nickName: res.data.nickName,
        avatar: res.data.avatarImageUrl,
        bgImg: 'https://tour.xinhongt.com/imgXht/DefaultImage/shareShopBackgroundImage.jpg',
        qrcode: res.data.imgUrl,
        text1: '“向你推荐好物”',
        text2: '长按识别小程序码查看详情',
      };

      this.setData({
        drawInfo: obj
      });

      console.log(this.data.drawInfo);

      //设置下载进度
      this.data.downloadProgress = this.data.imgCount;
      this.loadImg(this.data.drawInfo.avatar, 'avatar');
      this.loadImg(this.data.drawInfo.bgImg, 'bgImg');
      this.loadImg(this.data.drawInfo.qrcode, 'qrcode');
    };
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

  draw2() {
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
        if (this.data.productIdArr.length == 1) {
          !this.data.downloadProgress && this.draw();
        } else {
          !this.data.downloadProgress && this.draw2();
        };
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
    // this._load();
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
    this.setData({
      isTopMenu: 0
    });
    this._load();
  }
})