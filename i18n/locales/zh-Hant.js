export default {
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
    "networkError": "网络异常，请检查网络连接",
    "timeout": "请求超时，请检查网络后重试",
    "serverError": "服务器内部错误，请稍后重试",
    "unknownError": "未知错误",
    "configError": "API 配置异常，请检查接口地址",
    "duplicateRequest": "当前请求正在处理中，请勿重复操作",
    "businessError": "业务处理失败：{msg}",
    "csrfError": "CSRF 令牌验证失败，请刷新页面",
    "emptyToken": "登录凭证为空，请重新登录",
    "tokenExpired": "登录状态已过期，请重新登录",
    "tokenRefreshFailed": "Token刷新失败",
    "requestError": "请求处理异常，请稍后重试"
  },
  "layouts": {
    "default": {
      "header": "頭部",
      "footer": "底部"
    }
  },
  "loading": {
    "global": "載入中",
    "test": "test 加载中"
  },
  "message": {},
  "pages": {
    "403": {
      "noPermission": "没有权限"
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
    },
    "[...slug]": {
      "noFound": "页面不存在"
    },
    "login": {
      "login": "登录",
      "username": "用户名",
      "password": "密码",
      "message": {
        "loginFailed": "登录失败",
        "loginSuccess": "登录成功"
      }
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