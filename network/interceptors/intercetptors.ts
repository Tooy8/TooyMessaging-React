import { notification } from "antd";
import axios from "axios";

//请求拦截器
axios.interceptors.request.use((request) => {
  //如果令牌存在，则将其添加到请求头部的 Authorization 字段中，并使用 Bearer token 的形式进行授权
  if (localStorage.getItem("token")) {
    request.headers!.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }
  return request;
});

//响应拦截器
axios.interceptors.response.use(
  //成功的情况下被调用
  (response) => {
    return response;
  },
  //失败
  (error) => {
    notification.error({
      message: "错误提示",
      description: "服务器错误",
    });
  }
);
