// 语言切换动画状态管理模块
export default {
  namespaced: true,
  state: {
    languageTransition: null // 用于存储当前切换的语言信息
  },
  mutations: {
    // 定义 setLanguageTransition mutation
    setLanguageTransition(state, payload) {
      state.languageTransition = payload
    }
  },
  actions: {
    // 处理语言切换动画
    triggerLanguageTransition({ commit }, transitionData) {
      console.log('@STORE处理语言切换动画:\n', transitionData)
      // 先清除可能存在的旧状态
      commit('setLanguageTransition', null)

      // 短暂延迟后设置新状态，确保先前的动画完全结束
      setTimeout(() => {
        commit('setLanguageTransition', transitionData)
      }, 50)

      // 设置自动关闭动画，时间与组件动画总持续时间同步 (3000ms)
      return new Promise(resolve => {
        setTimeout(() => {
          commit('setLanguageTransition', null)
          resolve()
        }, 500)
      })
    }
  }
}