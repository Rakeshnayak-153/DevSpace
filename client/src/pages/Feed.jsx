import React from 'react';
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import PostCard from "../components/PostCard.jsx";
import { Link } from "react-router-dom";
export default function Feed() {
  const [posts,setPosts]=useState([]),[search,setSearch]=useState(""),[loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);api.get("/posts",{params:{search}}).then(r=>setPosts(r.data)).finally(()=>setLoading(false));};
  useEffect(()=>{load()},[]);
  return <main className="container">
    <section className="hero"><span className="eyebrow">DEVELOPER PUBLISHING</span><h1>Write. Build. Share.</h1><p>A modern place for developers to publish technical ideas, tutorials and stories.</p>
    <div className="search"><input placeholder="Search posts..." value={search} onChange={e=>setSearch(e.target.value)}/><button onClick={load}>Search</button></div></section>
    <div className="section-head"><h2>Latest articles</h2><Link to="/tags">Explore tags →</Link></div>
    {loading?<div className="center">Loading...</div>:posts.length?<div className="grid">{posts.map(p=><PostCard key={p._id} post={p}/>)}</div>:<div className="empty">No published posts found.</div>}
  </main>;
}