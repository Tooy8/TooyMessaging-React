import { NextRouter, useRouter } from "next/router";

//每次路由导航之前检查本地存储中是否存在名为 token 的项。如果不存在 token，则将用户重定向到根路径（'/'）。
export function routerBeforEach(router: NextRouter) {
  if (!localStorage.getItem("token")) {
    router.push("/");
  }
}
