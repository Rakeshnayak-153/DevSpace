import React from 'react';
import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
export default function Tags(){const[tags,setTags]=useState([]);useEffect(()=>{api.get("/tags").then(r=>setTags(r.data))},[]);return <main className="container"><span className="eyebrow">TOPICS</span><h1>Explore tags</h1><div className="tag-grid">{tags.map(t=><Link className="tag-card" key={t._id} to={`/tag/${t.slug}`}><strong>#{t.name}</strong><span>{t.postCount} posts</span></Link>)}</div></main>}