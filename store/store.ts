//类似vuex

import { createSlice, configureStore } from "@reduxjs/toolkit";

export const usernameSlice = createSlice({
  //切片的名称
  name: "username",
  //切片的初始状态
  initialState: {
    value: "",
  },
  //定义切片的 action 和对应的状态更新逻辑
  reducers: {
    changeName(state, username: { payload: string }) {
      state.value = username.payload;
    },
  },
});

export const { changeName } = usernameSlice.actions;
export default usernameSlice.reducer;
