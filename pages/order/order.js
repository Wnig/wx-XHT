import { Config } from '../../utils/config'
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false, //是否加载完成
    isComplete: false,
    isMask: false,
    isKfMask: false, //客服蒙版
    shareList: [],//分享图片列表
    tempItem: {},//临时保存当前订单对象
    actsheet: false,//actvisheet
    isFetch: false,//是否正在获取数据
    actsheet: false,//actvisheet
    isFetch: false,// 是否正在获取数据
    mf: '0', // 顶部菜单导航选中下标 默认为0
    tempStatus: '',//当前状态
    pageNum: 0, // 页码
    pageSize: 10,
    hasMore: true,
    status: '', //订单状态(传空时查全部订单，02:待砍价,04:待出行,07:待评价
    orderstatus: '', //订单状态
    timer: '',//倒计时定时器
    mf: '0', // 顶部菜单导航选中下标 默认为0
    loadType: '', //加载类型
    shareNum: 0, //待分享-数量
    menuType: [0],
    menu: [  // 顶部菜单列表与各类型订单数量
      {
        status: '',
        num: 0,
        name: '全部'
      },
      {
        status: '02',
        num: 0,
        name: '待砍价'
      },
      {
        status: '04',
        num: 0,
        name: '待出行'
      },
      {
        status: '07',
        num: 0,
        name: '待评价'
      }
    ],
    render: [],
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
    downloadProgress: null,//图片加载进度
    imgCount: 3,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //更改订单状态
  updateOrder() {
    let orderId = this.data.orderId;
    let orderStatus = this.data.orderstatus;

    app.dataGet({ url: 'mobile/order/updateOrderStatus?orderId=' + orderId + '&orderStatus=' + orderStatus, success: this.updateOrderStatus });
  },
  
  updateOrderStatus(res) {
    console.log(res);
    this.setData({
      loadType: 0
    });
    this._loadData();
  },

  /**
   * 请求订单数据
   */
  _loadData() {
    let postData = {
      fansUserId: app.globalData.userId,
      businessId: app.globalData.businessId,
      orderStatus: this.data.status, //订单状态(传空时查全部订单，02: 待砍价, 04: 待出行, 07: 待评价
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };

    console.log(postData);

    app.dataPost({ url: 'mobile/order/myOrder', data: postData, success: this.myOrder });
  },

  myOrder(res) {
    console.log(res);
    let obj = res.data.myOrderList;

    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    this.assignmentRender(obj); // 渲染数据 添加订单操作按钮
    if (pageNum + 1 < res.data.totalPage) { // 判断是否还有数据
      console.log(pageNum);
      pageNum++
      this.setData({ pageNum: pageNum, hasMore: true });
    } else {
      this.setData({ hasMore: false });
    }
  },

  //获取分享数量
  getShareNum() {
    let postData = {
      fansUserId: app.globalData.userId,
      businessId: app.globalData.businessId,
      orderStatus: '02', //订单状态(传空时查全部订单，02: 待砍价, 04: 待出行, 07: 待评价
      pageNum: 0,
      pageSize: 10
    };

    console.log(postData);

    app.dataPost({ url: 'mobile/order/myOrder', data: postData, success: this.myOrderTotal });
  },

  myOrderTotal(res) {
    this.setData({
      shareNum: res.data.myOrderTotal
    });
  },

  //确认收货
  confirmReceipt(e) {
    let id = e.currentTarget.dataset.id;

    this.setData({
      orderId: id,
      orderstatus: '07',
    });

    this.updateOrder();
  },

  //取消订单
  cancelOrder(e) {
    let id = e.currentTarget.dataset.id;
    let type = 1;
    wx.navigateTo({
      url: '../orderCancelDetail/orderCancelDetail?id=' + id + '&type='+ type,
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

  // 电话客服
  callKf() {
    let customerTelephone = app.globalData.serviceField.customerTelephone;
    wx.makePhoneCall({
      phoneNumber: customerTelephone //仅为示例，并非真实的电话号码
    })
  },

  /**
  * 进入页面
  */
  enterPage(url) {
    wx.navigateTo({
      url: url
    })
  },

  //进入评价页 
  enterEval(e) {
    let item = e.currentTarget.dataset.item;
    let url = '../evaluate/evaluate?item=' + JSON.stringify(item);
    this.enterPage(url);
  },

  //进入详细页
  enterDetail(e) {
    let id = e.currentTarget.dataset.order;
    let status = e.currentTarget.dataset.status;

    let url = '../orderDetail/orderDetail?order=' + id + '&status=' + status;

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
      proInfo: e.currentTarget.dataset.item,
      orderProductId: e.currentTarget.dataset.id,
      isMask: !this.data.isMask
    });
  },

  //分享链接
  onShareAppMessage(res) {
    if (res.from === 'button') {
     this.maskShow();
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
    }
  },

  //进入分享页
  enterShare(e) {
    let id = e.currentTarget.dataset.id;
    let url = '../share/share?scene=' + id;
    wx.navigateTo({
      url: url,
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
    let { nickName, avatar, goodImg, qrcode, productName, oprice, aprice, text1, text2,  shareNum, less } = this.data.drawInfo;

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

  //再次购买
  buyAgain(e) {
    console.log(e);
    let id = e.currentTarget.dataset.id;
    let url = '../details/details?id=' + JSON.stringify(id);
    this.enterPage(url);
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
    let c = setInterval(() => {
      if (app.globalData.userId) {
        this.setData({
          loadType: 0,
        });
        this._loadData();
        clearInterval(c)
      }
    }, 10)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    setTimeout(() => {
      this.setData({ pageNum: 0, isComplete: false })
    }, 300)
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
    let c = setInterval(() => {
      if (app.globalData.userId) {
        this.setData({
          loadType: 0,
        });
        this._loadData();
        clearInterval(c)
      }
    }, 10);

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.setData({
        loadType: 1
      });
      this._loadData();
    } 
  },

  /**
   * 订单顶部菜单导航点击事件
   */
  select: function (event) {
    if (this.data.isFetch) return // 如果此时正在获取数据则此次点击无效
    let mf = event.currentTarget.dataset.index;
    let status = event.currentTarget.dataset.item.status;
    this.setData({ status: status });
    this.menuHighLight(mf);
    this.setData({ isFetch: true, pageNum: 0, loadType: 0 });
    this._loadData();
    console.log('loadType:' + this.data.loadType);
  },

  /**
   * 菜单导航选中高亮
   */
  menuHighLight: function (index) {
    this.setData({ mf: index })
  },

  /**
   * 渲染数据赋值
   */
  assignmentRender: function (obj) {
    let render = this.data.render
    if (obj) {
      if (this.data.loadType == 1) {
        obj.forEach(item => {
          if (item.restTime) {
            item.restTimeArr = this.analysisRestTime(item.restTime)
          }
          for (let i = 0; i < item.skuProperty.length; i++) {
            if (item.skuProperty[i].field == 'departure_date') {
              item.departure_date = item.skuProperty[i].option;
            };
            if (item.skuProperty[i].field == 'departure') {
              item.departure = item.skuProperty[i].option;
            };
          };

          item.statusText = this.analysisStatus(item.orderStatusCode);
          item.btnText = this.analysisBtnText(item.orderStatusCode);

          render.push(item);
        });
      } else {
        obj.forEach(item => {
          if (item.restTime) {
            item.restTimeArr = this.analysisRestTime(item.restTime)
          }
          for (let i = 0; i < item.skuProperty.length; i++) {
            if (item.skuProperty[i].field == 'departure_date') {
              item.departure_date = item.skuProperty[i].option;
            };
            if (item.skuProperty[i].field == 'departure') {
              item.departure = item.skuProperty[i].option;
            };
          };

          item.statusText = this.analysisStatus(item.orderStatusCode);
          item.btnText = this.analysisBtnText(item.orderStatusCode);
        });
        render = obj;
      };
    } else {
      render = [];
    };

    this.setData({ render: render, isFetch: false, isComplete: true });
    console.log(this.data.render);
    this.countDown()
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
   * 页面定时开始倒计时
   */
  countDown() {
    let _this = this;
    clearInterval(this.data.timer)
    var timer = setInterval(() => {
      this.data.render.forEach(item => {
        if (item.remainTime) {
          item.remainTime--
          if (item.remainTime <= 0) {
            item.isEnd = true;
            let orderId = item.id;
            if (item.orderStatusCode) {
              _this.isShareEnd(orderId);
            };
          } else {
            item.restTimeArr = this.analysisRestTime(item.remainTime)
          };
        } else {
          item.isEnd = false;
        };
      })
      this.setData({ render: this.data.render })
    }, 1000)
    this.setData({ timer: timer })
  },

  //分享时间为零时调用接口
  isShareEnd(orderId) {
    app.dataGet({ url: 'mobile/order/updateBargainFailOrder?orderId=' + orderId, success: this.updateBargainFailOrder });
  },

  updateBargainFailOrder(res) {
    console.log('分享结束:::', res);
    if (res.status == '1') {
      this.data.render.forEach((item) => {
        if (item.remainTime == 0) {
          item.isEnd = false;
          item.statusText = this.analysisStatus(item.orderStatusCode);
          item.btnText = this.analysisBtnText(item.orderStatusCode);
        }
      });
      this.setData({ render: this.data.render })
      this.setData({
        loadType: 0,
      });
      this._loadData();
    };
  },
})