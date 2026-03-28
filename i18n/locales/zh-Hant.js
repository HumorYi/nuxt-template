export default {
  "common": {
    "backHome": "返回首页"
  },
  "components": {
    "CustomTest": {
      "title": "自定义测试"
    },
    "test": {
      "CustomUse": {
        "title": "自定義測試 嵌套",
        "test": {
          "age": "年龄"
        }
      }
    }
  },
  "error": {
    "networkError": "網路異常，請檢查網路連線",
    "timeout": "請求逾時，請檢查網路後重試",
    "serverError": "伺服器內部錯誤，請稍後重試",
    "unknownError": "未知錯誤",
    "configError": "API 設定異常，請檢查接口位址",
    "duplicateRequest": "目前請求正在處理中，請勿重複操作",
    "businessError": "業務處理失敗：{msg}",
    "csrfError": "CSRF 驗證失敗，請重新整理頁面",
    "emptyToken": "登入憑證為空，請重新登入",
    "tokenExpired": "登录状态已过期，请重新登录",
    "tokenRefreshFailed": "Token刷新失败",
    "requestError": "请求处理异常，请稍后重试"
  },
  "loading": {
    "global": "載入中...",
    "test": "test 載入中..."
  },
  "message": {},
  "pages": {
    "403": {
      "noPermission": "没有权限"
    },
    "login": {
      "login": "登录",
      "username": "用户名",
      "password": "密码",
      "message": {
        "loginFailed": "登录失败",
        "loginSuccess": "登录成功"
      }
    },
    "[...slug]": {
      "noFound": "页面不存在"
    },
    "(auth)": {
      "concat": {
        "desc": "联系我们"
      }
    },
    "(permission)": {
      "user": {
        "login": "登录",
        "about": "关于",
        "contact": "联系我们",
        "home": "首页",
        "userCenter": "用户中心",
        "userCenterParent": "用户中心（父路由）",
        "backToUserHome": "回到用户首页",
        "basicInfo": "基础信息",
        "advancedSettings": "高级设置",
        "childRouteContent": "子路由内容会渲染在这个 NuxtPage 标签位置",
        "forbiddenAccess": "禁止访问 - 403",
        "noPermissionToAccess": "你没有权限访问该页面。",
        "forbiddenAccess403": "403 禁止访问",
        "noPermissionToView": "你没有权限查看该内容。"
      }
    }
  },
  "layouts": {
    "default": {
      "header": "頭部",
      "footer": "底部"
    }
  },
  "site": {
    "name": "科技有限公司",
    "legalName": "科技有限公司",
    "address": "省市区路号",
    "city": "市",
    "contactTitle": "联系我们 - 科技_400_地址/邮箱/在线咨询",
    "contactDescription": "科技联系地址：省市区路号，欢迎来电洽谈合作。",
    "contactKeywords": "科技,联系我们,400电话,企业地址",
    "pageTitle": "首页 - 科技_专业产品生产厂家_解决方案提供商",
    "headline": "标题",
    "author": "作者",
    "coreProductAlt": "核心产品 - 科技"
  }
};