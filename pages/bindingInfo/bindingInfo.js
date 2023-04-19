//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_first_action: true, //是否第一次点击
    selBank: '请选择',
    name: '',
    idCard: '',
    bankCard: '',
    phone: '',
    userShopId: '',
    bankArray: [],
    bankNameId: '',
    code: '', //验证码
    isEnd: true, //倒计时是否结束
    countDown: 60, //发送验证码倒计时
    clickNum: 0, //点击发送短信次数
    redisId: '', //发送短信返回的redisId
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.dataGet({ url: 'mobile/fansUserShop/findBankNameList', success: this.findBankNameList });
  },

  //获取银行卡列表
  findBankNameList(res) {
    console.log(res);
    this.setData({
      bankArray: res.data
    });

    console.log(this.data.bankArray);
  },

  bindPickerChange(e) {
    for (let i = 0; i < this.data.bankArray.length; i++) {
      if (i == e.detail.value) {
        this.setData({
          bankNameId: this.data.bankArray[i].bankNameId
        });
      };
    };

    this.setData({
      selBank: '',
      index: e.detail.value
    });
  },

  //输入文本
  inputVal(e) {
    let types = e.currentTarget.dataset.type;
    
    if (types == 'name') {
      this.setData({
        name: e.detail.value
      });
    };
    if (types == 'idCard') {
      this.setData({
        idCard: e.detail.value
      });
    };
    if (types == 'bankCard') {
      this.setData({
        bankCard: e.detail.value
      });
    };
    if (types == 'phone') {
      this.setData({
        phone: e.detail.value
      });
    };
    if (types == 'code') {
      this.setData({
        code: e.detail.value
      });
    };
  },

  // 提交数据
  enterNext() {
    let regIdCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    let regBankCard = /^([1-9]{1})(\d{14}|\d{18})$/;
    let regPhone = /^[1][3,4,5,7,8,9][0-9]{9}$/;

    let _this = this;

    let postData = {
      fansUserId: app.globalData.userId,
      name: this.data.name,
      idCard: this.data.idCard,
      bankNameId: this.data.bankNameId,
      bankCard: this.data.bankCard,
      phone: this.data.phone,
      userShopId: this.data.userShopId,
      verifyCode: this.data.code,
      redisId: this.data.redisId
    }

    console.log('绑定银行卡::::', postData);

    if (postData.name == '') {
      this.tipsAlert('姓名不能为空');
    } else if (postData.idCard == '') {
      this.tipsAlert('身份证不能为空');
    } else if (postData.bankCard == '') {
      this.tipsAlert('银行卡不能为空');
    } else if (postData.phone == '') {
      this.tipsAlert('手机号不能为空');
    } else if (postData.verifyCode == '') {
      this.tipsAlert('验证码不能为空');
    } else {
      if (!regIdCard.test(postData.idCard)) {
        this.tipsAlert('请输入正确身份证号');
      } else if (!regBankCard.test(postData.bankCard)) {
        this.tipsAlert('请输入正确银行卡号');
      } else if (!regPhone.test(postData.phone)) {
        this.tipsAlert('请输入正确手机号');
      } else if (postData.redisId == '') {
        this.tipsAlert('验证码错误');
      }  else {
        if (this.data.is_first_action) {
          this.setData({
            is_first_action: false
          });
          app.dataPost({ url: 'mobile/fansUserShop/bindingBankCard', data: postData, success: _this.getShopInfo });
        };
      };
    }
  },

  //绑定用户信息
  getShopInfo(res) {
    console.log(res);
    wx.showLoading({
      title: '信息提交中',
    });
    if (res.data == '' && res.status == '1') {

      wx.hideLoading();
      this.setData({
        is_first_action: true
      });

      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.hideLoading();
      this.setData({
        is_first_action: true
      });
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      })
    }
  },

  // 弹窗提示
  tipsAlert(str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 2000
    });
  },

  //发送验证码
  sendCode() {
    let clickNum = this.data.clickNum;

    if (clickNum > 2) {
      this.tipsAlert('最多发送3次短信');
      return;
    } else {
      let regPhone = /^[1][3,4,5,7,8,9][0-9]{9}$/;
      if(this.data.phone == '') {
        this.tipsAlert('手机号不能为空');
      } else if (!regPhone.test(this.data.phone)) {
        this.tipsAlert('请输入正确手机号');
      } else {
        clickNum++;
        this.setData({
          isEnd: false,
          clickNum: clickNum
        });
        let countDown = 60;
        this.countDownTime(countDown);

        app.dataGet({ url: 'mobile/fansUserShop/bindingBankCardSendCode?phone=' + this.data.phone, success: this.bindingBankCardSendCode });
      };
      
    };
  },

  bindingBankCardSendCode(res) {
    console.log('验证码::::', res);
    this.tipsAlert(res.msg);
    this.setData({
      redisId: res.data.redisId
    });
  },

  //发送验证码倒计时
  countDownTime(val) {
    if (this.data.countDown == 0) {
      this.setData({
        isEnd: true,
        countDown: 60
      });
    } else {
      this.setData({
        countDown: val--
      });
      let _this = this;
      setTimeout(function () {
        _this.countDownTime(val);
      }, 1000);
    };
    // console.log('当前码数::::', this.data.countDown);
  },

  /**
  * 进入页面
  */
  enterPage(url) {
    if (url)
      wx.navigateTo({
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