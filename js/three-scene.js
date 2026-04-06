// Lightweight Three.js scene for hero background
(function(){
  if(!window.THREE) return console.warn('Three.js not found, skipping 3D scene');
  const prefsReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;

  let renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 60);

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 0.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5,10,7);
  scene.add(dir);

  // materials
  const matA = new THREE.MeshStandardMaterial({color:0x77ddff, metalness:0.1, roughness:0.35});
  const matB = new THREE.MeshStandardMaterial({color:0xa18fff, metalness:0.3, roughness:0.25});
  const matC = new THREE.MeshStandardMaterial({color:0x7ee787, metalness:0.05, roughness:0.4});

  // geometries
  const torus = new THREE.Mesh(new THREE.TorusGeometry(10,1.8,24,60), matA);
  torus.position.set(-20, -5, 0);
  scene.add(torus);

  const box = new THREE.Mesh(new THREE.BoxGeometry(12,12,12), matB);
  box.position.set(14, 6, 0);
  scene.add(box);

  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(7,1), matC);
  ico.position.set(0, 10, 0);
  scene.add(ico);

  // subtle orbit group for gentle motion
  const group = new THREE.Group();
  group.add(torus, box, ico);
  scene.add(group);

  let running = true;
  let last = performance.now();

  function resize(){
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if(canvas.width !== w || canvas.height !== h){
      renderer.setSize(w, h, false);
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
    }
  }

  function animate(now){
    if(!running) return;
    const dt = Math.min(40, now - last)/1000; last = now;
    // respect reduced motion: slow or static
    const time = now * 0.0006;
    if(!prefsReduce){
      torus.rotation.x += 0.4 * dt;
      torus.rotation.y += 0.6 * dt;
      box.rotation.x += 0.2 * dt;
      box.rotation.y += 0.28 * dt;
      ico.rotation.y += 0.5 * dt;
      group.rotation.z = Math.sin(time)*0.07;
      group.rotation.x = Math.cos(time)*0.03;
    }
    resize();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // pause when page not visible
  document.addEventListener('visibilitychange', ()=>{
    running = document.visibilityState === 'visible';
    if(running){ last = performance.now(); requestAnimationFrame(animate); }
  });

  // subtle parallax on scroll and mouse
  const hero = document.getElementById('hero');
  if(hero){
    hero.addEventListener('mousemove', (e)=>{
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      camera.position.x = nx * 10;
      camera.position.y = -ny * 6;
      camera.lookAt(0,0,0);
    });
    hero.addEventListener('mouseleave', ()=>{ camera.position.x = 0; camera.position.y = 0; camera.lookAt(0,0,0); });
  }

  // some cleanup on unload
  window.addEventListener('unload', ()=>{
    try{ renderer.dispose(); }catch(e){}
  });
})();

