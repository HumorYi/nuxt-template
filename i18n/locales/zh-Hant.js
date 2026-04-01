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
      "header": "頭部",
      "footer": "底部"
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
    "title": "靜態站點生成 (SSG)",
    "contentTitle": "什麼是 SSG？",
    "contentDescription": "靜態站點生成 (SSG) 是一種在構建時生成靜態 HTML 文件的技術，這些文件可以直接部署到任何靜態文件伺服器上。",
    "benefit1": "快速的頁面載入速度",
    "benefit2": "不需要伺服器即可提供服務",
    "benefit3": "良好的 SEO 效能",
    "generatedAt": "頁面生成時間: {time}",
    "note": "此頁面在構建時靜態生成，後續訪問不會重新生成。"
  },
  "ssr": {
    "title": "服務端渲染 (SSR)",
    "contentTitle": "什麼是 SSR？",
    "contentDescription": "服務端渲染 (SSR) 是一種在伺服器上為每個請求渲染頁面的技術，確保每次請求都能獲得最新的內容。",
    "benefit1": "每個請求都能獲得動態內容",
    "benefit2": "良好的 SEO 效能",
    "benefit3": "每次頁面載入都能獲得最新數據",
    "renderedAt": "頁面渲染時間: {time}",
    "serverTime": "伺服器時間: {time}",
    "note": "此頁面在伺服器上渲染，每次請求都會生成新的內容。"
  },
  "isr": {
    "title": "增量靜態再生 (ISR)",
    "contentTitle": "什麼是 ISR？",
    "contentDescription": "增量靜態再生 (ISR) 是一種結合了 SSG 和 SSR 優點的技術，它在構建時生成靜態頁面，並在後台自動增量更新。",
    "benefit1": "快速的初始載入時間",
    "benefit2": "自動後台更新",
    "benefit3": "減少伺服器負載",
    "generatedAt": "頁面生成時間: {time}",
    "dataUpdatedAt": "數據更新時間: {time}",
    "note": "此頁面使用增量靜態再生 (ISR)，每 60 秒自動更新一次。"
  },
  "swr": {
    "title": "Stale While Revalidate (SWR)",
    "contentTitle": "什麼是 SWR？",
    "contentDescription": "Stale While Revalidate (SWR) 是一種數據獲取模式，它首先返回緩存的舊數據（stale），然後在後台重新驗證並更新數據。",
    "benefit1": "從緩存快速初始載入",
    "benefit2": "後台數據重新驗證",
    "benefit3": "無縫的用戶體驗",
    "refresh": "刷新數據",
    "lastUpdated": "最後更新時間: {time}",
    "note": "此頁面使用 SWR 模式，當頁面獲得焦點或網路重新連接時會自動更新數據。"
  }
};