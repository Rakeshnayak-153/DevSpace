import React from 'react';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
export default function Login(){
 const {login}=useAuth(),nav=useNavigate(),[form,setForm]=useState({email:"",password:""}),[error,setError]=useState("");
 const submit=async e=>{e.preventDefault();setError("");try{await login(form.email,form.password);nav("/dashboard")}catch(x){setError(x.response?.data?.message||"Login failed")}};
 return <Auth title="Welcome back" subtitle="Log in to continue writing."><form onSubmit={submit}>{error&&<div className="error">{error}</div>}<input required type="email" placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/><input required type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/><button className="primary">Login</button><p>New here? <Link to="/register">Create an account</Link></p></form></Auth>
}
export function Auth({title,subtitle,children}){return <main className="auth"><div className="auth-box"><h1>{title}</h1><p>{subtitle}</p>{children}</div></main>}