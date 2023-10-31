//聊天内容

import axios from "axios";
import {
  JSXElementConstructor,
  Key,
  KeyboardEvent,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useEffect,
  useRef,
  useState,
} from "react";
//CSS-in-JS 库，它可以让你在 React 应用中以组件的方式编写样式。
import styled from "styled-components";

import { useSelector } from "react-redux";
//用于在客户端浏览器中建立 WebSocket 连接的 JavaScript 客户端库。
import io from "socket.io-client";
import { httpHost, wsHOST } from "../network/index";
import { Avatar, notification, Spin, Button } from "antd";

const socket = io(wsHOST);

export default function Room(props: any) {
  const [flag, setFlag] = useState(false);
  //消息
  const [messages, setMessages]: any = useState([
    { username: "通知", message: "欢迎新成员加入" },
  ]);
  //所有信息
  const { allInfo } = props;

  //从 Redux 的 store 中选择和获取username
  const value = useSelector((store: any) => store.username.value);
  //创建一个引用（ref）对象，并将其初始化为 null
  const input = useRef<HTMLInputElement>(null);

  // 从socket中删除先前的事件监听器
  socket.off("message");
  //客户端接收服务端数据时触发
  socket.on("message", async (data) => {
    // try {
    //把消息存起来
    const newMessage = {
      username: data.name,
      message: data.message,
    };
    // 获取之前的消息列表
    const oldMessages = messages;
    // 更新消息列表，把新消息加到原来的列表的末尾
    setMessages([...oldMessages, newMessage]);
    // }
    //  catch {
    //   console.log("error");
    // }
  });

  //发送消息
  function sendMessage(type = "") {
    //<input> 元素当前的值。
    const message = input.current!.value;
    if (message.length > 0 && message.length <= 20) {
      setTimeout(() => {
        let chatScreen = document.querySelector("#chat") as HTMLElement;
        //将 chatScreen 元素滚动到最底部。
        chatScreen && chatScreen.scrollTo(0, chatScreen.scrollHeight);
      }, 100);

      if (!socket) return;
      const state = { ...allInfo };
      const messageObj = {
        ...state,
        message: message,
        id: Date.now(),
        name: localStorage.getItem("username"),
      };
      if (!flag) {
        // 首次进入
        setFlag(true);
      } else {
        messageObj.type = "";
        type && (messageObj.type = type);
      }
      //发送消息给服务端
      socket.emit("changeRoom", messageObj);

      input.current!.value = "";
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
      {
        <div className="chatContent">
          <div className="content" id="chat">
            <div className="topName">
              房间号：{props.currentRoom} &nbsp;&nbsp;&nbsp;人数：
              {allInfo.users}
            </div>

            {messages.map(
              (
                item: {
                  username:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | ReactFragment
                    | null
                    | undefined;
                  message:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | ReactFragment
                    | null
                    | undefined;
                },
                index: Key | null | undefined
              ) => {
                return item.username === localStorage.getItem("username") ? (
                  <div className="right" key={index}>
                    <div className="rightMes">{item.message}</div>
                    <p className="senderName">:{item.username}</p>
                  </div>
                ) : (
                  <div className="left" key={index}>
                    <p className="receiverName">{item.username}:</p>
                    <div className="leftMes">{item.message}</div>
                  </div>
                );
              }
            )}
          </div>
          <div className="sender">
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
function componentDidMount() {
  throw new Error("Function not implemented.");
}
