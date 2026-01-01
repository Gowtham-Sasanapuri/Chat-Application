import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Registration page.css"

export default function Register() {
    let [username, set_username] = useState("")
    let [password, set_password] = useState("")
    let [phone_number, set_phone_number] = useState("")
    let navigate = useNavigate()

    let Submit = (e) => {
        e.preventDefault()
        fetch("https://chat-application-1fco.onrender.com/Register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "username": username, "password": password, "phone_number": phone_number })
        }).then(respo => respo.json())
            .then(data => {
                console.log(data)
                if (data.success) {
                    alert(data.message)
                    navigate("/Login")
                } else if (data.message === "User already exists") {
                    alert(data.message)
                    navigate("/Login")
                } else {
                    alert(data.message)
                }
            }).catch(err => console.error(err)
            )
    }

    return (
        <>

            <div className="R_body">
                <h1>Registration Page</h1>
                <div className="form">
                    <form onSubmit={Submit}>
                        <div>
                            <label htmlFor="username">Username : </label>
                            <input type="text" name="" id="username" onChange={(e) => set_username(e.target.value)} value={username} required /><br></br>
                        </div>
                        <div>
                            <label htmlFor="number">Mobile Number : </label>
                            <input type="number" name="" id="number" min={1000000000} max={9999999999} maxLength={10} onChange={(e) => set_phone_number(e.target.value)} value={phone_number} required /><br />
                        </div>
                        <div>
                            <label htmlFor="password">Password : </label>
                            <input type="password" name="" id="password" onChange={(e) => set_password(e.target.value)} value={password} required /><br></br>
                        </div>
                        <input type="submit" value="Submit" />
                    </form>
                     <p>Already have an account <span style={{ cursor: "pointer" }} onClick={() => navigate("/Login")}>Login here</span></p>
                </div>
                <div id="homebtn">
                <button onClick={() =>{
                    console.log("btn");
                 navigate("/")}}>Go to Home</button>
                    
                </div>
            </div>
        </>
    )
}