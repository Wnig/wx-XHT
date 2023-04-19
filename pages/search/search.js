const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSearch: true, // 是否在搜索页面 或者有搜索结果
    deleteBtn: true, // 输入框内的删除按钮是否显示
    searchText: '', // 输入内容
    searchHistory: [], // 搜索记录
    searchRes: [], //搜索商品列表
    productIdArr: [], //商品id数组
    productDataArr: [], //商品数组
    pageNum: 0,
    pageSize: 10,
    hasMore: true,
    noResult: false,
    showSearchBtn:false,
    isEdit:false,//是否输入过数据
    loadType: 0, //加载类型
    type: '', //搜索类型
    topMenu: ['全部目的地', '销量', '价格'],
    isShowMenu: false, //头部筛选
    isMask: false,
    productTotal: 0, //所有商品数量
    isLoad: false, //判断数据是否加载完成
    selNum: 0,
    oldSelNum: 0, //上一次选择的索引
    lowtohigh: 0,
    hotAll: false,
    selHotNum: 0,
    isShoper: false, //是否是店主
    proInfo: '', //商品信息
    shopid: '', //店铺id
    downloadProgress: null,//图片加载进度
    imgCount: 3,
    shareLen: 10, //分享数量
    gwcMask: false, //购物车弹窗
    getRes: [], //获取res
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('分类:::::', options);
    if (options.ishop == 'yes') {
      this.setData({
        isShoper: true,
        formid: options.formid,
        ishop: options.ishop,
        shopid: options.shopid
      });
    } else {
      this.setData({
        isShoper: false
      });
      if (options.shopid) {
        this.setData({
          formid: options.formid,
          ishop: options.ishop,
          shopid: options.shopid
        });
      };
    };
    
    if (options.type) {
      this.setTitleText(options.name);
    } else {
      this.setTitleText('搜索');
    };
    

    this.setData({
      productCategoryId: options.type
    });

  },

  /**
   * 动态设置顶部title
   */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
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
    this._history()
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

  //头部菜单切换
  // selMenuTab(e) {
  //   let lowtohigh = this.data.lowtohigh;
  //   let hotAll = this.data.hotAll;

  //   this.setData({
  //     selNum: e.target.dataset.index
  //   });

  //   e.target.dataset.index == 0 ? this.setData({ hotAll: !hotAll }) : this.setData({ hotAll: false });

  //   if (e.target.dataset.index == 2) {
  //     //types - 2 - 升序; 3 - 降序
  //     lowtohigh == 1 ? this.setData({ lowtohigh: 2, types: 3 }) : this.setData({ lowtohigh: 1, types: 2 });
  //   } else {
  //     if (e.target.dataset.index == 1) {
  //       this.setData({ types: e.target.dataset.index });
  //     };
  //     this.setData({ lowtohigh: 0 });
  //   };

  //   this.setData({
  //     pageNum: 0,
  //     isTopMenu: 1,
  //     hasMore: true
  //   });
  //   console.log(this.data.tourDestinationId);
  //   this.getCommodity(this.data.tourDestinationId);
  // },

  //热门选择
  // selHotTab(e) {
  //   console.log(e);
  //   this.setData({
  //     name: e.target.dataset.name,
  //     tourId: e.target.dataset.id,
  //     selHotNum: e.target.dataset.index,
  //     // tourDestinationId: e.target.dataset.id
  //   });
  // },

  //热门选择-取消-确定-按钮
  // hotBtns(e) {
  //   let _type = e.target.dataset.type;
  //   let hotAll = this.data.hotAll;

  //   this.setData({
  //     hotAll: !hotAll
  //   });

  //   if (_type == 'yes') {
  //     this.setData({
  //       types: 0,
  //       isTopMenu: 1,
  //       pageNum: 0,
  //       categoryProduct: [],
  //       tourDestinationId: e.target.dataset.desid,
  //       oldSelNum: this.data.selHotNum
  //     });
  //     if (this.data.name == '全部' || this.data.name == '') {
  //       this.setData({
  //         'topMenu[0]': '全部目的地'
  //       });
  //     } else {
  //       this.setData({
  //         'topMenu[0]': this.data.name
  //       });
  //     };

  //     console.log('当前城市', this.data.topMenu[0]);
  //     console.log('yes - id:', this.data.tourDestinationId);
  //     this.getCommodity(this.data.tourDestinationId);
  //   };
  //   if (_type == 'no') {
  //     this.setData({
  //       selHotNum: this.data.oldSelNum
  //     });
  //   };
  // },

  /**
   * input框点击搜索
   */
  onConfirm (e) {
    this.setData({ pageNum: 0, hasMore: true, showSearchBtn: true, isEdit: true, loadType: 0, isShowMenu: true})
    this._getSearch();
  },

  /**
   * 根据关键字搜索数据
   */
  _getSearch () {
    let postData = {
      businessId: app.globalData.businessId,
      fansUserId: app.globalData.userId,
      content: this.data.searchText,
      productCategoryId: this.data.productCategoryId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };

    console.log('搜索商品::::', postData);

    app.dataPost({ url: 'rest/product/searchProduct', data: postData , success: this.searchProduct });
  },

  searchProduct(res) {
    console.log('搜索商品::::', res);

    if (!res.data.productList || res.data.productList.join('') === '') {
      this.setData({ noResult: true });
    } else {
      this.setData({ noResult: false });
    }

    this.getSearchRescallback(res);
  },

  /**
   * 获取搜索结果回调函数
   */
  getSearchRescallback (res) {
    console.log('获取搜索结果:::', res);
    let pageNum = this.data.pageNum;
    let searchRes = this.data.searchRes;
    if (this.data.loadType) {
      res.data.productList.forEach(item => {
        searchRes.push(item)
      });
    } else {
      searchRes = res.data.productList;
    };
    this.setData({ searchRes: searchRes, isSearch: false});
    if (pageNum + 1 < res.data.totalPage) {
      pageNum++;
      this.setData({ pageNum: pageNum});
    } else {
      this.setData({hasMore: false});
    };
  },

  /**
   * 请求历史搜索记录
   */
  _history () {
    let fansUserId = app.globalData.userId;

    app.dataGet({ url: 'mobile/fansUser/searchRecord?fansUserId=' + fansUserId, success: this.searchRecord });
  },

  /**
   * 获取历史搜索结果回调函数
   */
  searchRecord (res) {
    console.log('搜索历史记录::::', res);
    if (res.data.userSearchList) {
      this.setData({ searchHistory: res.data.userSearchList })
    };
  },

  /**
   * 输入框输入事件
   */
  onInput (e) {
    let text = e.detail.value
    text ? this.setData({ searchText: e.detail.value, deleteBtn: true, isSearch: false, isShowMenu: false }) : this.setData({ searchText: e.detail.value, deleteBtn: false })
  },

  /**
   * 输入框聚焦事件
   */
  onFocus () {
    this._history()
    this.setData({ isSearch: true, searchRes: [], noResult: false, showSearchBtn: true, isShowMenu: true})
  },

  /**
   * 清除用户输入框内容
   */
  deleteSearchText () {
    this.setData({ searchText: '', deleteBtn: false })
    this.onFocus()
  },

  /**
   * 用户点击取消返回上一级页面
   */
  backLast () {
    if(this.data.isEdit) {
      this.setData({ searchText: '', isSearch: true })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  },

  /**
   * 清空搜索记录
   */
  clearHistory () {
    if (this.data.searchHistory.length) {
      let _this = this;
      wx.showModal({
        title: '提示',
        content: '确定删除历史记录？',
        success: function (res) {
          if (res.confirm) {
            let fansUserId = app.globalData.userId;
            app.dataGet({ url: 'mobile/fansUser/deleteSearchRecord?fansUserId=' + fansUserId, success: _this.deleteSearchRecord });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })

    }
  },

  deleteSearchRecord(res) {
    wx.showToast({
      title: '删除成功',
      icon: 'none'
    });
    this.setData({ searchHistory: [] });
  },
  

  /**
   * 点击历史搜索记录
   */
  clickHistory (e) {
    let key = e.currentTarget.dataset.key
    this.setData({ searchText: key, deleteBtn: true, pageNum: 0, hasMore: true, showSearchBtn: false, loadType: 0 });
    this._getSearch();
  },

  enterDetail(e) {
    let commodity = e.currentTarget.dataset.id
    if (this.data.isShoper) {
      wx.navigateTo({
        url: '../details/details?id=' + JSON.stringify(commodity) + '&formid=' + this.data.formid + '&ishop=' + this.data.ishop + '&shopid=' + this.data.shopid
      });
    } else if (this.data.shopid) {
      wx.navigateTo({
        url: '../details/details?id=' + JSON.stringify(commodity) + '&formid=' + this.data.formid + '&ishop=' + this.data.ishop + '&shopid=' + this.data.shopid
      });
    } else {
      wx.navigateTo({
        url: '../details/details?id=' + JSON.stringify(commodity)
      });
    };
  },

  /**
   * 上拉加载
   */
  onScrollBottom () {
    console.log('上拉加载:::');
    console.log(this.data.hasMore);
    if (this.data.hasMore) {
      this.setData({
        loadType: 1
      });
      this._getSearch();
    }
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

  //分享弹窗
  maskShow() {
    this.setData({
      isMask: !this.data.isMask
    });
  },

  //多选-分享
  itemSelected(e) {
    console.log('当前选择索引', e.currentTarget.dataset.index);
    console.log('当前选择id', e.currentTarget.dataset.id);

    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;

    let item = this.data.searchRes[index];

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

        this.data.categoryProduct.forEach(item => {
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
      searchRes: this.data.searchRes,
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

    let item = this.data.searchRes[index];

    let productIdArr = this.data.productIdArr;
    let productDataArr = this.data.productDataArr;

    let ind = productIdArr.indexOf(id);

    if (ind > -1) {
      productIdArr.splice(ind, 1);
      this.setData({
        productIdArr: productIdArr
      });
    };

    this.data.searchRes.forEach(arr => {
      if (arr.id == productDataArr[index].id) {
        arr.isSelected = false;
      };
    });

    productDataArr.splice(ind, 1);
    this.setData({
      productDataArr: productDataArr
    });

    this.setData({
      searchRes: this.data.searchRes,
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
      let nickName = app.globalData.appName || '欣宏途旅游'
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
    //分享赚钱
    this.setData({
      proInfo: this.data.productDataArr,
      productId: this.data.productIdArr
    });
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
        imageUrl: 'https://tour.xinhongt.com/imgXht/DefaultImage/shareShopBackgroundImage.jpg'
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
      let obj = {
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
        bgImg: this.data.imageUrl,
        qrcode: res.data.imgUrl,
        text1: '“向你推荐好物”',
        text2: '长按识别小程序码查看详情',
      }

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
})