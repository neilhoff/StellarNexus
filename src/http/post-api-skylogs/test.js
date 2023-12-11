let y = {
  skyLogType: 'Error',
  url: 'http://localhost:8080/#/admin/errorlogs',
  errorObj: {
    error: {
      name: 'TypeError',
      message: "Cannot read properties of null (reading 'length')",
      stack: "TypeError: Cannot read properties of null (reading 'length')\n" +
        '    at getErrors (webpack-internal:///./node_modules/@quasar/app/lib/webpack/loader.js.transform-quasar-imports.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-2.use[0]!./node_modules/@quasar/app/lib/webpack/loader.vue.auto-import-quasar.js??ruleSet[0].use[0]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[1]!./src/pages/admin/skylog/ErrorLogs.vue?vue&type=script&lang=js:24:30)\n' +
        '    at callWithErrorHandling (webpack-internal:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js:6829:22)\n' +
        '    at callWithAsyncErrorHandling (webpack-internal:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js:6838:21)\n' +
        '    at emit$1 (webpack-internal:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js:417:9)\n' +
        '    at eval (webpack-internal:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js:6623:53)\n' +
        '    at onClick (webpack-internal:///./node_modules/quasar/src/components/btn/QBtn.js:147:9)\n' +
        '    at callWithErrorHandling (webpack-internal:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js:6829:22)\n' +
        '    at callWithAsyncErrorHandling (webpack-internal:///./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js:6838:21)\n' +
        '    at HTMLButtonElement.invoker (webpack-internal:///./node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js:506:90)'
    },
    elClassName: 'q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--rectangle bg-primary text-white q-btn--actionable q-focusable q-hoverable',
    vueInfo: 'component event handler'
  },
  userPrincipalName: 'stellarnexus@1blpb6.onmicrosoft.com',
  userAgent: {
    browser: { name: 'Microsoft Edge', version: '97.0.1072.76' },
    os: { name: 'Windows', version: 'NT 10.0', versionName: '10' },
    platform: { type: 'desktop' },
    engine: { name: 'Blink' }
  }
}