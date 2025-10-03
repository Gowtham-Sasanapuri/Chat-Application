import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    let [phone_number, set_phone_number] = useState("")
    let [password, set_password] = useState("")
    let navigate = useNavigate();

    useEffect(() => {
        let token = localStorage.getItem("token") || null
        if (token) {
            fetch(" http://127.0.0.1:8000/Login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "token": token })
            }).then(respo => respo.json())
                .then(data => {
                    console.log(data)
                    if (data.success) {
                        alert(data.message)
                        navigate("/Index")
                    } else if (data.message === "user not found") {
                        alert(data.message)
                        navigate("/Register")
                    }
                }).catch(err => console.error("Auto login error", err)
                )
        }
    }, [navigate])

    let submit = (e) => {
        e.preventDefault()

        fetch("http://127.0.0.1:8000/Login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "phone_number": phone_number, "password": password })
        }).then(respo => respo.json())
            .then(data => {
                console.log(data)
                if (data.success) {
                    localStorage.setItem("phone_number", data.phone_number)
                    localStorage.setItem("token", data.jwt_token)
                    alert(data.message)
                    navigate("/Index")
                } else {
                    alert("incorrect password")
                }
            }).catch(err => console.error(err)
            )

    }

    return (
        <>
            <div className="R_body">
                <h1>Login Page</h1>
                <div className="form">
                    <form onSubmit={submit}>
                        <div>
                            <label htmlFor="number">Mobile Number : </label>
                            <input type="number" name="" id="number" max={9999999999} min={1000000000} onChange={(e) => set_phone_number(e.target.value)} value={phone_number} /><br />
                        </div>
                        <div>
                            <label htmlFor="password">Password : </label>
                            <input type="password" name="" id="password" onChange={(e) => set_password(e.target.value)} value={password} /><br></br>
                        </div>
                        <input type="submit" value="Submit" />
                    </form>
                    <p>Don't have an account <span style={{ cursor: "pointer" }} onClick={() => navigate("/Register")}>Register here</span></p>
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