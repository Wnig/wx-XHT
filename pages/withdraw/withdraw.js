//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_first_action: true, //判断是否第一次点
    isLoad: false,
    maskShow: false,
    inputval: '',
    serviceCharge: 0,
    relVal: '',
    amount: 0,
    withdrawalMoney: '',
    withdrawalInstructions: [],
    isBankShow: false, //提现方式
    weixinChangeIsOpen: '', //微信零钱
    withdrawWays: '', //提款方式
    withdrawWayArr: [], //提款列表
    selNum: '', //选中按钮
    oldSelNum: '', //之前选中的按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  load() {
    let fansUserId = app.globalData.userId;
    let withdrawalMoney = this.data.withdrawalMoney;

    app.dataGet({ url: 'mobile/fansUserShop/changeWithdrawalData?fansUserId=' + fansUserId + '&withdrawalMoney=' + withdrawalMoney, success: this.withdrawals });
  },

  withdrawals(res) {
    console.log(res);
    if (res.status == 1) {
      this.setData({
        bankCard: res.data.bankCard, //银行卡号
        toAccountTime: res.data.toAccountTime, //到账时间
        amount: res.data.amount, //账户余额
        withdrawalInstructions: res.data.withdrawalInstructions, //提现说明
        serviceFee: res.data.serviceFee, //服务费
        realAmount: res.data.realAmount, //实际到账
        maxWithdrawalAmount: res.data.maxWithdrawalAmount, //最大提现金额
        minWithdrawalAmount: res.data.minWithdrawalAmount, //最小提现金额
        weixinChangeIsOpen: res.data.weixinChangeIsOpen, //微信零钱
        nickName: res.data.nickName, //用户名 
        isLoad: true,
      });

      if (this.data.weixinChangeIsOpen == '1') {
        this.setData({
          withdrawWays: '微信零钱(' + this.data.nickName + ')',
          withdrawWay: 1,
          oldSelNum: 0,
          selNum: 0,
        });
      } else if (this.data.bankCard != '') {
        this.setData({
          withdrawWays: '银行卡(' + this.data.bankCard + ')',
          withdrawWay: 2,
          oldSelNum: 1,
          selNum: 1,
        });
      } else {
        this.setData({
          withdrawWays: '',
          withdrawWay: '',
          oldSelNum: '',
        });
      };

      let withdrawWayArr = [];
      for (let i = 0; i < 2; i++) {
        if (i == 0) {
          let isSelected = false;
          if (this.data.weixinChangeIsOpen == '1') {
            isSelected = true;
          } else {
            isSelected = false;
          };
          withdrawWayArr.push({
            weixinChangeIsOpen: this.data.weixinChangeIsOpen,
            nickName: this.data.nickName,
            isSelected: isSelected,
            withdrawWay: 1,
          });
        };
        if (i == 1) {
          let isSelected = false;
          if (this.data.bankCard != '' && this.data.weixinChangeIsOpen != '1') {
            isSelected = true;
          } else {
            isSelected = false;
          };
          withdrawWayArr.push({
            bankCard: this.data.bankCard,
            isSelected: isSelected,
            withdrawWay: 2,
          });
        };
      };

      this.setData({
        withdrawWayArr: withdrawWayArr
      });
    };
  },

  _load() {
    let fansUserId = app.globalData.userId;
    let withdrawalMoney = this.data.withdrawalMoney;

    app.dataGet({ url: 'mobile/fansUserShop/changeWithdrawalData?fansUserId=' + fansUserId + '&withdrawalMoney=' + withdrawalMoney, success: this.withdrawal });
  },

  withdrawal(res) {
    console.log(res);
    if (res.status == 1) {
      this.setData({
        bankCard: res.data.bankCard, //银行卡号
        toAccountTime: res.data.toAccountTime, //到账时间
        amount: res.data.amount, //账户余额
        withdrawalInstructions: res.data.withdrawalInstructions, //提现说明
        serviceFee: res.data.serviceFee, //服务费
        realAmount: res.data.realAmount, //实际到账
        maxWithdrawalAmount: res.data.maxWithdrawalAmount, //最大提现金额
        minWithdrawalAmount: res.data.minWithdrawalAmount, //最小提现金额
        weixinChangeIsOpen: res.data.weixinChangeIsOpen, //微信零钱
        nickName: res.data.nickName, //用户名 
        isLoad: true,
      });
    };
  },

  //提现方式
  showBanks() {
    this.setData({
      isBankShow: true,
      oldSelNum: this.data.oldSelNum
    });
  },

  //取消按钮
  cancelBtn() {
    this.setData({
      isBankShow: false,
      oldSelNum: this.data.oldSelNum,
      selNum: this.data.oldSelNum
    });
    this.selTiKuan(this.data.oldSelNum);
  },

  //完成按钮
  finishBtn() {
    this.setData({
      isBankShow: false
    });
    console.log('当前索引-----', this.data.selNum);
    this.selTiKuan(this.data.selNum);

    if (this.data.selNum == '0') {
      this.setData({
        withdrawWays: '微信零钱(' + this.data.nickName + ')',
        withdrawWay: 1,
        oldSelNum: 0,
      });
    } else if (this.data.selNum == '1') {
      this.setData({
        withdrawWays: '银行卡(' + this.data.bankCard + ')',
        withdrawWay: 2,
        oldSelNum: 1,
      });
    } else {
      this.setData({
        withdrawWays: '',
        withdrawWay: '',
        oldSelNum: '',
      });
    };
  },

  //选择提款方式按钮
  selBtn(e) {
    let ind = e.currentTarget.dataset.index;
    let sel = e.currentTarget.dataset.sel;
    this.setData({
      selNum: ind
    });

    this.selTiKuan(this.data.selNum);
  },

  selTiKuan(val) {
    let withdrawWayArr = this.data.withdrawWayArr;

    for (let i = 0; i < withdrawWayArr.length; i++) {
      if (val == i) {
        withdrawWayArr[i].isSelected = true;
      } else {
        withdrawWayArr[i].isSelected = false;
      };
    };

    this.setData({
      withdrawWayArr: withdrawWayArr
    });
  },

  //绑定银行卡
  bindingInfo() {
    wx.navigateTo({
      url: '../bindingInfo/bindingInfo',
    });
  },

  // 提现
  withdraw() {
    if (this.data.withdrawWays == '') {
      this.tipsAlert('请添加银行卡');
    } else if(this.data.inputval == '') {
      this.tipsAlert('请输入正确金额');
    } else if (this.data.inputval > this.data.amount || this.data.inputval == '0') {
      this.tipsAlert('账户余额不足');
    } else if (this.data.inputval > this.data.maxWithdrawalAmount || this.data.inputval < this.data.minWithdrawalAmount) {
      this.tipsAlert('每笔可提现金额为' + this.data.minWithdrawalAmount + '-' + this.data.maxWithdrawalAmount +'元');
    } else {
      this.setData({
        withdrawalMoney: this.data.inputval
      });
      this._load();
      this.setData({
        maskShow: !this.data.maskShow
      });
    };
    
  },

  //取消
  cancel() {
    this.setData({
      maskShow: !this.data.maskShow
    });
  },

  // 提现-输入正数
  inputVal(e) {
    let val = e.detail.value;
    this.setData({
      inputval: this.clearNoNum(e.detail.value)
    });
    console.log('输入金额', this.data.inputval);
  },

  //判断输入金额
  clearNoNum(obj) { 
    obj = obj.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符  
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的  
    obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", "."); 
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数  
    if(obj.indexOf(".") < 0 && obj != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额 
      obj = parseFloat(obj);
    };

    return obj;
  },

  //全部提现
  allMoney() {
    this.setData({
      inputval: this.data.amount,
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

  /**
  * 进入页面
  */
  enterPage(url) {
    if (url)
      wx.navigateTo({
        url: url
      })
  },

  //确认提现
  postForm(e) {
    if (this.data.is_first_action) {
      this.setData({
        is_first_action: false
      });
      console.log(e.detail.formId);
      this.setData({
        maskShow: !this.data.maskShow
      });

      let fansUserId = app.globalData.userId;
      let withdrawalMoney = this.data.inputval;
      let formId = e.detail.formId;
      let withdrawWay = this.data.withdrawWay; //提款方式:微信零钱-1;银行卡-2;

      app.dataGet({ url: 'mobile/fansUserShop/withdrawal?fansUserId=' + fansUserId + '&withdrawalMoney=' + withdrawalMoney + '&formId=' + formId + '&withdrawWay=' + withdrawWay, success: this.changeWithdrawalData });
    };
  }, 

  changeWithdrawalData(res) {
    console.log(res);
    if (res.data.status == '100013' || res.data.status == '100015') {
      this.tipsAlert(res.data.msg);
      this.setData({
        is_first_action: true
      });
    } else {
      this.setData({
        is_first_action: true
      });
      if (res.status == 0) {
        let orderFail = 'yes'; //订单成功-失败
        let isPlay = 'no'; //是否为支付页
        let url = '../orderTips/orderTips?orderfail=' + orderFail + '&ispay=' + isPlay + '&inputval=' + this.data.realAmount;
        this.enterPage(url);
      } else {
        let orderFail = 'no'; //订单成功-失败
        let isPlay = 'no'; //是否为支付页
        let url = '../orderTips/orderTips?orderfail=' + orderFail + '&ispay=' + isPlay + '&inputval=' + this.data.realAmount;
        this.enterPage(url);
      };
    };
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
    this.load();
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