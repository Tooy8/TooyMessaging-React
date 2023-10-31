//用户列表
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import io from "socket.io-client";
import { httpHost, wsHOST } from "../network";
import { Avatar } from "antd";

const socket = io(wsHOST);

export default function UserList({
  currentUser = "yang",
  //更新当前聊天用户
  setCurrentUser = new Function(),
  messages = [
    {
      sender: "",
      content: "",
      receiver: "",
    },
  ],
  setMessages = new Function(),
  setIsloading = new Function(),
}) {
  const value = useSelector((store: any) => store.username.value);
  const [Users, setUsers] = useState([
    {
      username: "",
      avatar: "",
    },
  ]);
  //设置高亮
  const [actives, setActives] = useState(-1);
  const setActive = (index: number) => {
    setActives(index);
  };
  //更新当前聊天用户
  async function setCurrentChater(user: any) {
    setCurrentUser(user);
  }
  //获取和username匹配的数据
  function getCurentMessages() {
    axios
      .post(`${httpHost}message/list`, {
        username: value,
        currentChater: currentUser,
      })
      .then((res) => {
        //更新消息列表
        setMessages(res.data.data.messageList);
      });
  }
  //清空消息列表
  function deletCurrentMessages() {
    setMessages([]);
  }
  //currentUser变化时执行，加载动画、清空消息列表、获取数据
  useEffect(() => {
    setIsloading(true);
    deletCurrentMessages();
    if (currentUser !== "") {
      getCurentMessages();
    }
  }, [currentUser]);

  //messages变化时执行， 取消加载动画
  useEffect(() => {
    setTimeout(() => {
      setIsloading(false);
    }, 100);
  }, [messages]);

  //获取所有用户数据
  function getUserList() {
    axios.post(`${httpHost}user/all`).then((res) => {
      setUsers(res.data);
    });
  }

  //首次渲染时执行一次
  useEffect(() => {
    getUserList();
  }, []);

  //1. 组件初始渲染 2. 组件更新
  //在 WebSocket 连接上注册名为 'showMessage' 的事件监听器。当服务器发送 'showMessage' 事件时，会触发回调函数
  useEffect(() => {
    socket.on("showMessage", getCurentMessages);
    return () => {
      socket.off("showMessage");
    };
  });
  return (
    <Container>
      {/* 左侧用户头像、名称 */}
      {Users.map((user, index) => {
        if (user.username == value) {
          return;
        }
        return (
          <div
            style={{
              backgroundColor: actives == index ? "rgb(230,230,230)" : "",
            }}
            className="userCard"
            onClick={() => {
              setCurrentChater(user.username), setActive(index);
            }}
            key={index}
          >
            <Avatar className="avatar" src={user.avatar}></Avatar>
            <p className="username">{user.username}</p>
          </div>
        );
      })}
      {/* 我的头像 */}
      {Users.map((user, index) => {
        if (user.username == value) {
          return <Avatar className="myAvatar" src={user.avatar}></Avatar>;
        }
      })}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 23%;
  height: 100%;
  background-color: #f3f3f3;
  border-radius: 10px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0px;
    background-color: grey;
  }

  .myAvatar {
    position: fixed;
    right: 40px;
    top: 5vw;
    z-index: 100;
    width: 7vw;
    height: 7vw;
  }
  .userCard {
    width: 90%;
    height: 20%;
    border-bottom: 1px solid #ddd;
    justify-content: space-around;
    border-radius: 15px;
    align-items: center;
    display: flex;
    .avatar {
      width: 5vw;
      height: 5vw;
    }
    .username {
      font-size: 20px;
      // color: rgb(214, 111, 94);
    }
    transition: all 0.5s;
    :hover {
      background-color: rgb(230, 230, 230);
      opacity: 0.8;
      cursor: pointer;
      .username {
        font-weight: bold;
        color: #1d0b04dd;
      }
    }
  }
`;

function data(data: any, user: string): (...args: any[]) => void {
  throw new Error("Function not implemented.");
}
