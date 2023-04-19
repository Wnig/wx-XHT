//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tips: '',
    len: '',
    nowLen: 0,
    types: '',
    textVal: '',
    shopinfo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let str = '';

    this.setData({
      textVal: options.inputval,
      nowLen: options.inputval.length
    });

    if (options.shopinfo == 'name') {
      this.setData({
        shopinfo: 'name',
        tips: '店铺名称',
      });
    } else if (options.shopinfo == 'ad') {
      this.setData({
        shopinfo: 'ad',
        tips: '店铺广告语'
      });
    } else if (options.shopinfo == 'wx') {
      this.setData({
        shopinfo: 'wx',
        tips: '个人微信号或手机号'
      });
    };

    if (options.type == 'open') {
      this.setData({
        types: 'open'
      });
      str = '免费开店';
    } else {
      this.setData({
        types: 'seting',
      });
      str = '店铺设置';
      this._load();
    };

    this.setTitleText(str);
    this.setData({
      len: options.len
    });
  },

  _load() {
    let postData = {
      fansUserId: app.globalData.userId,
      // type: 0,
    }

    app.dataPost({ url: 'mobile/fansUserShop/userShopAndBankCard', data: postData, success: this.myShop });
  },

  myShop(res) {
    console.log('店铺信息');
    console.log(res);
    this.setData({
      shopName: res.data.userShopInfo.shopName,
      shopAd: res.data.userShopInfo.adContent,
      shopWx: res.data.userShopInfo.wechatId,
      imgUrl: res.data.userShopInfo.logoImageUrl,
      logoImageId: res.data.userShopInfo.logoImageId,
      pFansUserId: res.data.userShopInfo.pFansUserId,
      userShopId: res.data.userShopInfo.id,
    });
  },

  // 获取文本当前长度
  getTextLen(e) {
    this.setData({
      nowLen: e.detail.value.length,
      textVal: e.detail.value
    });
  },

  /**
   * 进入页面
   */
  enterPage() {
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面

    if (this.data.shopinfo == 'name') {
      prevPage.setData({//直接给上移页面赋值
        shopName: this.data.textVal
      });
      wx.navigateBack({
        delta: 1
      });
    } else if (this.data.shopinfo == 'ad') {
      prevPage.setData({//直接给上移页面赋值
        shopAd: this.data.textVal
      });
      wx.navigateBack({
        delta: 1
      });
    } else if (this.data.shopinfo == 'wx') {
      //微信号-手机号正则
      let reg = /^([1][3,4,5,7,8,9][0-9]{9})|([a-zA-Z]{1}[-_a-zA-Z0-9]{5,19})$/;
      if (reg.test(this.data.textVal)) {
        prevPage.setData({//直接给上移页面赋值
          shopWx: this.data.textVal
        });
        wx.navigateBack({
          delta: 1
        });
      } else {
        this.tipsAlert('请输入正确微信号');
      };
    };
  },

  //保存
  postForm(e) {
    this.setData({
      formId: e.detail.formId
    });

    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面

    if (this.data.shopinfo == 'name') {
      this.setData({
        shopName: this.data.textVal,
      });

      prevPage.setData({//直接给上移页面赋值
        shopName: this.data.textVal
      });

      this.updateUser();
    };
    if (this.data.shopinfo == 'ad') {
      this.setData({
        shopAd: this.data.textVal,
      });

      prevPage.setData({//直接给上移页面赋值
        shopAd: this.data.textVal
      });
      
      this.updateUser();
    };
    if (this.data.shopinfo == 'wx') {
      //微信号-手机号正则
      let reg = /^([1][3,4,5,7,8,9][0-9]{9})|([a-zA-Z]{1}[-_a-zA-Z0-9]{5,19})$/;
      
      if (!reg.test(this.data.textVal)) {
        this.tipsAlert('请输入正确微信号');
      } else {
        this.setData({
          shopWx: this.data.textVal,
        });

        prevPage.setData({//直接给上移页面赋值
          shopWx: this.data.textVal
        });

        this.updateUser();
      }
    };
  },

  updateUser() {
    let postData = {
      fansUserId: app.globalData.userId,
      pFansUserId: this.data.pFansUserId,
      id: this.data.userShopId,
      logoImageId: this.data.logoImageId,
      shopName: this.data.shopName,
      wechatId: this.data.shopWx,
      adContent: this.data.shopAd,
      formId: this.data.formId
    };

    console.log('修改用户信息-传参');
    console.log(postData);

    app.dataPost({ url: 'mobile/fansUserShop/updateUserShopInfo', data: postData, success: this.updateUserShopInfo });
  },

  updateUserShopInfo(res) {
    console.log(res);
    if (res.status == 1 && res.data.status != '100010') {
      this.tipsAlert('保存成功');
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 500);
    };
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
   * 动态设置title
   */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
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