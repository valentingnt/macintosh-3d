import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import GUI from 'lil-gui'

THREE.ColorManagement.enabled = false
const gui = new GUI()

/**
 * Textures
 */
const fbxLoader = new FBXLoader()

/**
 * Base
*/
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
*/
const pressedKeys = []

fbxLoader.load(
  '/models/macintosh/source/Mac128K.fbx',
  (object) => {
    object.scale.set(.05, .05, .05)
    object.position.set(1, 0, 1)
    object.children.map((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    document.addEventListener('keydown', (e) => {
      const key = object.children.find((child) => child.name == e.key || child.name == e.key.toUpperCase() || child.name == e.key.toLowerCase())

      if (key && !pressedKeys.includes(key)) {
        key.position.y -= .5

        pressedKeys.push(key)
      }
    }, { passive: true })

    document.addEventListener('keyup', (e) => {
      const key = object.children.find((child) => child.name == e.key || child.name == e.key.toUpperCase() || child.name == e.key.toLowerCase())

      if (key) {
        key.position.y += .5
        pressedKeys.splice(pressedKeys.indexOf(key), 1)
      }
    }, { passive: true })

    scene.add(object)
  }
)

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0,
    roughness: 1
  })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * .5

scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 4)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)

directionalLight.position.set(-10, 20, 10)
directionalLight.castShadow = true
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2
directionalLight.shadow.mapSize.set(2048, 2048)

scene.add(ambientLight, directionalLight)


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.LinearSRGBColorSpace

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()