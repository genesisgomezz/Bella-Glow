import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ListaProductos from './components/ListaProductos.jsx';
import Footer from './components/Footer.jsx';

const productos = [
 {id:1,nombre:'Labial Velvet Matte',categoria:'Labios',descripcion:'Color intenso con acabado matte y textura cómoda.',imagen:'/img/labial.svg',precio:8500},
 {id:2,nombre:'Gloss Crystal Shine',categoria:'Labios',descripcion:'Brillo ligero para un acabado luminoso.',imagen:'/img/labial.svg',precio:6900},
 {id:3,nombre:'Base Glow Skin',categoria:'Rostro',descripcion:'Cobertura natural y uniforme con acabado luminoso.',imagen:'/img/base.svg',precio:12500},
 {id:4,nombre:'Corrector Soft Cover',categoria:'Rostro',descripcion:'Cobertura suave para unificar el tono.',imagen:'/img/base.svg',precio:9500},
 {id:5,nombre:'Máscara Lash Bloom',categoria:'Ojos',descripcion:'Define y realza las pestañas para una mirada expresiva.',imagen:'/img/maquillaje.svg',precio:7900},
 {id:6,nombre:'Delineador Precision',categoria:'Ojos',descripcion:'Trazo definido y elegante para distintos looks.',imagen:'/img/maquillaje.svg',precio:6500},
 {id:7,nombre:'Paleta Sunset Nude',categoria:'Paletas',descripcion:'Tonos cálidos y versátiles para el día o la noche.',imagen:'/img/PaletaSunsetNude.jpg',precio:15900},
 {id:8,nombre:'Paleta Rose Dream',categoria:'Paletas',descripcion:'Selección de tonos rosados y neutros combinables.',imagen:'/img/PaletaRoseDream.jpg',precio:16900},
 {id:9,nombre:'Rubor Soft Rose',categoria:'Rubor',descripcion:'Color delicado para un acabado fresco y natural.',imagen:'/img/rubor.svg',precio:6900},
 {id:10,nombre:'Rubor Peach Glow',categoria:'Rubor',descripcion:'Tono durazno para dar calidez al rostro.',imagen:'/img/rubor.svg',precio:7200},
 {id:11,nombre:'Iluminador Pearl Glow',categoria:'Iluminadores',descripcion:'Luminosidad sutil para destacar puntos del rostro.',imagen:'/img/productos.svg',precio:8900},
 {id:12,nombre:'Iluminador Golden Touch',categoria:'Iluminadores',descripcion:'Acabado radiante con reflejos cálidos.',imagen:'/img/productos.svg',precio:9200},
 {id:13,nombre:'Set Brochas Essential',categoria:'Brochas',descripcion:'Brochas esenciales para rostro y ojos.',imagen:'/img/brochas.svg',precio:11900},
 {id:14,nombre:'Esponja Beauty Blend',categoria:'Brochas',descripcion:'Accesorio suave para aplicar y difuminar productos.',imagen:'/img/accesorios.svg',precio:4500},
 {id:15,nombre:'Sérum Glow Prep',categoria:'Skincare',descripcion:'Preparación ligera para una apariencia hidratada.',imagen:'/img/accesorios.svg',precio:10900},
 {id:16,nombre:'Crema Soft Hydration',categoria:'Skincare',descripcion:'Hidratación ligera para complementar tu rutina.',imagen:'/img/accesorios.svg',precio:9900}
];

function App() {
 return <div className="app" id="app">
   <Header />
   <main>
    <Hero/>
    <section id="nosotros" className="seccion nosotros"><div className="contenedor"><p className="etiqueta">SOBRE NOSOTROS</p><h2>¿Quiénes somos?</h2><p>Bella Glow Cosmetics es una tienda especializada en maquillaje, accesorios y cuidado de la piel. Nuestra colección busca ofrecer variedad para diferentes estilos y ocasiones.</p></div></section>
    <ListaProductos productos={productos}/>
    <section className="seccion beneficios"><div className="contenedor"><h2>¿Por qué elegir Bella Glow?</h2><div className="grid-beneficios"><article><h3>Calidad</h3><p>Productos cuidadosamente seleccionados.</p></article><article><h3>Variedad</h3><p>Opciones para diferentes estilos y ocasiones.</p></article><article><h3>Atención</h3><p>Una experiencia sencilla para descubrir tus favoritos.</p></article></div></div></section>
   </main>
   <Footer/>
 </div>;
}
export default App;
