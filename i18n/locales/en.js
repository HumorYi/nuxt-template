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
      "header": "header",
      "footer": "footer"
    }
  },
  "loading": {
    "global": "加载中",
    "test": "test 加载中"
  },
  "message": {},
  "pages": {
    "403": {
      "noPermission": "没有权限"
    },
    "(auth)": {
      "contact": {
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
  },
  "ssg": {
    "title": "Static Site Generation (SSG)",
    "contentTitle": "What is SSG?",
    "contentDescription": "Static Site Generation (SSG) is a technique that generates static HTML files at build time, which can be directly deployed to any static file server.",
    "benefit1": "Fast page load times",
    "benefit2": "No server required for serving",
    "benefit3": "Good SEO performance",
    "generatedAt": "Page generated at: {time}",
    "note": "This page is statically generated at build time and won't be regenerated on subsequent visits."
  },
  "ssr": {
    "title": "Server-Side Rendering (SSR)",
    "contentTitle": "What is SSR?",
    "contentDescription": "Server-Side Rendering (SSR) is a technique that renders pages on the server for each request, ensuring that each request gets the latest content.",
    "benefit1": "Dynamic content for each request",
    "benefit2": "Good SEO performance",
    "benefit3": "Fresh data on every page load",
    "renderedAt": "Page rendered at: {time}",
    "serverTime": "Server time: {time}",
    "note": "This page is rendered on the server and generates new content for each request."
  },
  "isr": {
    "title": "Incremental Static Regeneration (ISR)",
    "contentTitle": "What is ISR?",
    "contentDescription": "Incremental Static Regeneration (ISR) is a technique that combines the benefits of SSG and SSR. It generates static pages at build time and automatically updates them incrementally in the background.",
    "benefit1": "Fast initial load times",
    "benefit2": "Automatic background updates",
    "benefit3": "Reduced server load",
    "generatedAt": "Page generated at: {time}",
    "dataUpdatedAt": "Data updated at: {time}",
    "note": "This page uses Incremental Static Regeneration (ISR) and updates automatically every 60 seconds."
  },
  "swr": {
    "title": "Stale While Revalidate (SWR)",
    "contentTitle": "What is SWR?",
    "contentDescription": "Stale While Revalidate (SWR) is a data fetching pattern that first returns cached stale data and then revalidates and updates the data in the background.",
    "benefit1": "Fast initial load from cache",
    "benefit2": "Background data revalidation",
    "benefit3": "Seamless user experience",
    "refresh": "Refresh Data",
    "lastUpdated": "Last updated: {time}",
    "note": "This page uses the SWR pattern and automatically updates data when the page gains focus or the network reconnects."
  }
};