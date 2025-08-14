'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Merchant(){
  const sb = createBrowserClient();
  const r = useRouter();
  const [session,setSession]=useState(null);

  const [storeSlug,setStoreSlug]=useState('demo');
  const [storeId,setStoreId]=useState(null);

  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);

  const [title,setTitle]=useState('');
  const [price,setPrice]=useState('');
  const [description,setDescription]=useState('');
  const [previews,setPreviews]=useState([]);
  const [imageUrls,setImageUrls]=useState([]);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(()=>{
    sb.auth.getSession().then(({ data }) => setSession(data.session || null));
    const sub = sb.auth.onAuthStateChange((_e, s)=> setSession(s));
    return () => { sub.data.subscription.unsubscribe(); };
  },[]);

  useEffect(()=>{ if (session) loadStoreAndData(); }, [session, storeSlug]);

  async function authHeaders(){
    const { data: { session: s } } = await sb.auth.getSession();
    return s?.access_token ? { Authorization: `Bearer ${s.access_token}` } : {};
  }

  async function loadStoreAndData(){
    const h = await authHeaders();
    const storeRes = await fetch(`/api/stores/${storeSlug}`, { headers: h });
    if (storeRes.status === 404){ setStoreId(null); setProducts([]); setOrders([]); return; }
    const store = await storeRes.json();
    setStoreId(store.id);

    const [pRes, oRes] = await Promise.all([
      fetch(`/api/products?storeId=${store.id}`, { headers: h }),
      fetch(`/api/orders?storeId=${store.id}`, { headers: h })
    ]);
    setProducts(pRes.ok ? await pRes.json() : []);
    setOrders(oRes.ok ? await oRes.json() : []);
  }

  async function createStore(){
    const h = await authHeaders();
    const r2 = await fetch('/api/stores', { method:'POST', headers:{...h,'Content-Type':'application/json'}, body: JSON.stringify({ slug: storeSlug, name: storeSlug }) });
    if (!r2.ok){ const j = await r2.json().catch(()=>({})); alert(j.error || 'Create failed'); return; }
    await loadStoreAndData();
    alert('Store created');
  }

  async function handleFiles(e){
    const fs = Array.from(e.target.files || []).slice(0,5);
    setPreviews(fs.map(f => URL.createObjectURL(f)));
    const urls = [];
    for (const f of fs){
      const blob = await compressToWebp(f, 1600, 0.85);
      const url = await uploadToCollectly(blob);
      urls.push(url);
    }
    setImageUrls(urls);
  }

  async function uploadToCollectly(blob){
    const h = await authHeaders();
    const fd = new FormData();
    fd.append('file', blob, 'photo.webp');
    fd.append('storeId', storeId);
    const r3 = await fetch('/api/upload', { method:'POST', headers: h, body: fd });
    if(!r3.ok){ const t = await r3.text(); throw new Error(t); }
    const { url } = await r3.json();
    return url;
  }

  async function addProduct(){
    if(!storeId) return alert('Create a store first');
    if(!title || !price) return alert('Enter title and price');
    const h = await authHeaders();
    const body = { store_id: storeId, title, price_pennies: Math.round(Number(price)*100), description, image_urls: imageUrls };
    const res = await fetch('/api/products', { method:'POST', headers:{...h,'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if (!res.ok){ const err = await res.json().catch(()=>({})); alert(err.error || 'Failed'); return; }
    setTitle(''); setPrice(''); setDescription(''); setPreviews([]); setImageUrls([]);
    await loadStoreAndData();
    alert('Product added');
  }

  async function toggleStock(id, val){
    const h = await authHeaders();
    await fetch('/api/products', { method:'PUT', headers:{...h,'Content-Type':'application/json'}, body: JSON.stringify({id, in_stock: val}) });
    setProducts(prev=>prev.map(p=>p.id===id?{...p,in_stock:val}:p));
  }

  async function markReady(id){
    const h = await authHeaders();
    await fetch('/api/orders', { method:'PUT', headers:{...h,'Content-Type':'application/json'}, body: JSON.stringify({id, status:'ready'}) });
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status:'ready'}:o));
  }
  async function markCollected(id){
    const h = await authHeaders();
    await fetch('/api/orders', { method:'PUT', headers:{...h,'Content-Type':'application/json'}, body: JSON.stringify({id, status:'collected'}) });
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status:'collected'}:o));
  }

  async function logout(){ await sb.auth.signOut(); r.push('/auth/login'); }

  return (
    <section>
      <h1>Merchant Dashboard</h1>
      {!session && <p><a href="/auth/login">Login</a> or <a href="/auth/signup">Sign up</a></p>}
      {session && (
        <>
          <div style={{display:'grid', gridTemplateColumns:'1.2fr auto', gap:16, alignItems:'start'}}>
            <div style={{background:'#fff', border:'1px solid #eee', borderRadius:10, padding:12}}>
              <strong>Store</strong>
              <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8, marginTop:8}}>
                <input placeholder="Store slug" value={storeSlug} onChange={e=>setStoreSlug(e.target.value)} />
                {!storeId && <button onClick={createStore}>Create store</button>}
              </div>
              <p style={{color:'#666', marginTop:8}}>
                Logged in as <code>{session.user.email}</code> · <button onClick={logout}>Log out</button><br/>
                Public shop: {storeId ? <a href={`${baseUrl}/${storeSlug}`} target="_blank">{`${baseUrl}/${storeSlug}`}</a> : '—'}
              </p>
            </div>

            <div style={{background:'#fff', border:'1px solid #eee', borderRadius:10, padding:12}}>
              <strong>Share your shop</strong>
              <div style={{marginTop:8, display:'flex', gap:8}}>
                <input readOnly value={`${baseUrl}/${storeSlug}`} style={{flex:1}}/>
                <button onClick={()=>navigator.clipboard.writeText(`${baseUrl}/${storeSlug}`)}>Copy</button>
              </div>
              <p style={{color:'#666', marginTop:8}}>Tip: add this link to your Instagram bio and Google Business Profile.</p>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:16, alignItems:'start', marginTop:16}}>
            <div style={{background:'#fff', border:'1px solid #eee', borderRadius:10, padding:12}}>
              <strong>Add product</strong>
              <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{display:'block', marginTop:8}} />
              <input placeholder="Price (£)" type="number" value={price} onChange={e=>setPrice(e.target.value)} style={{display:'block', marginTop:8}} />
              <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} rows={5} style={{display:'block', marginTop:8, width:'100%'}} />
              
              <label style={{display:'block', marginTop:8}}>Photos (up to 5)</label>
              <input type="file" accept="image/*" capture="environment" multiple onChange={handleFiles} style={{display:'block', marginTop:4}} />
              <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
                {previews.map((src,i)=>(<img key={i} src={src} style={{width:96, height:96, objectFit:'cover', borderRadius:8, border:'1px solid #eee'}}/>))}
              </div>

              <button onClick={addProduct} style={{marginTop:12, border:0, background:'#2563eb', color:'#fff', padding:'10px 12px', borderRadius:8, fontWeight:600}} disabled={!storeId}>Add</button>
            </div>

            <div style={{background:'#fff', border:'1px solid #eee', borderRadius:10, padding:12}}>
              <strong>Orders</strong>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead><tr><th style={{textAlign:'left', padding:8}}>Item</th><th style={{textAlign:'left', padding:8}}>Customer</th><th style={{textAlign:'left', padding:8}}>Pickup</th><th style={{textAlign:'left', padding:8}}>Status</th><th></th></tr></thead>
                <tbody>
                  {orders.map(o=>(
                    <tr key={o.id}>
                      <td style={{padding:8}}>{o.item_title}</td>
                      <td style={{padding:8}}>{o.customer_email}</td>
                      <td style={{padding:8}}>{new Date(o.pickup_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                      <td style={{padding:8}}>{o.status}</td>
                      <td style={{padding:8}}>
                        {o.status==='new' && <button onClick={()=>markReady(o.id)}>Mark ready</button>}
                        {o.status==='ready' && <button onClick={()=>markCollected(o.id)}>Mark collected</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 style={{marginTop:24}}>Products</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:12}}>
            {products.map(p=>(
              <div key={p.id} style={{background:'#fff', border:'1px solid #eee', borderRadius:10, padding:12}}>
                <div style={{aspectRatio:'4/3', background:'#f4f4f4', borderRadius:8, overflow:'hidden'}}>
                  {Array.isArray(p.image_urls) && p.image_urls[0] ? <img src={p.image_urls[0]} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : null}
                </div>
                <div style={{fontWeight:600, marginTop:8}}>{p.title}</div>
                <div>£{(p.price_pennies/100).toFixed(2)}</div>
                <label style={{display:'block', marginTop:8}}>
                  <input type="checkbox" checked={p.in_stock} onChange={e=>toggleStock(p.id, e.target.checked)} /> In stock
                </label>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

async function compressToWebp(file, maxEdge=1600, quality=0.85){
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(()=>null);
  const img = bitmap ? bitmap : await new Promise((resolve,reject)=>{
    const i = new Image();
    i.onload=()=>resolve(i);
    i.onerror=reject;
    i.src = URL.createObjectURL(file);
  });
  const w = img.width || (img.bitmap && img.bitmap.width) || 0;
  const h = img.height || (img.bitmap && img.bitmap.height) || 0;
  const scale = Math.min(1, maxEdge / Math.max(w,h) || 1);
  const cw = Math.max(1, Math.round((w||file.width)*scale));
  const ch = Math.max(1, Math.round((h||file.height)*scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, cw, ch);
  const blob = await new Promise(res=>canvas.toBlob(res, 'image/webp', quality));
  return blob;
}
