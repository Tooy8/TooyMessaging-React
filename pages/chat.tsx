import { Button, Modal, Input, message } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import ChatContent from "../components/ChatContent";
import UserList from "../components/UserList";
import Room from "../components/Room";
import img from "../public/pictures/back.jpg";
import { changeName } from "../store/store";
import { routerBeforEach } from "../utils/router-beforEach";
import { io } from "socket.io-client";
import { wsHOST } from "../network";

const socket = io(wsHOST);
function Chat() {
  const router = useRouter();
  const [isloading, setIsloading] = useState(true);
  // 触发 action 的方法,通知 Redux 更新状态
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "",
      content: "",
      receiver: "",
    },
  ]);

  //创建加入房间
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [state, setState]: any = useState({ room: "", type: "", username: "" });
  const [roomShow, setRoomShow] = useState(false);
  const [leaveRoom, setLeaveRoom] = useState("");
  const title: any = {
    create: "创建房间",
    join: "加入房间",
  };
  const [allInfo, setAllInfo] = useState({});
  //获取用户名
  const value = useSelector((store: any) => store.username.value);
  // const value = localStorage.getItem("username");

  //展示弹窗
  const showModal = (type: string) => {
    setOpen(true);
    setState({
      ...state,
      type: type,
      username: localStorage.getItem("username"),
    });
  };
  // 确认按钮
  const handleOk = () => {
    setConfirmLoading(true);
    const reg = /^\d{4}$/;
    //事件发送到服务器
    socket.emit("changeRoom", {
      name: state.username,
      roomId: state.room,
      type: state.type,
    });

    // 从socket中删除先前的事件监听器
    socket.off("message");
    //获取服务器传回来的数据
    socket.on("message", async (data) => {
      try {
        const code = data.code;
        setAllInfo(data);
        //判断
        if (code === 501) {
          message.error("房间号已存在");
          setConfirmLoading(false);
          return;
        }
        if (code === 502) {
          message.error("房间号不存在");
          setConfirmLoading(false);
          return;
        }
        if (!reg.test(String(state.room))) {
          message.error("请输入正确4位数字的房间号");
          setConfirmLoading(false);
          return;
        }
        if (code === 200) {
          // message.success("进入房间！");
          setConfirmLoading(true);
          setRoomShow(true);
          //退出房间的房间号
          setLeaveRoom(data.roomId);
          setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
            setState({
              ...state,
              room: "",
            });
          }, 1000);
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    });
  };

  //   取消按钮
  const handleCancel = () => {
    setOpen(false);
    setState({
      ...state,
      room: "",
    });
  };
  //输入框变化
  const handleChange = (e: any) => {
    const value = e.target.value;
    setState({
      ...state,
      room: value,
    });
  };

  //退出房间
  const exitRoom = () => {
    setRoomShow(false);
    setState({
      ...state,
      type: "leave",
      room: "",
    });
  };

  // 在 `state.type` 等于 "leave" 时执行副作用
  useEffect(() => {
    if (state.type === "leave") {
      // 从socket中删除先前的事件监听器
      socket.off("message");
      // 事件发送到服务器
      socket.emit("changeRoom", {
        name: state.username,
        roomId: leaveRoom,
        type: state.type,
      });
    }
  }, [state.type]); // 确保只有在 `state.type` 发生变化时才会执行副作用

  //将当前页面的路由路径替换为 /avatar
  function changeMyName() {
    router.replace("/avatar");
  }
  //首次渲染时执行一次,
  useEffect(() => {
    //若没有token,重定向到根路径
    routerBeforEach(router);
    //修改仓库中的username
    dispatch(changeName(localStorage.getItem("username") as string));
  }, []);

  return (
    <Container>
      <img src={img.src} alt="" className="background" />
      <Button
        type="primary"
        onClick={() => {
          showModal("create");
        }}
        className="creatRoom"
      >
        {title.create}
      </Button>
      <Button
        type="primary"
        onClick={() => {
          showModal("join");
        }}
        className="joinRoom"
      >
        {title.join}
      </Button>

      <Modal
        title={title[state.type]}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Input
          placeholder="请输入四位房间号"
          onChange={handleChange}
          value={state.room}
        />
      </Modal>

      <Button
        className="changeAvararButton"
        type="primary"
        onClick={changeMyName}
      >
        更换我的头像
      </Button>

      {roomShow ? (
        <Button className="exitRoom" type="primary" onClick={exitRoom}>
          退出房间
        </Button>
      ) : (
        ""
      )}
      <ChatScreen>
        <UserList
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          messages={messages}
          setMessages={setMessages}
          setIsloading={setIsloading}
        ></UserList>
        {roomShow ? (
          <Room currentRoom={leaveRoom} allInfo={allInfo}></Room>
        ) : (
          <ChatContent
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            messages={messages}
            setMessages={setMessages}
            isloading={isloading}
            setIsloading={setIsloading}
          ></ChatContent>
        )}
      </ChatScreen>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  .background {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -999;
  }
  .changeAvararButton {
    position: absolute;
    top: 3vw;
    right: 2.5vw;
    z-index: 999;
  }
  .creatRoom {
    position: absolute;
    top: 13vw;
    right: 3vw;
    z-index: 999;
  }
  .joinRoom {
    position: absolute;
    top: 15.5vw;
    right: 3vw;
    z-index: 999;
  }
  .exitRoom {
    position: absolute;
    top: 18vw;
    right: 3vw;
    z-index: 999;
  }
`;
const ChatScreen = styled.div`
  width: 75vw;
  height: 80vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default Chat;
