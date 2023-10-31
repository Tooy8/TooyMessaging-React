//聊天内容

import axios from "axios";
import { KeyboardEvent, useRef } from "react";
//CSS-in-JS 库，它可以让你在 React 应用中以组件的方式编写样式。
import styled from "styled-components";

import { useSelector } from "react-redux";
//用于在客户端浏览器中建立 WebSocket 连接的 JavaScript 客户端库。
import io from "socket.io-client";
import { httpHost, wsHOST } from "../network/index";
import { Avatar, notification, Spin } from "antd";

const socket = io(wsHOST);

export default function ChatContent({
  currentUser = "yang",
  setCurrentUser = new Function(),
  messages = [
    {
      sender: "",
      content: "",
      receiver: "",
    },
  ],
  setMessages = new Function(),
  isloading = true,
  setIsloading = new Function(),
}) {
  //从 Redux 的 store 中选择和获取username
  const value = useSelector((store: any) => store.username.value);
  //创建一个引用（ref）对象，并将其初始化为 null
  const input = useRef<HTMLInputElement>(null);

  function sendMessage() {
    //<input> 元素当前的值。
    const message = input.current!.value;
    if (message.length > 0 && message.length <= 20) {
      setTimeout(() => {
        let chatScreen = document.querySelector("#chat") as HTMLElement;
        //将 chatScreen 元素滚动到最底部。
        chatScreen && chatScreen.scrollTo(0, chatScreen.scrollHeight);
      }, 100);
      //发送请求
      axios
        .post(`${httpHost}message/send`, {
          sender: value,
          content: message,
          receiver: currentUser,
        })
        .then((res) => {
          //向服务器发送自定义的事件
          socket.emit("sendMessage", {
            to: currentUser,
          });
          input.current!.value = "";
        })
        .catch((err) => console.log(err));
    } else if (message.length > 20) {
      notification.warning({
        message: "警告提示",
        description: "消息长度不能超过20个字符",
      });
    }
  }

  //回车发消息
  function enter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Enter") {
      sendMessage();
    }
  }

  return (
    <Container>
      {currentUser === "" ? (
        <h1 className="welcome">点击用户列表开始聊天</h1>
      ) : (
        ""
      )}
      {
        <div className="chatContent">
          <div className="content" id="chat">
            {currentUser === "" ? (
              ""
            ) : (
              <div className="topName">{currentUser}</div>
            )}

            {isloading ? (
              <Spin size="large" className="loading" tip="对话加载中..."></Spin>
            ) : (
              messages.map((message, index) => {
                return message.receiver === currentUser ? (
                  <div className="right" key={index}>
                    <div className="rightMes">{message.content}</div>
                    <p className="senderName">:{message.sender}</p>
                  </div>
                ) : (
                  <div className="left" key={index}>
                    <p className="receiverName">{message.sender}:</p>
                    <div className="leftMes">{message.content}</div>
                  </div>
                );
              })
            )}
          </div>
          <div className="sender">
            {currentUser === "" ? (
              ""
            ) : (
              <>
                <input
                  ref={input}
                  type="text"
                  className="input"
                  onKeyUp={(e) => enter(e)}
                />
                <button
                  className="send"
                  onClick={() => {
                    sendMessage();
                  }}
                >
                  发送
                </button>
              </>
            )}
          </div>
        </div>
      }
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 75%;
  height: 100%;
  .noCurrentUser {
    width: 100%;
    height: 100%;
  }
  .chatContent {
    width: 100%;
    height: 100%;
  }
  .welcome {
    font-size: 1vw;
    // font-family:"楷体";
    color: rgb(220, 111, 98);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -70%);
    z-index: 1;
  }
  .content {
    width: 100%;
    height: 80%;
    background-color: #f3f3f3;
    border-radius: 10px 10px 0 0;

    overflow-y: scroll;
    overflow-x: hidden;
    ::-webkit-scrollbar {
      width: 0px;
      background-color: #0e24cb;
    }
    position: relative;

    .topName {
      width: 100%;
      height: 40px;
      background-color: rgb(230, 230, 230);
      text-align: center;
      line-height: 40px;
      font-size: 20px;
      border-bottom: 1px solid #ccc;
      border-radius: 5px;
      font-weight: 900;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .left {
      width: 100%;
      height: 10vh;
      font-size: 1vw;
      font-family: "Times New Roman";
      margin-left: 5%;
      border-radius: 10px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .leftMes {
        text-align: center;
        border-radius: 10px;
        padding: 10px 20px 10px 20px;
        background-color: rgb(255, 255, 255);
      }
      .receiverName {
        color: black;
        height: 16px;
        margin-right: 10px;
      }
    }
    .right {
      width: 100%;
      height: 10vh;
      font-size: 1vw;
      font-family: "Times New Roman";
      transform: translateX(-7%);
      border-radius: 10px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .rightMes {
        text-align: center;
        border-radius: 10px;
        padding: 10px 20px 10px 20px;
        background-color: rgb(149, 236, 105);
      }
      .senderName {
        color: black;
        height: 16px;
        margin-left: 10px;
      }
    }
  }
  .sender {
    width: 100%;
    height: 20%;
    background-color: #f3f3f3;
    border-radius: 0 0 10px 10px;

    position: relative;
    .input {
      display: block;
      width: 90%;
      height: 90%;

      position: absolute;
      left: 5%;
      bottom: 16%;
      background-color: rgb(240, 240, 240);
      border-radius: 30px;

      border: 1px solid #aaa;
      overflow: hidden;
      font-size: 1vw;
      color: #333;
      text-indent: 2em;
      :focus {
        outline: none;
      }
    }
    .send {
      width: 4vw;
      height: 2.5vw;
      background-color: rgb(222, 222, 222);
      border-radius: 15px;
      border: none;
      position: absolute;
      right: 9%;
      bottom: 45%;
      :hover {
        cursor: pointer;
      }
    }
  }
  .chatbgc {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
  }
  //
`;
