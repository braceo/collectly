import { supabaseAdmin } from '@/lib/supabase';

export default async function ItemPage({ params }){
  const { data: p } = await supabaseAdmin
    .from('products')
    .select('*, store_id')
    .eq('id', params.id).maybeSingle();

  if (!p) return <div>Item not found.</div>;
  const images = Array.isArray(p.image_urls) ? p.image_urls : [];

  return (
    <section style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start'}}>
      <div>
        <div style={{display:'grid', gap:8}}>
          <div style={{aspectRatio:'4/3', background:'#fafafa', border:'1px solid #eee', borderRadius:8, overflow:'hidden'}}>
            {images[0] ? <img src={images[0]} alt={p.title} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : null}
          </div>
          <div style={{display:'flex', gap:8}}>
            {images.slice(0,5).map((src, i) => (
              <img key={i} src={src} alt="" style={{width:72, height:72, objectFit:'cover', borderRadius:6, border:'1px solid #eee'}}/>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h1 style={{marginTop:0}}>{p.title}</h1>
        <div style={{fontSize:24, fontWeight:700}}>£{(p.price_pennies/100).toFixed(2)}</div>
        {p.description && <p style={{whiteSpace:'pre-wrap'}}>{p.description}</p>}

        <form id="checkoutForm" action="/api/checkout" method="post" style={{display:'grid', gap:8, marginTop:16}}>
          <input type="hidden" name="productId" value={p.id} />
          <input type="hidden" name="storeId" value={p.store_id} />
          <input type="hidden" name="pickupISO" id="pickupISO" />
          <input name="email" type="email" placeholder="Your email" required />
          <label>Pickup time<input name="pickup" type="time" required defaultValue="14:00" /></label>
          <button type="submit" style={{border:0, background:'#2563eb', color:'#fff', padding:'10px 12px', borderRadius:8, fontWeight:600}}>Pay & Reserve</button>
        </form>

        <script dangerouslySetInnerHTML={{__html: `
          (function(){
            const form = document.getElementById('checkoutForm');
            if(!form) return;
            form.addEventListener('submit', function(){
              const time = form.querySelector('input[name="pickup"]').value || '14:00';
              const now = new Date();
              const [hh, mm] = time.split(':').map(Number);
              const local = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh||14, mm||0, 0);
              document.getElementById('pickupISO').value = local.toISOString();
            });
          })();
        `}} />
      </div>
    </section>
  );
}
