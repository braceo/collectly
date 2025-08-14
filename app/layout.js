export const metadata = { title: 'Collectly', description: 'Click & Collect for boutiques' };
export default function RootLayout({ children }){
  return (
    <html lang="en">
      <body style={{fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', background:'#f7f7fb', color:'#111', margin:0}}>
        <header style={{background:'#fff', borderBottom:'1px solid #eee', padding:'12px 16px', position:'sticky', top:0}}>
          <a href="/" style={{textDecoration:'none', color:'#111', fontWeight:700}}>Collectly</a>
          <nav style={{float:'right'}}>
            <a href="/merchant" style={{marginLeft:12}}>Merchant</a>
            <a href="/auth/login" style={{marginLeft:12}}>Login</a>
          </nav>
        </header>
        <main style={{maxWidth:1024, margin:'0 auto', padding:16}}>{children}</main>
        <footer style={{textAlign:'center', color:'#666', padding:24}}>© Collectly</footer>
      </body>
    </html>
  );
}
