module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    '@vue/babel-plugin-jsx',
    [
      'import',
      {
        libraryName: '@icon-park/vue-next',
        libraryDirectory: 'es/icons',
        camel2DashComponentName: false
      },
      'icon'      // 多个组件库时需要加上这个属性,不重复即可。
    ]
  ]
}
