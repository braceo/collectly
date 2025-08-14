import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';

export default async function Storefront({ params }){
  const { data: store } = await supabaseAdmin.from('stores').select('*').eq('slug', params.store).maybeSingle();
  if (!store) return <section><h1>Store not found</h1></section>;

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id,title,price_pennies,in_stock,image_urls')
    .eq('store_id', store.id)
    .eq('in_stock', true)
    .order('title');

  return (
    <section>
      <h1>{store.name || params.store} — Click & Collect</h1>
      <ul style={{listStyle:'none', padding:0, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12}}>
        {products?.map(p => (
          <li key={p.id} style={{background:'#fff', border:'1px solid #eee', borderRadius:10, padding:12}}>
            <Link href={`/item/${p.id}`} style={{textDecoration:'none', color:'inherit'}}>
              <div style={{aspectRatio:'4/3', background:'#ececec', display:'flex', alignItems:'center', justifyContent:'center', color:'#888'}}>
                {Array.isArray(p.image_urls) && p.image_urls[0] ? <img src={p.image_urls[0]} alt="" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:8}}/> : 'Image'}
              </div>
              <div style={{fontWeight:600, marginTop:8}}>{p.title}</div>
            </Link>
            <div>£{(p.price_pennies/100).toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
