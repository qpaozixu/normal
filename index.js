let renderer, scene, camera
let cameraControl, stats
let sphereLightMesh, pointLight
let rotateAngle = 0
let invert = 1

const textureLoader = new THREE.TextureLoader()
const wallTexture = textureLoader.load('./Texture/wall.png') 
const wallNormalTexture = textureLoader.load('./Texture/wallNormal.png') 

function initStats() {
  const stats = new Stats()
  stats.setMode(0)
  document.getElementById('stats').appendChild(stats.domElement)
  return stats
}

let MyLight = new function () {
  this.color = 0xffffff
  this.power = 1;
  this.distance = 100;
}()

let MyMaterial = new function () {
  this.roughness = 0.3;
  this.metalness = 0.8;
  this.transparent = false;
  this.opacity = 0.9
}()

// 畫面初始化
function init() {
  scene = new THREE.Scene()
  // 相機設定
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(30, 30, 30)
  camera.lookAt(scene.position)

  // 建立 OrbitControls
  cameraControl = new THREE.OrbitControls(camera)
  cameraControl.enableDamping = true // 啟用阻尼效果
  cameraControl.dampingFactor = 0.25 // 阻尼系數
  // cameraControl.autoRotate = true // 啟用自動旋轉

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  stats = initStats()

  // 渲染器設定
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = 2 // THREE.PCFSoftShadowMap

  // 簡單的地板
  const planeGeometry = new THREE.PlaneGeometry(60, 60)
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.set(0, -7, 0)
  plane.receiveShadow = true
  scene.add(plane)

  const wallBox = new THREE.BoxGeometry(8, 8, 2)
  const skinMat = new THREE.MeshStandardMaterial({
    map: wallTexture, // 皮膚貼圖
    normalMap: wallNormalTexture,
    side: THREE.DoubleSide,
    roughness: MyMaterial.roughness, // 粗糙度
    metalness: MyMaterial.metalness, // 金屬感
    transparent: MyMaterial.transparent, // 透明與否
    opacity: MyMaterial.opacity // 透明度
  })

  const skinNot = new THREE.MeshStandardMaterial({
    map: wallTexture, // 皮膚貼圖
    side: THREE.DoubleSide,
    roughness: MyMaterial.roughness, // 粗糙度
    metalness: MyMaterial.metalness, // 金屬感
    transparent: MyMaterial.transparent, // 透明與否
    opacity: MyMaterial.opacity // 透明度
  })

  let wall = new THREE.Mesh(wallBox, skinMat)
  let wall2 = new THREE.Mesh(wallBox, skinNot)
  wall.position.set(-6, 0, 0)
  wall2.position.set(6,0,0)
  scene.add(wall)
  scene.add(wall2)
  
  gui = new dat.GUI()
  let LightUI = gui.addFolder('Light');
  LightUI.addColor(MyLight, 'color').onChange(function (e) {
    pointLight.color = new THREE.Color(e);
});
  LightUI.add(MyLight, 'power', 0, 2).onChange(function (e) {
    pointLight.intensity = e;
});
  LightUI.add(MyLight, 'distance', 0, 100).onChange(function (e) {
    pointLight.distance = e;
});
  let MaterialUI = gui.addFolder('Material');
  MaterialUI.add(MyMaterial, 'roughness',0,1).onChange(function (e) {
    skinMat.roughness = e;
    skinNot.roughness = e;
  });
  MaterialUI.add(MyMaterial, 'metalness',0,1).onChange(function (e) {
    skinMat.metalness = e;
    skinNot.metalness = e;
  });
  MaterialUI.add(MyMaterial, 'transparent').onChange(function (e) {
    skinMat.transparent = e;
    skinNot.transparent = e;
  });
  MaterialUI.add(MyMaterial, 'opacity', 0, 1).onChange(function (e) {
    skinMat.opacity = e;
    skinNot.opacity = e;
  });
  // 設置聚光燈幫忙照亮物體
  let spotLight = new THREE.SpotLight(0xf0f0f0)
  spotLight.position.set(-10, 30, 20)
  // spotLight.castShadow = true
  scene.add(spotLight)

  // 移動點光源
  pointLight = new THREE.PointLight(MyLight.color, MyLight.power, MyLight.distance) // 顏色, 強度, 距離
  pointLight.castShadow = true // 投影
  scene.add(pointLight)

  // 小球體模擬點光源實體
  const sphereLightGeo = new THREE.SphereGeometry(0.3)
  const sphereLightMat = new THREE.MeshBasicMaterial({ color: MyLight.color })
  sphereLightMesh = new THREE.Mesh(sphereLightGeo, sphereLightMat)
  sphereLightMesh.castShadow = true
  sphereLightMesh.position.y = 0
  scene.add(sphereLightMesh)

  document.body.appendChild(renderer.domElement)
}

// 點光源繞 Y 軸旋轉動畫
function pointLightAnimation() {
  if (rotateAngle > 2 * Math.PI) {
    rotateAngle = 0 // 超過 360 度後歸零
  } else {
    rotateAngle += 0.03 // 遞增角度
  }
  
  // 光源延橢圓軌道繞 Y 軸旋轉
  sphereLightMesh.position.x = 8 * Math.cos(rotateAngle)
  sphereLightMesh.position.z = 4 * Math.sin(rotateAngle)
  // 點光源位置與球體同步
  pointLight.position.copy(sphereLightMesh.position)
}

function render() {
  stats.update()
  cameraControl.update()
  pointLightAnimation()
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

init()
render()