import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/home.css"

export default function Home() {
    let navigate = useNavigate()
    let login = () => {
        navigate("/login")
    } 
    return (
        <>
            <div id="home">
                <div id="header">
                    <h1>Chatting Application</h1>
                </div>
                <div className="body">
                    <p>This online chatting application facilitates seamless real-time communication between users through a secure and responsive interface. Built with Django, Django Channels, and WebSockets, it supports instant message exchange, user authentication, message persistence, and live indicators such as typing notifications. The system ensures reliable performance and scalability by integrating MySQL for robust data storage and optional React for an engaging frontend experience. Whether for casual conversation or collaborative communication, the app delivers an interactive environment designed to mimic real-world messaging with modern web technology.</p>
                </div>
                <button onClick={login}>Login</button>
            </div>
        </>
    )
}