import React, { useEffect, useState, useRef } from "react";
import "./styles/chatpage.css"
import { jwtDecode } from "jwt-decode"

export default function Chat({ username, req_user_id,fetch_users }) {

    let [msg, set_msgs] = useState([])
    let [user_id, set_user_id] = useState("")
    let web = useRef(null)
    let [msg_to_send, set_msg_to_send] = useState("")
    let [room, set_room] = useState("")
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msg]);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = jwtDecode(token);
                console.log("Decoded payload:", payload);
                set_user_id(parseInt(payload.user_id))
            } catch (err) {
                console.error("JWT decoding failed:", err);
            }
        } else {
            console.log("Token not found");
        }
    }, []);

    useEffect(() => {
        if (user_id && req_user_id) {
            set_room(`chat_${Math.max(user_id, req_user_id)}_${Math.min(user_id, req_user_id)}`)
        }
    },[user_id, req_user_id])


    useEffect(() => {
        fetch("https://chat-application-1fco.onrender.com/fetch_message/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "token": localStorage.getItem("token"), "r_id": req_user_id })
        }).then(reso => reso.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    set_msgs(data.msg.map((ele) => ({ "message": ele.message, "sender": parseInt(ele.sender_id)})))
                }
            }).catch(err => console.error(err)
            )
    }, [req_user_id])

    useEffect(() => {
        if (!room) return
        let ws = new WebSocket(`wss://chat-application-1fco.onrender.com/ws/chat/${room}/`)
        web.current = ws

        ws.onopen = () => {
            console.log("Socket Opened");
        }
        ws.onclose = () => {
            console.log("Socket Closed");
        }
        ws.onmessage = (event) => {
            let mgs = JSON.parse(event.data);
            console.log(mgs);
            fetch_users()
            set_msgs(pre => [...pre, { "message": mgs.message, "sender": mgs.s_id }])
        }
        return () => {
            ws.close();
            console.log("🔒 WebSocket closed on cleanup")
        }

    }, [room])

    let send = () => {
        if(!msg_to_send.trim()){
            return null
        }
        if (web.current && web.current.readyState === WebSocket.OPEN) {
            web.current.send(JSON.stringify({ "message": msg_to_send, "user_id": user_id, "r_id": req_user_id }))
            set_msg_to_send("")
        } else {
            console.log("websocket closed");
        }
    }
    
    return (
        <>
            <div id="chat">
                <header>
                    <h1>{username}</h1>
                </header>
                <div id="msgs">
                    {msg.length === 0 ? (
                        <h1>Message him</h1>
                    ) : (
                        msg.map((ele,ind) => {
                            console.log("Message sender:", ele.sender, "User ID:", user_id)
                            return ele.sender === req_user_id ? (
                                <p className="left" key={ind}>{ele.message}</p>
                            ) : (
                                <p className="right" key={ind}>{ele.message}</p>
                            )
                        })
                    )}
                    <div ref={bottomRef}></div>
                    <div id="msg_sending_section">
                        <textarea rows={2} name="" id="" placeholder="Message" onChange={(e) => set_msg_to_send(e.target.value)} value={msg_to_send}></textarea>
                        <button onClick={send}>►</button>
                    </div>
                </div>
            </div>
        </>
    )
}

