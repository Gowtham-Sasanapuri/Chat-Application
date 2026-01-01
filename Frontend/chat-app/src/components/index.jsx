import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "./chatpage";
import { jwtDecode } from "jwt-decode"

import "./styles/index.css"

export default function Index() {
    let navigate = useNavigate();
    let [user, set_user] = useState("")
    let [users, set_users] = useState([])
    let [requested_user_chat_id, set_request_user_chat_id] = useState("")
    let [requested_username, set_requested_username] = useState("")
    let [room, set_room] = useState("")
    let [user_id, set_user_id] = useState("")
    let [unseen,set_unseen] = useState([])

    useEffect(() => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const payload = jwtDecode(token);
                    console.log("Decoded payload:", payload);
                    set_user_id(payload.user_id)
                } catch (err) {
                    console.error("JWT decoding failed:", err);
                }
            } else {
                console.log("Token not found");
            }
    
        }, []);

    useEffect(() => {
        if(!room){
            console.log(" ----->room still doesn't assigned");
            return ;
        }
        let ws = new WebSocket(`wss://chat-application-1fco.onrender.com/ws/chat/user/${room}/`)

        ws.onopen = () => {
            console.log(">>>socket opened");
            console.log(">>>message going to send");
            ws.send(JSON.stringify({"message" : "give me the users consumers","cur_user_id":user_id}))
        }
        ws.onclose = () => {
            console.log(">>>>Socket Closed");
        }

        ws.onmessage = (event) => {
            let json_data = JSON.parse(event.data)
            console.log(">>>>>message received",json_data);
            if (json_data.success){
                set_users(json_data.users.map((ele) => ({ "username": ele.username, "id": ele.id })))
                set_unseen(json_data.unseen_id)
            }
        }
    },[room,user_id])

    useEffect(() => {
        if(user_id){
            set_room(`user_${user_id}`)
        }
    },[user_id])


    let fetch_users = (search_term = "") => {
        fetch("https://chat-application-1fco.onrender.com/search_user/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "user": search_term, "token": localStorage.getItem("token") })
        }).then(response => response.json())
            .then(data => {
                console.log("data => ",data);
                if (data.success && Array.isArray(data.user)) {
                    set_users(data.user.map((ele) => ({ "username": ele.username, "id": ele.id })))
                    set_unseen(data.unseen)
                } else {
                    set_users([])
                }
            }).catch(err => console.error(err)
            )
    }

    let unread_users = () => {
        let un_users = users.filter((ele) => unseen.includes(ele.id))
        set_users(un_users)   
    }
   
    let all_users = () => {
        fetch_users()
    } 

    useEffect(() => {
        fetch_users()
    }, [])

    useEffect(() => {
        if (user.trim() === "") {
            fetch_users()
        }
    }, [user])

    let search = () => {
        if (user.trim() === "") {
            fetch_users("");
        } else {
            fetch_users(user);
        }
    }

    let getting_receiver_details = (id, username) => {
        set_request_user_chat_id(parseInt(id))
        set_requested_username(username)
    }

    useEffect(() => {
        if(!localStorage.getItem("token")){
            return navigate("/Login")
        }
    },[navigate])


    let Logout = () => {
        localStorage.removeItem("phone_number")
        localStorage.removeItem("token")
        navigate("/Login")
    }

    return (
        <>
            <div className="I_body">
                <div id="container">
                    <div id="users">
                        <div className="search">
                            <input type="text" onChange={(e) => set_user(e.target.value)} value={user} placeholder="search user by name or phone number"
                                id="search_bar" max={9999999999} min={1000000000} />
                            <button onClick={search} id="search_btn">⌕</button>
                        </div>
                        <div id="buttons">
                            <button onClick={all_users}>All</button>    
                            <button onClick={unread_users}>Unread</button>
                        </div>
                        <div className="messengers">
                            {
                                users.length === 0 ? (
                                    <div className="user" style={{color:"white"}}>User Not Found</div>
                                ) : (
                                    users.map((ele, ind) => (
                                        <div key={ind}>
                                            <div className="user" onClick={() => getting_receiver_details(ele.id, ele.username)}>{ele.username}
                                                {
                                                    (unseen || []).includes(ele.id) && <p>🟢</p>
                                                }
                                            </div>
                                        </div>
                                    ))
                                )
                            }
                        </div>
                    </div>
                    <div id="chat">
                        {  requested_username &&
                        <Chat username = {requested_username} req_user_id = {requested_user_chat_id} fetch_users={fetch_users}></Chat>
                        }
                    </div>
                </div>
                <div id="Logout_section">
                    <button id="Logout" onClick={Logout}>Log Out</button>
                </div>
            </div >
        </>
    )
}