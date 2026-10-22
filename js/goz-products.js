// goz-products.js: datos + modelos 3D (procedurales) + control de selección para Goz Parrilla
import * as THREE from 'three';

/* ───────── 1. DATOS (edita aquí textos, ingredientes y fichas) ───────── */
const BURGER_ING = [
  { name: 'Pan brioche', detail: 'Suave y ligeramente dulce, con ajonjolí.', part: 'bun' },
  { name: 'Carne 150 g', detail: 'Blend de cogote de res, pecho de res y barriga de cerdo o tocino.', part: 'patty' },
  { name: 'Queso cheddar', detail: 'Derretido sobre cada carne.', part: 'cheese' },
  { name: 'Cebolla caramelizada', detail: 'Cocinada lento hasta quedar dulce. Misma porción en las tres.', part: 'onion' },
  { name: 'Salsa de la casa', detail: 'Nuestra receta propia.', part: 'sauce' },
];
const NAMES = ['Sencilla', 'Doble', 'Triple'];

export const PRODUCTS = [
  { id: 'burger', icon: '🍔', name: 'Hamburguesa', tag: 'Blend de 3 cortes · pan brioche',
    variants: [1, 2, 3].map(n => ({
      label: NAMES[n - 1], patties: n, model: 'assets/models/' + ['sencilla', 'doble', 'triple'][n - 1] + '.glb', ingredients: BURGER_ING,
      specs: [['Carnes', `${n} × 150 g`], ['Carne total', `${150 * n} g`], ['Blend', 'Cogote, pecho de res y barriga de cerdo/tocino'],
              ['Pan', 'Brioche'], ['Queso', `Cheddar ×${n}`], ['Cebolla caramelizada', 'Misma porción en todas'], ['Contiene (verifica)', 'Gluten, lácteos, cerdo']] })) },
  { id: 'choripan', icon: '🌭', name: 'Choripán', tag: 'Clásico tradicional · glaseado',
    variants: [
      { label: 'Cerveza negra', glaze: 0x3a1d0c, model: 'assets/models/cerveza.glb', fallback: 'assets/models/choripan.glb',
        ingredients: [{ name: 'Pan', detail: 'Pan clásico para choripán.', part: 'bun' },
          { name: 'Chorizo', detail: 'Clásico y tradicional, a la parrilla.', part: 'sausage' },
          { name: 'Glaseado de cerveza negra', detail: 'Cerveza negra, panela, mantequilla, ajo, cebolla y salsa inglesa.', part: 'glaze' }],
        specs: [['Tipo', 'Choripán clásico'], ['Reducción', 'Cerveza negra'], ['Contiene (verifica)', 'Gluten, lácteos, alcohol de la reducción']] },
      { label: "Jack Daniel's", glaze: 0xc77a1e, model: 'assets/models/Jack.glb', fallback: 'assets/models/choripan.glb',
        ingredients: [{ name: 'Pan', detail: 'Pan clásico para choripán.', part: 'bun' },
          { name: 'Chorizo', detail: 'Clásico y tradicional, a la parrilla.', part: 'sausage' },
          { name: "Glaseado Jack Daniel's", detail: "Jack Daniel's, jugo de piña, panela, teriyaki, mostaza, pimienta, sal y mantequilla.", part: 'glaze' }],
        specs: [['Tipo', 'Choripán clásico'], ['Reducción', "Jack Daniel's"], ['Contiene (verifica)', 'Gluten, lácteos, soya, alcohol de la reducción']] },
    ] },
  { id: 'drink', icon: '🥤', name: 'Bebida', tag: 'Limonada de la casa (edita)',
    variants: [{ label: 'Única',
      ingredients: [{ name: 'Limón', detail: 'EDITA: ingredientes reales.', part: 'liquid' }, { name: 'Hielo', detail: 'EDITA.', part: 'ice' }, { name: 'Rodaja de limón', detail: 'EDITA.', part: 'citrus' }],
      specs: [['Tamaño', 'EDITA (ej. 12 oz)'], ['Tipo', 'Sin alcohol']] }] },
];

/* ───────── 2. MODELOS ───────── */
const C = { bun: 0xd9993f, patty: 0x4a2a1a, cheese: 0xf2b01e, onion: 0x7a3f12, sauce: 0xc8561a, sesame: 0xf3e2c4, sausage: 0x9a4a2c, lemon: 0xd9e86a, lime: 0x7bb33a, straw: 0xe8913a };
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .6, ...o });
const mesh = (geo, c, o) => new THREE.Mesh(geo, mat(c, o));

function Model() {
  const g = new THREE.Group(), parts = {};
  return { g, parts, add(name, obj, y0, y1) { obj.position.y = y0; obj.userData.y = [y0, y1]; (parts[name] ||= []).push(obj); g.add(obj); } };
}

function buildBurger(n) {
  const m = Model(); let y = 0, k = 0; const gap = .38;
  const layer = (name, obj, h, off = h / 2) => { m.add(name, obj, y + off, y + off + k * gap); y += h; k++; };
  layer('bun', mesh(new THREE.CylinderGeometry(.52, .46, .16, 40), C.bun), .16);
  const sauce = mesh(new THREE.SphereGeometry(.46, 24, 12), C.sauce, { roughness: .3 }); sauce.scale.y = .16; layer('sauce', sauce, .07);
  for (let i = 0; i < n; i++) {
    layer('patty', mesh(new THREE.CylinderGeometry(.5, .5, .14, 40), C.patty, { roughness: .9 }), .14);
    const ch = mesh(new THREE.BoxGeometry(.95, .03, .95), C.cheese, { roughness: .35 }); ch.rotation.y = .785; layer('cheese', ch, .04);
  }
  // Cebolla caramelizada: UNA sola porción, igual en sencilla, doble y triple
  const on = new THREE.Group();
  for (let j = 0; j < 12; j++) { const t = mesh(new THREE.TorusGeometry(.1, .028, 8, 16), C.onion, { roughness: .4 }); t.position.set(Math.cos(j * 2.4) * .3 * (.6 + (j % 3) * .2), (j % 2) * .02, Math.sin(j * 2.4) * .3 * (.6 + (j % 3) * .2)); t.rotation.set(Math.PI / 2, 0, j); on.add(t); }
  layer('onion', on, .08);
  const top = new THREE.Group();
  const dome = mesh(new THREE.SphereGeometry(.52, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), C.bun, { roughness: .5 }); dome.scale.y = .8; top.add(dome);
  for (let i = 0; i < 16; i++) { const a = i * 2.4, th = .25 + (i % 5) * .22, s = mesh(new THREE.SphereGeometry(.028, 8, 6), C.sesame);
    s.scale.y = .6; s.position.set(.52 * Math.sin(th) * Math.cos(a), .52 * .8 * Math.cos(th) + .01, .52 * Math.sin(th) * Math.sin(a)); top.add(s); }
  layer('bun', top, .42, 0);
  m.g.position.y = -y / 2; return m;
}

function buildChori(glaze) {
  const m = Model(), R = Math.PI / 2;
  const bun = mesh(new THREE.CylinderGeometry(.27, .27, 1.35, 28), C.bun); bun.rotation.z = R; bun.scale.x = .75; m.add('bun', bun, 0, -.3);
  const sg = new THREE.Group(), body = mesh(new THREE.CylinderGeometry(.17, .17, 1.3, 24), C.sausage, { roughness: .5 }); body.rotation.z = R; sg.add(body);
  [-.65, .65].forEach(x => { const c = mesh(new THREE.SphereGeometry(.17, 20, 14), C.sausage, { roughness: .5 }); c.position.x = x; sg.add(c); });
  m.add('sausage', sg, .18, .3);
  const gl = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, 1.05, 28, 1, true, R - .9, 1.8), new THREE.MeshPhysicalMaterial({ color: glaze, roughness: .15, clearcoat: 1, side: THREE.DoubleSide }));
  gl.rotation.z = R; m.add('glaze', gl, .18, .78);
  m.setGlaze = c => m.parts.glaze[0].material.color.setHex(c); m.g.position.y = -.1; return m;
}

function buildDrink() {
  const m = Model(), R = Math.PI / 2;
  const clear = { transparent: true, opacity: .22, roughness: .05, side: THREE.DoubleSide };
  m.add('glass', mesh(new THREE.CylinderGeometry(.34, .27, 1, 32, 1, true), 0xcfe8ff, clear), .5, 1.3);
  m.add('liquid', mesh(new THREE.CylinderGeometry(.31, .27, .78, 32), C.lemon, { transparent: true, opacity: .85, roughness: .2 }), .4, .4);
  const ice = new THREE.Group();
  [[-.1, 0, .05], [.1, .05, -.08], [0, .1, .12]].forEach(([x, y, z], i) => { const c = mesh(new THREE.BoxGeometry(.2, .2, .2), 0xeaf6ff, { transparent: true, opacity: .6, roughness: .1 }); c.position.set(x, y, z); c.rotation.set(i, i * 2, 0); ice.add(c); });
  m.add('ice', ice, .72, .95);
  const st = mesh(new THREE.CylinderGeometry(.03, .03, 1.25, 10), C.straw); st.rotation.z = .25; st.position.x = .12; m.add('straw', st, .72, 1.55);
  const lime = mesh(new THREE.CylinderGeometry(.2, .2, .04, 24), C.lime); lime.rotation.x = R; lime.position.x = .3; lime.position.z = .1; m.add('citrus', lime, .98, 1.9);
  m.g.position.y = -.5; return m;
}

/* ───────── 2b. MODELOS .GLB (reales) ───────── */
// Si los nodos del .glb se llaman así (o empiezan así), "Separar" y el brillo funcionan por pieza.
const KEYS = { bun: ['bun', 'pan', 'brioche'], patty: ['patty', 'carne'], cheese: ['cheese', 'queso', 'cheddar'], onion: ['onion', 'cebolla'], sauce: ['sauce', 'salsa'],
  sausage: ['sausage', 'chorizo'], glaze: ['glaze', 'glaseado', 'reduccion'], glass: ['glass', 'vaso'], liquid: ['liquid', 'liquido'], ice: ['ice', 'hielo'], straw: ['straw', 'pitillo'], citrus: ['citrus', 'limon'] };
const gltfCache = {};
async function getLoader() {
  if (window.ThreeGLTFLoader) return new window.ThreeGLTFLoader();
  const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/loaders/GLTFLoader.js');
  return new GLTFLoader();
}
const loadGLB = url => gltfCache[url] ||= getLoader().then(l => new Promise((res, rej) => l.load(url, g => res(g.scene), undefined, rej)));

async function buildFromGLB(url, target) {
  const src = (await loadGLB(url)).clone(true);
  const box = new THREE.Box3().setFromObject(src), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const m = Model(), wrap = new THREE.Group();
  src.position.sub(ctr);                                    // centra el modelo
  wrap.add(src); wrap.scale.setScalar(target / Math.max(size.x, size.z, .001));  // tamaño automático por ancho
  m.g.add(wrap); wrap.updateMatrixWorld(true);
  const found = {};
  src.traverse(o => {
    if (o === src || !o.name) return;
    const t = o.name.toLowerCase().split(/[^a-z]+/);
    for (const [part, keys] of Object.entries(KEYS)) if (t.some(x => keys.some(q => x === q || x.startsWith(q)))) { (found[part] ||= []).push(o); break; }
  });
  const cy = o => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).y;
  const names = Object.keys(found).sort((a, b) => cy(found[a][0]) - cy(found[b][0]));
  m.explodable = names.length >= 2;
  if (m.explodable) names.forEach((part, i) => found[part].forEach(o => { o.userData.y = [o.position.y, o.position.y + i * size.y * .12]; (m.parts[part] ||= []).push(o); }));
  return m;
}

/* ───────── 3. CONTROLADOR ───────── */
export function createGoz({ mount, camera, dom, onTap }) {
  const stage = new THREE.Group();
  stage.rotation.x = Math.PI / 2;          // en MindAR "arriba" es +Z: giramos para que el producto quede de pie sobre la imagen
  stage.scale.setScalar(.45);              // ← tamaño sobre la imagen objetivo
  const rig = new THREE.Group(); stage.add(rig);
  stage.add(new THREE.HemisphereLight(0xffffff, 0x553322, 1.2));
  const dl = new THREE.DirectionalLight(0xffffff, 1.8); dl.position.set(2, 4, 3); stage.add(dl);
  mount.add(stage);

  let token = 0, cur = null, s = 0, v = 0, ex = 0, exT = 0, hl = null, hlEnd = 0, drag = false, moved = 0, lx = 0;
  const clock = new THREE.Clock(), ray = new THREE.Raycaster();
  const glow = (name, on, t = 0) => (cur?.parts[name] || []).forEach(o => o.traverse(m => { if (m.material?.emissive) { m.material.emissive.setHex(0xff8a1c); m.material.emissiveIntensity = on ? .45 + .35 * Math.sin(t * 10) : 0; } }));

  (function loop() {
    requestAnimationFrame(loop);
    const dt = clock.getDelta(), t = clock.elapsedTime; if (!cur) return;
    v += (1 - s) * .22; v *= .72; s += v; cur.g.scale.setScalar(Math.max(s, .001));   // “pop” elástico al aparecer
    if (!drag) rig.rotation.y += dt * .6;
    rig.position.y = Math.sin(t * 1.6) * .04;
    ex += (exT - ex) * .12;
    Object.values(cur.parts).flat().forEach(o => { o.position.y = THREE.MathUtils.lerp(o.userData.y[0], o.userData.y[1], ex); });
    if (hl) { if (t > hlEnd) { glow(hl, false); hl = null; } else glow(hl, true, t); }
  })();

  dom.addEventListener('pointerdown', e => { drag = true; moved = 0; lx = e.clientX; });
  addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); rig.rotation.y += dx * .012; });
  addEventListener('pointerup', e => {
    if (!drag) return; drag = false; if (moved > 6 || !cur) return;
    const r = dom.getBoundingClientRect();
    ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera);
    if (ray.intersectObject(rig, true).length) onTap?.();
  });

  return {
    async show(p, vi = 0) {
      const my = ++token, v0 = p.variants[vi];
      let m = null;
      for (const url of [v0.model, v0.fallback].filter(Boolean)) {
        try { m = await buildFromGLB(url, p.id === 'burger' ? 1.1 : 1.5); break; } catch (e) { console.warn('[Goz] No se pudo cargar', url, e); }
      }
      if (my !== token) return null;                           // llegó otra selección mientras cargaba
      if (!m) m = p.id === 'burger' ? buildBurger(v0.patties) : p.id === 'choripan' ? (x => (x.setGlaze(v0.glaze), x))(buildChori(v0.glaze)) : buildDrink();
      if (cur) rig.remove(cur.g);
      cur = m; rig.add(cur.g); s = 0; v = 0; hl = null;
      return { explodable: m.explodable !== false };
    },
    hide() { token++; if (cur) rig.remove(cur.g); cur = null; },
    setExplode(b) { exT = b ? 1 : 0; },
    highlight(name) { if (hl) glow(hl, false); hl = name; hlEnd = clock.elapsedTime + 1.8; },
  };
}
