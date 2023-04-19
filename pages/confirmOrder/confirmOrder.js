//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_first_action: true, //判断是否第一次点
    meal: '', //套餐信息
    isLoad: false, 
    tipShow: true, //弹窗
    name: '',
    phone: '',
    email: '',
    productNormId: '', //规格id（若买了成人票和儿童票传一个即可）
    userShopId: '', //粉丝店铺id 平台:0, 粉丝: 粉丝id
    adultNum: 0, //成人票数量，没有购买成人票adultNum传0
    childNum: 0, //儿童票数量，没有购买儿童票childrenNum传0
    type: '', //1：原价购买，0：分享购买
    realAmount: 0, //金额
    order: [], //商品信息
    orderId: '', //订单id
    realPrice: '', //实际价格
    adultPrice: '', //成人价格
    childPrice: '', //儿童价格
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      userFormId: options.formid, //formId
      adultNum: options.adult, //成人票数量，没有购买成人票adultNum传0
      childNum: options.child, //儿童票数量，没有购买儿童票childrenNum传0
      type: options.type, //1：原价购买，0：分享购买
      productNormId: options.id, //规格id（若买了成人票和儿童票传一个即可）
      order: JSON.parse(options.order), //商品信息
      userShopId: options.shopid, //粉丝店铺id 平台:0, 粉丝: 粉丝id
      isLoad: true,
      adultPrice: options.adultprice,
      childPrice: options.childprice,
      departure_date: options.departuredate,
      departure_: options.departure, //出发地
      meal: options.meal
    });
    
    this.setData({
      less: this.data.order.less, //立减
    });

    if(this.data.type == 0) {
      this.setData({
        aPrice: this.calculateSub(this.data.adultPrice, this.data.less),
        cPrice: this.calculateSub(this.data.childPrice, this.data.less),
      });
    } else {
      this.setData({
        aPrice: this.data.adultPrice,
        cPrice: this.data.childPrice,
      });
    };
    
    console.log('商品信息');
    console.log(this.data.order);

    this.amountCount();

    // console.log(this.data.realAmount);

    this._load();
  },

  _load() {
    let businessId = app.globalData.businessId;
    let fansUserId = app.globalData.userId;

    app.dataGet({ url: 'mobile/order/orderConfirmUserContactInfo?businessId=' + businessId + '&fansUserId=' + fansUserId, success: this.orderConfirmUser });
  },

  orderConfirmUser(res) {
    console.log(res);
    if(res.data != '') {
      this.setData({
        name: res.data.receiverName,
        phone: res.data.receiverPhone,
        email: res.data.contactEmail,
      });
    };
  },

  //确认订单
  orderData() {
    console.log('第一次点击:', this.data.is_first_action);
    let userShopId = this.data.userShopId;
    this.setData({
      userShopId: userShopId
    });

    this.amountCount();

    let postData = {
      shareUserFormId: this.data.userFormId, //formid
      fansUserId: app.globalData.userId, //用户id
      productNormId: this.data.productNormId, //规格id（若买了成人票和儿童票传一个即可）
      userShopId: this.data.userShopId, //粉丝店铺id 平台:0, 粉丝: 粉丝id
      realAmount: this.data.realAmount, //金额
      contactName: this.data.name, //联系人姓名
      contactPhone: this.data.phone, //联系人手机号
      contactEmail: this.data.email, //联系人邮箱
      adultNum: this.data.adultNum, //成人票数量，没有购买成人票adultNum传0
      childrenNum: this.data.childNum, //儿童票数量，没有购买儿童票childrenNum传0
      type: this.data.type, //1：原价购买，0：分享购买
    };

    console.log('确认订单-传参');
    console.log(postData);

    app.dataPost({ url: 'mobile/order/addOrder', data: postData, success: this.orderCon });
  },

  orderCon(res) {
    console.log('确认订单');
    console.log(res);
    let _this = this;

    wx.showLoading({
      title: '订单生成中...'
    });

    if (res.data.orderId) {
      let orderId = res.data.orderId;
      let businessId = app.globalData.businessId;
      this.setData({
        orderId: res.data.orderId
      });

      wx.login({  // 通过login去获取code （code只有五分钟有效期）将code传给后台换取支付签名包
        success: function (res1) {
          console.log(res1);
          if (res1.code) {
            console.log(res1.code);
            app.dataGet({ url: 'rest/weixinPay?orderId=' + orderId + '&code=' + res1.code + '& businessId=' + businessId, success: _this.orderPay });
          }
        }
      });
    } else {
      this.tipsAlert(res.data.msg);
    };
    
  },

  //订单支付
  orderPay(res2) {
    console.log(res2);
    let _this = this;

    wx.hideLoading();
    let obj = res2;
    if (res2) {
      wx.requestPayment({
        'timeStamp': obj.timeStamp,
        'nonceStr': obj.nonceStr,
        'package': obj.package,
        'signType': 'MD5',
        'paySign': obj.paySign,
        'success': function (res3) {
          console.log('paysuccess');
          _this.enterPage('no');
        },
        'fail': function (res3) {
          console.log(res3);
          console.log('payfail');
          let msg = res3.errMsg;
          if (msg != 'requestPayment:fail cancel') {
            _this.enterPage('yes');
          } else {
            _this.setData({
              is_first_action: true, //判断是否第一次点              
            });
          };
        }
      })
    };
  },

  //输入文本
  inputVal(e) {
    let types = e.currentTarget.dataset.type;

    if (types == 'name') {
      this.setData({
        name: e.detail.value
      });
    };
    if (types == 'phone') {
      this.setData({
        phone: e.detail.value
      });
    };
    if (types == 'email') {
      this.setData({
        email: e.detail.value
      });
    };
  },

  //去支付
  goPlay() {
    let name = this.data.name;
    let phone = this.data.phone;
    let email = this.data.email;

    let regPhone = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    let regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;

    if (name == '') {
      this.tipsAlert('姓名不能为空');
    } else if (phone == '') {
      this.tipsAlert('手机号不能为空');
    } else if (email == '') {
      this.tipsAlert('邮箱不能为空');
    } else if (!regPhone.test(phone)) {
      this.tipsAlert('请填写正确手机号');
    } else if (!regEmail.test(email)) {
      this.tipsAlert('请填写正确邮箱');
    } else {
      console.log('第一次点击:', this.data.is_first_action);
      if (this.data.is_first_action) {
        this.setData({
          is_first_action: false
        });
        console.log('第一次点击:', this.data.is_first_action);
        this.orderData();
      };
    };
  },
  
  //提示弹窗
  tipsRule() {
    this.setData({
      tipShow: !this.data.tipShow
    });
  },

  // 弹窗提示
  tipsAlert(str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 2000
    });
  },

  //总价
  amountCount() {
    if (this.data.adultNum > 0) {
      this.setData({
        realPrice: this.data.adultPrice
      });
    } else {
      this.setData({
        realPrice: this.data.childPrice
      });
    };

    if (this.data.type > 0) {
      this.setData({
        realPrice: this.data.realPrice,
      });
    } else {
      this.setData({
        realPrice: this.calculateSub(this.data.realPrice, this.data.less),
      });
    };

    if (this.data.type == '0') {
      let amountAdult = this.calculateSub(this.data.adultPrice, this.data.less);
      let amountChild = this.calculateSub(this.data.childPrice, this.data.less);

      //成人价
      if (this.data.adultNum == 0) {
        this.setData({
          amountAdult: 0
        });
      } else {
        this.setData({
          amountAdult: this.calculateMul(amountAdult, this.data.adultNum)
        });
      };

      //儿童价
      if (this.data.childNum == 0) {
        this.setData({
          amountChild: 0
        });
      } else {
        this.setData({
          amountChild: this.calculateMul(amountChild, this.data.childNum)
        });
      };

    } else {
      this.setData({
        amountAdult: this.calculateMul(this.data.adultPrice, this.data.adultNum),
        amountChild: this.calculateMul(this.data.childPrice, this.data.childNum)
      });
    };

    this.setData({
      realAmount: this.calculateAdd(this.data.amountAdult, this.data.amountChild),
    });

    // console.log('成人价:', this.data.amountAdult);
    // console.log('儿童价:', this.data.amountChild);
    // console.log('总价:', this.data.amount);
  },

  //浮点数求和
  calculateAdd(a, b) {
    var c, d, e;
    try {
      c = a.toString().split(".")[1].length; //截取成数组
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split(".")[1].length;
    } catch (f) {
      d = 0;
    }
    /*
    *   Math.pow(x, y)为 x 的y次幂；
    */
    return e = Math.pow(10, Math.max(c, d)), (this.calculateMul(a, e) + this.calculateMul(b, e)) / e;
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
  * 进入页面
  */
  enterPage(fail) {
    let orderFail = fail; //订单成功-失败
    let isPlay = 'yes'; //是否为支付页
    let url = '../orderTips/orderTips?orderfail=' + orderFail + '&ispay=' + isPlay + '&orderid=' + this.data.orderId;
    
    if (url)
      wx.redirectTo({
        url: url
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
    
  },
})