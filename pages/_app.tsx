import 'antd/dist/antd.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import styled from 'styled-components'
import { configureStore } from '@reduxjs/toolkit'
import usernameSlice from '../store/store'
import { Provider } from 'react-redux'
import '../network/index'

const store = configureStore({
  reducer: {
    username: usernameSlice
  }
})

// 应用程序的入口文件，用于设置 Redux 的 store，并将提供了 Redux store 的应用程序外壳包裹在 Provider 组件中。这样，在整个应用程序中的组件都可以访问 Redux store。

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  )
}
export default MyApp

