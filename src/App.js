import React, { useRef, useEffect, useState } from "react";
import Popcat from "./components/Popcat";
import Ranking from "./components/Ranking";
import styles from "./App.module.css";
import reducer from "./store";
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux";
import ModalBasic from "./components/ModalBasic";

function App() {
  const online = useSelector((state) => state.onlineMode);
  const id = useSelector((state) => state.id);
  const count = useSelector((state) => state.count);
  const rankingMode = useSelector((state) => state.rankingMode);
  const modal = useSelector((state) => state.modal);
  const name = useSelector((state) => state.nickname);
  const ws = useRef(null);
  const dispatch = useDispatch();
  const wsurl = //"ws://localhost:8080/popcat_server";
    "wss://port-0-pop-cat-server-cf24lca6hcal.gksl2.cloudtype.app/popcat_server";
  useEffect(() => {
    if (online) {
      console.log("connecting to  ", wsurl);
      ws.current = new WebSocket(wsurl);
      ws.current.onopen = () => {
        console.log("connected");
      };
      ws.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "ranking") {
          dispatch({ type: "RANKING", ranking: data.data });
          console.log(data.data);
        } else if (data.type === "top10") {
          dispatch({ type: "TOP10", top10: data.data });
          console.log(data.data);
        } else if (data.type === "id") {
          if (id.length < 1) {
            dispatch({ type: "ID", id: data.data });
          }
          console.log(data.data);
        }
      };
      ws.current.onclose = () => {
        console.log("disconnected");
        dispatch({ type: "OFFLINE" });
        if (rankingMode) {
          dispatch({ type: "ONLINE" });
          console.log("reconnecting");
        }
      };
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [online]);

  useEffect(() => {
    if (online) {
      console.log(
        JSON.stringify({
          id: id,
          count: count,
        })
      );
      ws.current.send(
        JSON.stringify({
          type: "count",
          id: id,
          count: count,
        })
      );
    }
  }, [count]);

  useEffect(() => {
    if (online) {
      console.log("sending nickname: ", name, " id: ", id, " to server");
      ws.current.send(
        JSON.stringify({
          type: "nickname",
          id: id,
          name: name,
        })
      );
    }
  }, [name]);

  return (
    <div className={styles.container}>
      {modal ? <ModalBasic /> : null}
      <Popcat />
      <Ranking />
    </div>
  );
}

export default App;