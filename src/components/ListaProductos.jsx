import Producto from './Producto.jsx';
const categorias=['Todos','Labios','Rostro','Ojos','Paletas','Rubor','Iluminadores','Brochas','Skincare'];
function ListaProductos({ productos }) {
 function filtrar(categoria){
  document.querySelectorAll('.filtro').forEach(b=>b.classList.toggle('activo',b.dataset.cat===categoria));
  document.querySelectorAll('.producto').forEach(card=>{ card.style.display=(categoria==='Todos'||card.dataset.categoria===categoria.toLowerCase())?'':'none'; });
 }
 function buscar(e){ const q=e.target.value.toLowerCase().trim(); document.querySelectorAll('.producto').forEach(card=>{ card.style.display=card.dataset.nombre.includes(q)?'':'none'; }); }
 function cerrarModal(){ document.getElementById('modal-producto')?.close(); }
 return <section id="productos" className="seccion"><div className="contenedor">
  <p className="etiqueta">NUESTRA COLECCIÓN</p><h2>Encuentra tus nuevos favoritos ♡</h2>
  <div className="catalogo-herramientas"><label className="buscador">🔎 <input type="search" placeholder="Buscar producto..." onChange={buscar}/></label><div className="filtros">{categorias.map(c=><button key={c} className={`filtro ${c==='Todos'?'activo':''}`} data-cat={c} onClick={()=>filtrar(c)}>{c}</button>)}</div></div>
  <div className="grid-productos">{productos.map(p=><Producto key={p.id} {...p}/>)}</div>
  <div id="aviso" className="aviso" aria-live="polite"></div>
  <dialog id="modal-producto" className="modal"><button className="cerrar" onClick={cerrarModal} aria-label="Cerrar">×</button><img id="modal-img" src="/img/productos.svg" alt="Producto"/><span id="modal-cat" className="categoria-mini"></span><h3 id="modal-nombre"></h3><p id="modal-desc"></p><strong id="modal-precio"></strong></dialog>
 </div></section>;
}
export default ListaProductos;
