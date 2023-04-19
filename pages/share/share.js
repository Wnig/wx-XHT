//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_first_action: true, //判断是否第一次点
    isLoad: false,
    info: {},
    isOwner: false,
    isComplete: true,
    isEnd: false,
    isHelp: false,
    showRuleModal: false,
    fansUserId: '',
    timer: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('share page options')
    console.log(options);
    // options.scene = '33b6da2c4fb14f2fba059227bc74baf0';
    if (options.scene) {
      let scene = decodeURIComponent(options.scene)
      this.setData({ orderProductId: scene })
    }
    if (options.info) {
      let info = JSON.parse(options.info)
      console.log(info)
      this.setData({ info })
    }

    let _this = this;
    let businessId = app.globalData.businessId;

    wx.login({
      success: res1 => {
        let code = res1.code;
        app.dataGet({ url: 'rest/newMallFansUser?code=' + code + '&businessId=' + businessId, success: _this.getUserData });
      }
    })
  },

  getUserData(res2) {
    console.log(res2);
    let _this = this;
    app.globalData.userId = res2.userId;

    _this.setData({
      fansUserId: res2.userId
    });
    
    let orderProductId = this.data.orderProductId || this.data.info.orderProductId;

    console.log('login');
    console.log(orderProductId);
    app.dataGet({ url: 'mobile/fansUser/shareProduct?orderProductId=' + orderProductId, success: this.shareProduct });
  },

  shareProduct(res3) {
    console.log(res3);
    console.log('get share data');
    let _this = this;

    if (_this.data.fansUserId == res3.data.shareProduct.fansUserId) {
      _this.setData({ isOwner: true })
    };
    if (res3.data.friendsGang && res3.data.friendsGang) {
      res3.data.friendsGang.forEach(arr => {
        if (arr.helpUserId == app.globalData.userId) {
          _this.setData({ isHelp: true })
        }
      })
    };

    let item = res3.data.shareProduct;
    
    item.knockAveragePrice = item.knockAveragePrice.toFixed(2);

    res3.data.friendsGang.forEach(item => {
      item.knockAveragePrice = item.knockAveragePrice.toFixed(2);
    });

    _this.setData({ share: res3.data.shareProduct, adImageList: res3.data.adList, friendsGang: res3.data.friendsGang })
    let restTimeArr = this.analysisRestTime(res3.data.shareProduct.remainTime)
    _this.setData({ restTimeArr })
    _this.countDown()
    _this.setData({ isComplete: true, isLoad: true })
  },
  
  //分享减价
  onShareAppMessage() {
    let nickName = this.data.share.nickName || '欣宏途旅游'
    if (this.data.share.nickName) {
      nickName = this.data.share.nickName
    };

    console.log(this.data.orderProductId);

    return {
      from: 'button',
      title: nickName + '邀请你帮TA砍价!',
      path: '/pages/share/share?scene=' + this.data.orderProductId,
      imageUrl: this.data.share.skuImage
    }
  },

  /**
   * 点击好友帮查看更多
   */
  enterMore() {
    let list = this.data.friendsGang
    let knockAveragePrice = this.data.share.knockAveragePrice
    let obj = { list, knockAveragePrice }
    wx.navigateTo({
      url: '../shareFriendList/shareFriendList?obj=' + JSON.stringify(obj),
    })
  },

  enterIndex() {
    wx.switchTab({
      url: '../index/index'
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
    clearInterval(this.data.timer)
    if (this.data.share.remainTime <= 0) {
      this.setData({ isEnd: true })
      return
    }
    this.data.timer = setInterval(() => {
      let obj = this.data.share
      if (obj.remainTime) {
        obj.remainTime--
        if (obj.remainTime <= 0) {
          this.setData({ isEnd: true })
          return
        }
        obj.restTimeArr = this.analysisRestTime(obj.remainTime)
      }
      this.setData({ share: obj })
    }, 1000)
  },

  helpKnockPrice(e) {
    console.log(e);
    let userInfo = e.detail.userInfo;
    let _this = this;
    let user = {
      nickName: userInfo.nickName,
      gender: userInfo.gender,
      avatarUrl: userInfo.avatarUrl,
      address: userInfo.country + userInfo.province + userInfo.city
    };

    this.setData({ user: user })
    if (!app.globalData.userInfo) {
      wx.login({
        success: res => {
          console.log(res.code);
          let code = res.code;
          let userId = app.globalData.userId;
          let nickName = e.detail.userInfo.nickName;
          let gender = e.detail.userInfo.gender;
          let avatarUrl = e.detail.userInfo.avatarUrl;
          let address = e.detail.userInfo.country + ' ' + e.detail.userInfo.province + ' ' + e.detail.userInfo.city;
          let phone = '';
          let encryptedData = e.detail.encryptedData;
          let iv = e.detail.iv;

          console.log(app.globalData);

          let obj = {
            code: code,
            userId: userId,
            nickName: e.detail.userInfo.nickName,
            gender: e.detail.userInfo.gender,
            avatarUrl: e.detail.userInfo.avatarUrl,
            address: address,
            phone: '',
            encryptedData: encryptedData,
            iv: iv
          };

          app.globalData.userInfo = obj;

          console.log(app.globalData.userInfo);

          app.dataGet({ url: 'rest/updateMallFansUser?code=' + code + '&userId=' + userId + '&nickName=' + nickName + '&gender=' + gender + '&avatarUrl=' + avatarUrl + '&address=' + address + '&phone=' + phone + '&encryptedData=' + encryptedData + '&iv=' + iv, success: _this.updateMallFansUser });
        }
      });
    } else {
      this.postHelp();
    }
  },

  updateMallFansUser(res) {
    console.log(res);

    app.globalData.userInfo = this.data.user;
    this.postHelp();
  },

  enterAd(e) {
    console.log(e)
    if (e.target.dataset.current.status == '0') return
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: '../ad/ad?url=' + url
    })
  },

  enterGood() {
    if (this.data.is_first_action) {
      this.setData({
        is_first_action: false
      });
      let obj = this.data.share;
      console.log('share page deliver to details obj')
      let id = this.data.share.productId;
      let _this = this;

      this.setData({
        shopid: this.data.share.fansUserShopId,
        formid: this.data.share.shareUserFormId,
      });

      wx.navigateTo({
        url: '../details/details?id=' + JSON.stringify(id) + '&shopid=' + _this.data.shopid + '&formid=' + _this.data.formid,
        success: function(res) {
          _this.setData({
            is_first_action: true
          });
        }
      }) 
    };
    
  },

  postHelp() {
    if (this.data.is_first_action) {
      let self = this;
      this.setData({
        is_first_action: false
      });
      let postData = {
        helpUserId: app.globalData.userId,
        orderProductId: this.data.orderProductId || this.data.info.orderProductId,
      }

      console.log(postData);
      //帮他砍价接口  
      app.dataGet({ url: 'mobile/fansUser/helpKnockPrice?helpUserId=' + postData.helpUserId + '&orderProductId=' + postData.orderProductId, success: this._helpKnockPrice });
    };
  },

  _helpKnockPrice(res) {
    console.log('帮好友砍价:::', res);
    if(res.status == '1') {
      console.log('砍价成功');
      let self = this;
      wx.showToast({
        title: '砍价成功',
        icon: 'none'
      });
      this.setData({
        is_first_action: true
      });
      self.data.share.shareNum--;
      this.data.friendsGang.unshift({ avatarUrl: app.globalData.userInfo.avatarUrl, nickName: app.globalData.userInfo.nickName, knockAveragePrice: self.data.share.knockAveragePrice })
      self.setData({ isHelp: true })
      self.setData({ 'share.shareNum': self.data.share.shareNum, friendsGang: self.data.friendsGang })
    };
  },

  postForm(e) {
    console.log(e.detail.formId)
    share.saveAndUpdateFormId({ formId: e.detail.formId, fansUserId: app.globalData.userId, type: 4 })
  },

  onPullDownRefresh() {
    let postData = {
      orderProductId: this.data.orderProductId || this.data.info.orderProductId
    }
    console.log('login')

    app.dataGet({ url: 'mobile/fansUser/shareProduct?orderProductId=' + postData.orderProductId, success: this._shareProduct });

    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  _shareProduct(res) {
    console.log(res);

    if (res.data.shareProduct.friendsGang && res.data.shareProduct.friendsGang.helpUserId == app.globalData.userId) {
      this.setData({ isHelp: true })
    };

    this.setData({ share: res.data.shareProduct, adImageList: res.data.adList, friendsGang: res.data.friendsGang });
    let restTimeArr = this.analysisRestTime(res.data.shareProduct.remainTime);
    this.setData({ restTimeArr });
    this.countDown();
  },

  hideRule(e) {
    if (e.target.dataset.tag != 'rule') return
    this.setData({ showRuleModal: false });
    wx.setStorageSync('isKnowRule', true)
    app.globalData.isKnowRule = true;
  },

  showRule(e) {
    this.setData({ showRuleModal: !this.data.showRuleModal });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  //跳转广告
  enterAd(e) {
    console.log('广告图::::;', e);
    let content = e.currentTarget.dataset.content;

    this.setData({
      shopid: this.data.share.fansUserShopId,
      formid: this.data.share.shareUserFormId,
    });

    //type==1  -  url链接   type==2  -  商品id 
    if (e.currentTarget.dataset.type == '1') {

    };
    if (e.currentTarget.dataset.type == '2') {
      wx.navigateTo({
        url: '../details/details?id=' + JSON.stringify(content) + '&shopid=' + this.data.shopid + '&formid=' + this.data.formid
      });
    };
  },
})