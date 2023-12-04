import * as THREE from '../node_modules/three/build/three.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import GUI from 'lil-gui'

/**
 * THREE.JS
 */

THREE.ColorManagement.enabled = false
const gui = new GUI()

/**
 * Textures
 */

/**
 * Loaders
 */
const fbxLoader = new FBXLoader()

/**
 * Base
*/
// Canvas
const webglCanvas = document.getElementById('webgl')
const htmlDiv = document.querySelector('#html')

// Scene
const scene = new THREE.Scene()

// Div positioning
const divPosition = {
  position: new THREE.Vector3(0, 1.14, -.65),
  element: htmlDiv
}

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
      child.castShadow = true
      child.receiveShadow = true
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

const wallBack = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0,
    roughness: 1
  })
)
wallBack.position.set(0, 5, -5)

const wallLeft = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0,
    roughness: 1
  })
)
wallLeft.rotation.y = Math.PI * .5
wallLeft.position.set(-5, 5, 0)

const wallRight = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0,
    roughness: 1
  })
)
wallRight.rotation.y = -Math.PI * .5
wallRight.position.set(5, 5, 0)

scene.add(floor, wallBack, wallLeft, wallRight)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 4)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)

directionalLight.position.set(-10, 20, 10)
directionalLight.castShadow = true
directionalLight.shadow.camera.top = 3
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

  console.log(sizes.height / sizes.width)

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}, { passive: true })

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 30)
camera.position.set(1, 0, 2)

gui.add(camera.position, 'z').min(-5).max(20).step(.01).name('Camera Z')
gui.add(camera.position, 'y').min(-5).max(20).step(.01).name('Camera Y')

const cursor = {
  x: 0,
  y: 0
}

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = - (event.clientY / sizes.height - 0.5)
}, { passive: true })

window.addEventListener('touchmove', (event) => {
  cursor.x = event.touches[0].clientX / sizes.width - 0.5
  cursor.y = - (event.touches[0].clientY / sizes.height - 0.5)
}, { passive: true })

// Controls
// const controls = new OrbitControls(camera, webglCanvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: webglCanvas,
  // antialias: true,
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

const lookAt = {
  x: 0,
  y: 1.14,
  z: -1
}


function tick() {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  // controls.update()

  // Update html div position
  const screenPosition = divPosition.position.clone()
  screenPosition.project(camera)
  console.log(screenPosition.z)

  const translateX = screenPosition.x * sizes.width * 0.5
  const translateY = - screenPosition.y * sizes.height * 0.5
  const translateZ = screenPosition.z * sizes.height * 0.001
  divPosition.element.style.transform = `
    translate(-50%, -50%)
    translateX(${translateX}px)
    translateY(${translateY}px)
    scale(${translateZ * .15})
  `

  // Update camera
  camera.position.x = (cursor.x * .1)
  camera.position.y = (cursor.y * .1) + 1.2
  // camera.position.z = Math.sin(elapsedTime) + 1.3
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z)


  // calculate the matrix projection and view matrix
  // const viewMatrix = camera.matrixWorldInverse
  // viewMatrix.elements[8] *= -1 // invert the third column of the view matrix (for z axis)
  // viewMatrix.elements[1] *= -1 // invert the second column of the view matrix (for y axis)

  // htmlDiv.style.transform += ` matrix3d(${viewMatrix.elements.join(',')})`

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()