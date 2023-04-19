// import { Config } from '../../utils/config.js';
// 引入SDK核心类
var QQMapWX = require('../../sdk/qqmap-wx-jssdk.js');

// 实例化API核心类
var map = new QQMapWX({
  key: 'LODBZ-HJTKV-RGGPM-UUNIJ-WT4UJ-KNB3R' // 必填
});

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    opacity: 'rgba(100,165,255,0)', //透明度
    nowScrollTop: 0, //当前滚动位置
    isLoad: false,
    adList: [], //轮播图
    categoryList: [], //分类菜单
    productList: [], //精选-人气推荐
    serviceTerms: [], //首次登陆提示-自营-自买-分享
    pageNum: 0, //当前页
    pageSize: 20, //显示几条
    totalPage: 0, //总页数
    appName: '', //首页标题名称
    classifyMenuLabel: '', //人气推荐label
    indicatorDots: true,
    autoplay: true,
    scrollTop: 0,
    hasMore: true,//人气推荐是否加载完
    interval: 3000,
    duration: 400,
    circular: true,
    current: 1,
    loginPrompt: '',
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
    productTotal: 0, //商品总数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    // this.checkGetSetting();
  },

  //查看是否授权
  checkGetSetting() {
    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getUser});
      }
    });
  },

  //获取用户信息
  getUser(res) {
    console.log(res);
    let _this = this;

    // this.setTitleText(res.businessName);
    app.globalData.userId = res.userId;

    if (res.userInfo != '' && res.userInfo != undefined && res.userInfo.sex != '') {
      let obj = {
        userId: res.userId,
        nickName: res.userInfo.name,
        gender: res.userInfo.sex,
        avatarUrl: res.userInfo.avatarImageUrl,
        address: res.area,
        phone: res.phone,
      };

      app.globalData.userInfo = obj;

      //用户授权地理位置
      wx.getLocation({
        success: res => {
          // console.log(res);
          map.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function (res) {
              console.log('地理位置');
              console.log(res);
              app.globalData.city = res.result.ad_info.city;
              let fansUserId = app.globalData.userId;
              let lon = res.result.ad_info.location.lng;
              let lat = res.result.ad_info.location.lat;
              let nation_code = res.result.ad_info.nation_code; //国际码
              let nation_code_len = res.result.ad_info.nation_code.length; //国际码编码长度
              let _city_code = res.result.ad_info.city_code.substring(0, nation_code_len);
              let city_code_ = '';

              //截取后半段区域码
              if (nation_code == _city_code) {
                city_code_ = res.result.ad_info.city_code.slice(nation_code_len);
              };

              // console.log(city_code_);
              console.log('获取地理位置：用户id');
              console.log(app.globalData.userId);

              //更新用户当前位置
              app.dataGet({ url: 'mobile/fansUser/updateFansUserLocation?fansUserId=' + fansUserId + '&lon=' + lon + '&lat=' + lat, success: _this.updateFansUserLocation });
            },
            fail: function (res) {
              // console.log(res);
            },
            complete: function (res) {
              // console.log(res);
            }
          });
        }
      });

    } else {
      // 查看是否授权
      wx.showModal({
        title: '登录提示',
        content: _this.data.serviceTerms.loginPrompt,
        cancelText: '关闭',
        confirmText: '微信登录',
        cancelColor: '#666666',
        confirmColor: '#64A5FF',
        success: function (res) {
          if (res.confirm) {
            let page = 'index';
            wx.navigateTo({
              url: '../login/login?page='+ page,
            });
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    };
  },

  //更新用户当前信息
  updateFansUserLocation(res) {
    console.log(res);
  },

  /**
   * 动态设置title
   */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
    })
  },

  //监听页面滚动
  onPageScroll(e) {
    let scrollTop = e.scrollTop;
    let opacity = scrollTop / 160;
    if (opacity > 1) opacity = 1;
    this.setData({
      opacity: `rgba(100,165,255,${opacity})`
    });
  },

  /**
   * 跳转搜索页
   */
  enterSearch() {
    let type = '';
    let ishop = 'no';
    wx.navigateTo({
      url: '../search/search?type='+ type + '&ishop=' + ishop,
    })
  },

  //图片滚动事件-获取当前滚动页
  onSlideChangeEnd: function(e) {
    var that = this;
    that.setData({
      current: e.detail.current + 1
    })  
  },

  //用户点击跳转页面事件
  enterPage: function (e) {
    let item = e.currentTarget.dataset.data;
    let ishop = 'no';
    wx.navigateTo({
      url: '../classifyItem/classifyItem?item=' + JSON.stringify(item) + '&ishop=' + ishop
    })
  },

  //跳转广告
  enterAd(e) {
    console.log('广告图::::;', e);
    let content = e.currentTarget.dataset.content;

    //type==1  -  url链接   type==2  -  商品id 
    if (e.currentTarget.dataset.type == '1') {

    };
    if (e.currentTarget.dataset.type == '2') {
      wx.navigateTo({
        url: '../details/details?id=' + JSON.stringify(content)
      });
    };
  },

  //进入商品详情页面
  enterDetail(e) {
    let commodity = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../details/details?id=' + JSON.stringify(commodity)
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
    this.checkGetSetting();
    this._loadData();
  },

  _loadData() {
    let postData = {
      businessId: app.globalData.businessId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }
    app.dataPost({ url: 'rest/product/homePageContent', data: postData, success: this.homePage });
  },

  //首页数据
  homePage(res) {
    if (res.status == 1) {
      this.setData({
        adList: res.data.adList,
        categoryList: res.data.categoryList,
        serviceTerms: res.data.serviceTerms,
        productTotal: res.data.serviceTerms.productTotal
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
      }
      app.dataPost({ url: 'rest/product/homePageContent', data: postData, success: this.getPopular });
    }
  },

  //获取人气推荐数据
  getPopular(res) {
    console.log('人气推荐::::', res);
    if (!res.data.popularRecommend.productList && res.status == 1 ) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }

    // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
    let productList = this.data.productList;
    let pageNum = this.data.pageNum;
    let pageSize = this.data.pageSize;

    res.data.popularRecommend.productList.forEach(arr => {
      productList.push(arr);
    });
    // console.log(res.data.popularRecommend.totalPage);
    if (pageNum + 1 == res.data.popularRecommend.totalPage && (res.data.popularRecommend.productList.length < pageSize || res.data.popularRecommend.productList.length == pageSize)) {
      this.setData({ hasMore: false })
    } else if (res.data.popularRecommend.productList.length < pageSize ) {
      this.setData({ 
        hasMore: false,
      });
    } else {
      pageNum++;
    }; 

    
    this.setData({
      pageNum: pageNum,
      classifyMenuLabel: res.data.popularRecommend.label,
      productList: productList,
      isLoad: true
    });
    
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
    this.setData({ hasMore: true, pageNum: 0, productList: [] });
    this._loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadPopular();
  },

})
