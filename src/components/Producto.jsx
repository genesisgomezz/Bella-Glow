function Producto({ nombre, categoria, descripcion, imagen, precio }) {
  function agregar(){
    const contador=document.getElementById('contador-carrito');
    if(contador) contador.textContent=String(Number(contador.textContent)+1);
    const aviso=document.getElementById('aviso');
    if(aviso){ aviso.textContent=`✓ ${nombre} agregado al carrito`; aviso.classList.add('visible'); setTimeout(()=>aviso.classList.remove('visible'),1600); }
  }
  function favorito(e){ e.currentTarget.textContent=e.currentTarget.textContent==='♡'?'♥':'♡'; e.currentTarget.classList.toggle('activo'); }
  function verProducto(){
    const modal=document.getElementById('modal-producto');
    document.getElementById('modal-img').src=imagen; document.getElementById('modal-img').alt=nombre;
    document.getElementById('modal-nombre').textContent=nombre; document.getElementById('modal-cat').textContent=categoria;
    document.getElementById('modal-desc').textContent=descripcion; document.getElementById('modal-precio').textContent=`₡${precio.toLocaleString('es-CR')}`;
    modal?.showModal();
  }
  return <article className="tarjeta producto" data-categoria={categoria.toLowerCase()} data-nombre={nombre.toLowerCase()}>
    <div className="producto-imagen"><img src={imagen} alt={nombre}/><button className="favorito" onClick={favorito} aria-label={`Favorito ${nombre}`}>♡</button></div>
    <span className="categoria-mini">{categoria}</span><h3>{nombre}</h3><p>{descripcion}</p><strong>₡{precio.toLocaleString('es-CR')}</strong>
    <div className="acciones"><button className="boton secundario" onClick={verProducto}>Ver producto</button><button className="boton" onClick={agregar}>🛍️ Agregar</button></div>
  </article>;
}
export default Producto;
