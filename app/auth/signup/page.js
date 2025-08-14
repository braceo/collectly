'use client';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Signup(){
  const sb = createBrowserClient();
  const r = useRouter();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');

  async function onSignup(e){
    e.preventDefault();
    setErr('');
    const { error } = await sb.auth.signUp({ email, password });
    if (error){ setErr(error.message); return; }
    // Fallback auto-login
    const { error: e2 } = await sb.auth.signInWithPassword({ email, password });
    if (e2){ setErr(e2.message); return; }
    r.push('/merchant');
  }

  return (
    <section>
      <h1>Create an account</h1>
      <form onSubmit={onSignup} style={{display:'grid', gap:8, maxWidth:360}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div style={{color:'#b91c1c'}}>{err}</div>}
        <button type="submit">Sign up</button>
        <a href="/auth/login">Have an account? Login</a>
      </form>
    </section>
  );
}
