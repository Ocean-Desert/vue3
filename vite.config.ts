import { defineConfig, loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx' //tsx插件引入
import AutoImport from 'unplugin-auto-import/vite' //自动引入ref,reactive等等等
// 配置antd-v按需加载
import Components from 'unplugin-vue-components/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import { resolve, join } from 'path'
import { fileURLToPath, URL } from 'node:url'
import topLevelAwait from 'vite-plugin-top-level-await'
import prismjs from 'vite-plugin-prismjs'
import { vitePluginForArco } from '@arco-plugins/vite-vue'
// import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  console.log(command, mode, '===')
  const root = process.cwd()
  const env = loadEnv(mode, root) // 环境变量对象
  console.log('环境变量------', env)
  console.log('文件路径(process.cwd)------', root)
  console.log('文件路径(dirname)------', __dirname + '/src')
  return {
    root, //项目根目录（index.html 文件所在的位置） 默认： process.cwd()
    base: '/', //  开发或生产环境服务的公共基础路径：默认'/'   1、绝对 URL 路径名： /foo/；  2、完整的 URL： https://foo.com/； 3、空字符串或 ./（用于开发环境）
    publicDir: resolve(__dirname, './dist'), //默认'public'  作为静态资源服务的文件夹  (打包public文件夹会没有，里面得东西会直接编译在dist文件下)
    assetsInclude: resolve(__dirname, './src/assets'), // 静态资源处理
    plugins: [
      // legacy({
      //   //targets里可指定兼容到某一特定版本，默认为[ "defaults", "not IE 11"]；
      //   targets: ["chrome 80", "defaults", "not IE 11"],
      // }),

      prismjs({
        languages: ['javascript', 'css', 'html', 'json', 'typescript', 'java', 'yaml', 'sql', 'xml', 'tsx'],
        plugins: [
          'toolbar',
          'show-language',
          'copy-to-clipboard',
          'normalize-whitespace',
          'line-numbers',
          'unescaped-markup'
        ],
        theme: 'tomorrow',
        css: true
      }),
      topLevelAwait({
        promiseExportName: '__tla',
        promiseImportName: (i) => `__tla_${i}`
      }),
      vue(),
      vueJsx(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          {
            axios: [
              ['default', 'axios'] // import { default as axios } from 'axios',
            ]
          }
        ],
        dts: 'types/auto-import.d.ts' //生成全局引入的文件
      }),
      Components({
        resolvers: [
          ArcoResolver({
            resolveIcons: true,
            sideEffect: true
          })
        ]
      }),
      vitePluginForArco({
        varsInjectScope: ['*'],
      }),
    ],
    preview: {
      host: true, // 监听所有地址
      cors: false, //为开发服务器配置 CORS
      proxy: {
        //配置自定义代理规则
        // 字符串简写写法
        [env.VITE_API_CONTEXT_PATH]: {
          target: env.VITE_API_BASE_URL + env.VITE_API_CONTEXT_PATH,
          changeOrigin: true, //是否跨域
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    },
    // ******开发服务器配置******
    server: {
      https: false, //(使用https)启用 TLS + HTTP/2。注意：当 server.proxy 选项 也被使用时，将会仅使用 TLS
      host: true, // 监听所有地址
      port: 5173, //指定开发服务器端口：默认3000
      open: true, //启动时自动在浏览器中打开
      cors: false, //为开发服务器配置 CORS
      proxy: {
        //配置自定义代理规则
        // 字符串简写写法
        [env.VITE_API_CONTEXT_PATH]: {
          target: env.VITE_API_BASE_URL + env.VITE_API_CONTEXT_PATH,
          changeOrigin: true, //是否跨域
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
      // hmr: {
      //   overlay: false
      // }
    },
    // ******项目构建配置******
    build: {
      // target: 'modules', //设置最终构建的浏览器兼容目标  //es2015(编译成es5) | modules
      target: ['es2015', 'chrome63'], // 默认是modules,更改这个会去输出兼容浏览器，根据实际情况修改
      outDir: 'dist', // 构建得包名  默认：dist
      assetsDir: 'assets', // 静态资源得存放路径文件名  assets
      sourcemap: false, //构建后是否生成 source map 文件
      brotliSize: false, // 启用/禁用 brotli 压缩大小报告。 禁用该功能可能会提高大型项目的构建性能
      minify: 'esbuild', // 项目压缩 :boolean | 'terser' | 'esbuild'
      chunkSizeWarningLimit: 1000, //chunk 大小警告的限制（以 kbs 为单位）默认：500
      cssTarget: 'chrome61' //防止 vite 将 rgba() 颜色转化为 #RGBA 十六进制符号的形式  (要兼容的场景是安卓微信中的 webview 时,它不支持 CSS 中的 #RGBA 十六进制颜色符号)
    },
    css: {
      modules: {
        localsConvention: 'camelCase'
      },
      // 全局变量+全局引入less+配置antdv主题色
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          requireModuleExtension: true,
          javascriptEnabled: true,
          // 全局变量使用：@primary-color
          modifyVars: {
            '--red-1': '#f85959',
          }
        }
      }
    },
    resolve: {
      alias: {
        // '@': path.resolve('./src')
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }

})
