import App from './App'

// #ifndef VUE3
// 旧版 Vue 2 逻辑，如果你只用 Vue 3，这部分可以保持原样或删掉
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

// 1. 导入 Pinia (状态管理)
import * as Pinia from 'pinia'
// 导入 Pinia 持久化插件 (防止刷新页面后登录状态丢失)
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 2. 导入 uView Plus (UI 组件库)
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)

  // 3. 创建 Pinia 实例
  const store = Pinia.createPinia()
  // 使用持久化插件
  store.use(piniaPluginPersistedstate)

  // 4. 挂载插件
  app.use(store)
  app.use(uviewPlus)

  return {
    app,
    Pinia // 必须返回 Pinia 才能在项目中正常使用
  }
}
// #endif