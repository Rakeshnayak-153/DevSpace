import React from 'react';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Auth } from "./Login.jsx";
export default function Register(){
 const {register}=useAuth(),nav=useNavigate(),[f,setF]=useState({name:"",email:"",password:""}),[error,setError]=useState("");
 const submit=async e=>{e.preventDefault();try{await register(f.name,f.email,f.password);nav("/dashboard")}catch(x){setError(x.response?.data?.message||"Registration failed")}};
 return <Auth title="Create your account" subtitle="Start publishing your developer journey."><form onSubmit={submit}>{error&&<div className="error">{error}</div>}<input required placeholder="Full name" onChange={e=>setF({...f,name:e.target.value})}/><input required type="email" placeholder="Email" onChange={e=>setF({...f,email:e.target.value})}/><input required minLength="6" type="password" placeholder="Password (6+ characters)" onChange={e=>setF({...f,password:e.target.value})}/><button className="primary">Create account</button><p>Already registered? <Link to="/login">Login</Link></p></form></Auth>
}