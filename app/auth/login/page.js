'use client';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login(){
  const sb = createBrowserClient();
  const r = useRouter();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');

  async function onLogin(e){
    e.preventDefault();
    setErr('');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error){ setErr(error.message); return; }
    r.push('/merchant');
  }

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={onLogin} style={{display:'grid', gap:8, maxWidth:360}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div style={{color:'#b91c1c'}}>{err}</div>}
        <button type="submit">Login</button>
        <a href="/auth/signup">Create an account</a>
      </form>
    </section>
  );
}
