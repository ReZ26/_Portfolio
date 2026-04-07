(function() {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.error('THREE.js not loaded');
    return;
  }

  let scene, camera, renderer;
  const objects = [];
  let mouseX = 0;
  let mouseY = 0;
  let animationId = null;
  let isWebGLSupported = true;

  function init() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0x0a0e27, 150, 500);

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    camera.position.z = 100;

    try {
      renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true
      });
    } catch (e) {
      console.warn('WebGL not supported, disabling 3D background');
      isWebGLSupported = false;
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0xff00ff, 1.5);
    light1.position.set(150, 150, 150);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x00d9ff, 1.2);
    light2.position.set(-150, -150, 100);
    scene.add(light2);

    createGeometries();
    createParticles();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onWindowResize);

    animate();
  }

  function createGeometries() {
    const colors = [0xff00ff, 0x00d9ff, 0xffd700];
    const geometryDefs = [
      new THREE.BoxGeometry(20, 20, 20),
      new THREE.SphereGeometry(16, 16, 16),
      new THREE.ConeGeometry(16, 25, 16),
      new THREE.OctahedronGeometry(16),
      new THREE.TorusGeometry(12, 4, 8, 50),
      new THREE.IcosahedronGeometry(14),
      new THREE.TetrahedronGeometry(20),
      new THREE.DodecahedronGeometry(12),
      new THREE.CylinderGeometry(10, 10, 25, 16),
      new THREE.ConeGeometry(12, 20, 12),
    ];

    const positions = [
      { x: -100, y: 60, z: -80 },
      { x: 100, y: -60, z: 80 },
      { x: 70, y: 40, z: 100 },
      { x: -70, y: -40, z: -100 },
      { x: 0, y: 100, z: 0 },
      { x: 80, y: 0, z: -80 },
      { x: -80, y: 0, z: 80 },
      { x: 0, y: -100, z: 0 },
      { x: 60, y: 80, z: 60 },
      { x: -60, y: -80, z: -60 },
    ];

    positions.forEach((pos, i) => {
      const geometry = geometryDefs[i % geometryDefs.length];
      const color = colors[i % colors.length];

      const material = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        shininess: 80,
        side: THREE.DoubleSide,
        wireframe: false,
        fog: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      scene.add(mesh);

      objects.push({
        mesh,
        rotX: (Math.random() - 0.5) * 0.004,
        rotY: (Math.random() - 0.5) * 0.004,
        rotZ: (Math.random() - 0.5) * 0.004,
        origX: pos.x,
        origY: pos.y,
        origZ: pos.z,
      });
    });
  }

  function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 300;
      positions[i + 1] = (Math.random() - 0.5) * 300;
      positions[i + 2] = (Math.random() - 0.5) * 300;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff00ff,
      size: 1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
      fog: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    objects.push({
      mesh: particles,
      rotX: 0.0001,
      rotY: 0.0002,
      rotZ: 0.00015,
      origX: 0,
      origY: 0,
      origZ: 0,
    });
  }

  function onMouseMove(e) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  }

  function onWindowResize() {
    if (!isWebGLSupported) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    if (!isWebGLSupported) return;

    animationId = requestAnimationFrame(animate);

    objects.forEach((obj) => {
      obj.mesh.rotation.x += obj.rotX;
      obj.mesh.rotation.y += obj.rotY;
      obj.mesh.rotation.z += obj.rotZ;

      obj.mesh.position.x = obj.origX + (mouseX - 0.5) * 50;
      obj.mesh.position.y = obj.origY + (mouseY - 0.5) * 50;
    });

    renderer.render(scene, camera);
  }

  window.addEventListener('load', init);

  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
  });
})();
    scene.add(particles);

    objects.push({
      mesh: particles,
      isParticles: true,
      velocityX: (Math.random() - 0.5) * 0.02,
      velocityY: (Math.random() - 0.5) * 0.02,
      velocityZ: (Math.random() - 0.5) * 0.02,
    });
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    objects.forEach((obj) => {
      if (obj.isParticles) {
        const positions = obj.mesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += obj.velocityX;
          positions[i + 1] += obj.velocityY;
          positions[i + 2] += obj.velocityZ;

          if (positions[i] > 150) positions[i] = -150;
          if (positions[i] < -150) positions[i] = 150;
          if (positions[i + 1] > 150) positions[i + 1] = -150;
          if (positions[i + 1] < -150) positions[i + 1] = 150;
          if (positions[i + 2] > 150) positions[i + 2] = -150;
          if (positions[i + 2] < -150) positions[i + 2] = 150;
        }
        obj.mesh.geometry.attributes.position.needsUpdate = true;
      } else {
        obj.mesh.rotation.x += obj.rotX;
        obj.mesh.rotation.y += obj.rotY;
        obj.mesh.rotation.z += obj.rotZ;

        obj.mesh.position.x = obj.origX + mouseX * 30;
        obj.mesh.position.y = obj.origY + mouseY * 30;
      }
    });

    camera.position.x = mouseX * 20;
    camera.position.y = mouseY * 20;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
