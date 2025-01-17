import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import TWEEN from '@tweenjs/tween.js'
import { Webgl } from './class/Webgl.js'
import * as SCENE from './scene.js'
import * as LOADER from './loader.js'
import { STATE, ASSETS } from './global.js'
import data from './data'
import { setCondition, setIndicator } from '../indicator'
import { setHemisphereLightSnowDefault, setHemisphereLightDesertDefault } from './light.js'
import { parallax } from './camera.js'
import { registerEvents } from './interactions.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js'
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js'

window.isAnim
window._WEBGL = (function() {
  /**
   * Create WEBGL context object
   *
   * @param {string} parentContainerClass class of the wrapper container
   * @param {string} _containerId id of the container holding the webgl scene
   * @param {boolean} _debug enable / disable debug
   * @param {boolean} _isMobile set target device
   */
  function createContext(_parentContainerClass, _containerId, _debug, _isMobile = false) {
    let host = window.location.host

    switch (host) {
      case 'dev.does.kr':
        STATE.ASSET_DOMAIN_PATH = `https://${host}/2022/showroom/assets`
        break
      case '121.162.20.78:1116':
      case '192.168.79.1:1116':
      case '192.168.79.9:1116':
      case 'localhost:1116':
      case 'localhost:3030':
      case 'localhost:3000':
      case '0.0.0.0:1116':
      case 'localhost:3030':
        STATE.ASSET_DOMAIN_PATH = `/assets/webgl`
        break
      default:
        STATE.ASSET_DOMAIN_PATH = `https://${host}/assets/webgl`
        break
    }
   
    STATE.DRACO_LOADER = new DRACOLoader()
    STATE.DRACO_LOADER.setDecoderPath( `${STATE.ASSET_DOMAIN_PATH}/draco/` )

    STATE.IS_MOBILE = _isMobile
    STATE.WEBGL = new Webgl({
      parentContainerClass: _parentContainerClass,
      container: document.getElementById(_containerId),
      sceneOptions: { backgroundColor: 0xd1e4f0 },
      // k9a1 기준
      cameraOptions: { fov: 45, near: 1, far: 1000000, x: 4.15, y: -0.01, z: 2.0 },
      isDebug: _debug
    })

    // mouse event listeners
    registerEvents()

    //start webgl render loop
    render()

    // for performance debugging
    if(STATE.WEBGL.isDebug){
      document.addEventListener( 'keyup', (event) => {
        if ( event.key == 'i' ){
          console.table( STATE.WEBGL.renderer.info.memory )
          console.table( STATE.WEBGL.renderer.info.render )
          console.log( STATE.WEBGL.scene )
        }
        if ( event.key == 'r' ) STATE.ENABLE_RENDERING ? toggleRendering( false ) : toggleRendering( true )

        if ( event.key == '1' ) {
          SCENE.toggleStages(true, 'k9a1IndoorBg')
          SCENE.toggleStages(false, 'snowBg')
        }
        if ( event.key == '2' ) {
          SCENE.toggleStages(true, 'snowBg')
          SCENE.toggleStages(false, 'k9a1IndoorBg')
        }

        if ( event.key == 'c' ) {
          console.log(STATE.WEBGL.camera.position, STATE.WEBGL.camera)
          console.log(`azimuth angle: ${STATE.WEBGL.cameraControls.azimuthAngle}, polar angle: ${STATE.WEBGL.cameraControls.polarAngle}`)
        }

        if ( event.key == 'q' ) {
          SCENE.focusOnRegion('reset')
        }

      }, false)
    }

    setCondition()
    setIndicator()
    // [NOTE] FOR SOBEL EFFECT
    // setComposer()

    if(STATE.WEBGL.isDebug) console.log(`WEBGL: context created!!`)
  }

  /**
   * Set EffectComposer for Post Processing
   *
   */
  function setComposer() {
    STATE.WEBGL.sobelComposer = new EffectComposer( STATE.WEBGL.renderer );
    STATE.WEBGL.finalComposer = new EffectComposer( STATE.WEBGL.renderer );
  
    STATE.WEBGL.sobelComposer.renderToScreen = false;
  
    // base model
    const renderScene = new RenderPass( STATE.WEBGL.scene, STATE.WEBGL.camera );
    STATE.WEBGL.sobelComposer.addPass( renderScene );
  
    STATE.WEBGL.sobelRenderPass = new RenderPass( STATE.ZONE_FOCUS['reset'].sobelObj, STATE.WEBGL.camera );
    STATE.WEBGL.sobelComposer.addPass( STATE.WEBGL.sobelRenderPass );
  
    // color to grayscale conversion
    const effectGrayScale = new ShaderPass( LuminosityShader );
    STATE.WEBGL.sobelComposer.addPass( effectGrayScale );
  
    // Sobel operator
    const effectSobel = new ShaderPass( SobelOperatorShader );
    effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
    STATE.WEBGL.sobelComposer.addPass( effectSobel );
  
    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          sobelTexture: { value: STATE.WEBGL.sobelComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        defines: {}
      }), 'baseTexture'
    )
    // finalPass.needsSwap = true;
  
    STATE.WEBGL.finalComposer.addPass( renderScene );
    STATE.WEBGL.finalComposer.addPass( finalPass );
  }

  /**
   * Load WEBGL assets
   *
   * @param {string} sceneName name of the scene to load
   * @return {callback} return a callback when all assets are loaded
   */
  function loadAssets(_sceneName, _callback) {
    const LOADING_MANAGER = new THREE.LoadingManager()
    LOADING_MANAGER.onProgress = ( url, itemsLoaded, itemsTotal ) => { if(STATE.WEBGL.isDebug) console.log( `%cLoading file: ${url} (${itemsLoaded}/${itemsTotal})`,'color:#787878;') }
    LOADING_MANAGER.onError = url => console.log('There was an error loading '+url)

    switch (_sceneName) {
      case 'K9A1':
        LOADER.loadGLTF(LOADING_MANAGER, ASSETS.K9A1.MODEL_FILES, STATE.ASSET_DOMAIN_PATH, STATE.DRACO_LOADER)
        break
      case 'REDBACK':
        LOADER.loadGLTF(LOADING_MANAGER, ASSETS.REDBACK.MODEL_FILES, STATE.ASSET_DOMAIN_PATH, STATE.DRACO_LOADER)
        break
      case 'KSLV':
        LOADER.loadGLTF(LOADING_MANAGER, ASSETS.KSLV.MODEL_FILES, STATE.ASSET_DOMAIN_PATH, STATE.DRACO_LOADER)
        LOADER.loadHDR(LOADING_MANAGER, ASSETS.KSLV.HDR_FILES, STATE.ASSET_DOMAIN_PATH, STATE.DRACO_LOADER)
        break
    }

    LOADING_MANAGER.onLoad = function () {
      if(STATE.WEBGL.isDebug) console.log(`WEBGL: assets for %c${_sceneName} %cloaded!`,'color:#3c6bef;','color:#unherit;')
      return _callback()
    }
  }

  /**
   * Init stage scene
   *
   * @param {string} sceneName name of the scene to load
   * @return {void}
   */
  function initScene(_sceneName, callback) {
    if(STATE.WEBGL.isDebug) console.log(`WEBGL: scene %c${_sceneName} %cinitialized!`,'color:#3c6bef;','color:#unherit;')

    //load stage
    switch (_sceneName) {
      case 'K9A1':
        SCENE.loadStage('K9A1', callback)
        break
      case 'REDBACK':
        SCENE.loadStage('REDBACK', callback)
        break
      case 'KSLV':
        SCENE.loadStage('KSLV', callback)
        break
    }
  }

  /**
   * Toggle stage scene
   *
   * @param {string} sceneName name of the scene to toggle
   * @param {boolean} toggle enable / disable scene visibility
   * @return {void}
   */
  function toggleScene(_sceneName, _toggle) {
    if(STATE.WEBGL.isDebug) console.log(`WEBGL: scene %c${_sceneName} %cvisibility: ${_toggle}!`,'color:#3c6bef;','color:#unherit;')

    if( _toggle ) STATE.CURRENT_SCENE.NAME = _sceneName
    const md = new MobileDetect(window.navigator.userAgent)
    const isMobile = md.mobile()
    
    const $condition = document.getElementById('change-condition')
    const $parts = document.querySelectorAll('.indicator-panel .part')    

    const snowSeqAni = STATE.WEBGL.scene.getObjectByName("BG_Snow_Dust_SEQAni", true)
    const snowTrackSkid = STATE.WEBGL.scene.getObjectByName("BG_Snow_TrackSkid_UVAni", true)
    const desertSeqAni = STATE.WEBGL.scene.getObjectByName("BG_Desert_Dust_SEQAni", true)
    const desertTrackSkid = STATE.WEBGL.scene.getObjectByName("BG_Desert_TrackSkid_SEQAni", true)

    if(_sceneName === "K9A1") {
      SCENE.toggleStages(_toggle, 'k9Tank')
      SCENE.toggleStages(_toggle, 'k9a1IndoorBg')
      SCENE.toggleStages(false, 'snowBg')

      $condition.style.display = 'inline-flex'
      $condition.setAttribute('data-item', 'k9a1IndoorBg')
      Array.from($parts).map((part, idx) => {
        const $txt = part.querySelector('.txt')
        const partData = data['k9a1-indicators'][idx]
        $txt.textContent = partData.title
        part.setAttribute('data-feature', partData.id)
      })

      if(_toggle) {
        STATE.ZONE_FOCUS.reset.position = isMobile ? STATE.ZONE_FOCUS.k9a1Origin.positionM : STATE.ZONE_FOCUS.k9a1Origin.position
        STATE.ZONE_FOCUS.reset.minAzimuth = STATE.ZONE_FOCUS.k9a1Origin.minAzimuth
        STATE.ZONE_FOCUS.reset.maxAzimuth = STATE.ZONE_FOCUS.k9a1Origin.maxAzimuth
        SCENE.focusOnRegion('reset', false)

        window.isAnim = false
        setHemisphereLightSnowDefault(STATE)
        snowSeqAni.visible = false
        snowTrackSkid.visible = false
        STATE.ANIMATIONS._k9Tank.mixer.stopAllAction()
        // STATE.ANIMATIONS._SNOW.mixer.stopAllAction()
      }
    } else if(_sceneName === "REDBACK") {
      SCENE.toggleStages(_toggle, 'redback')
      SCENE.toggleStages(_toggle, 'redbackIndoorBg')
      SCENE.toggleStages(false, 'desertBg')

      $condition.style.display = 'inline-flex'
      $condition.setAttribute('data-item', 'redbackIndoorBg')
      Array.from($parts).map((part, idx) => {
        const $txt = part.querySelector('.txt')
        const partData = data['redback-indicators'][idx]
        $txt.textContent = partData.title
        part.setAttribute('data-feature', partData.id)
      })
      if(_toggle) {
        STATE.ZONE_FOCUS.reset.position = isMobile ? STATE.ZONE_FOCUS.redbackOrigin.positionM : STATE.ZONE_FOCUS.redbackOrigin.position
        STATE.ZONE_FOCUS.reset.minAzimuth = STATE.ZONE_FOCUS.redbackOrigin.minAzimuth
        STATE.ZONE_FOCUS.reset.maxAzimuth = STATE.ZONE_FOCUS.redbackOrigin.maxAzimuth
        SCENE.focusOnRegion('reset', false)

        window.isAnim = false
        setHemisphereLightDesertDefault(STATE)
        desertSeqAni.visible = false
        desertTrackSkid.visible = false
        STATE.ANIMATIONS._REDBACK.mixer.stopAllAction()
        // STATE.ANIMATIONS._DESERT.mixer.stopAllAction()
      }
    } else if(_sceneName === "KSLV") {
      SCENE.toggleStages(_toggle, 'kslv')

      $condition.style.display = 'inline-flex'
      Array.from($parts).map((part, idx) => {
        const $txt = part.querySelector('.txt')
        const partData = data['kslv-indicators'][idx]
        $txt.textContent = partData.title
        part.setAttribute('data-feature', partData.id)
      })

      if(_toggle) {
        STATE.ZONE_FOCUS.reset.position = isMobile ? STATE.ZONE_FOCUS.kslvOrigin.positionM : STATE.ZONE_FOCUS.kslvOrigin.position
        STATE.ZONE_FOCUS.reset.minAzimuth = STATE.ZONE_FOCUS.kslvOrigin.minAzimuth
        STATE.ZONE_FOCUS.reset.maxAzimuth = STATE.ZONE_FOCUS.kslvOrigin.maxAzimuth
        
        SCENE.focusOnRegion('reset', false)

        window.isAnim = true
      }
    }
  }

  /**
   * Toggle webgl rendering
   *
   * @param {boolean} toggle enable / disable rendering
   * @return {void}
   */
  function toggleRendering( _toggle ) {
    if(STATE.WEBGL.isDebug) console.log(`WEBGL: %crendering ${_toggle}!`,'color:#eb8334;')
    STATE.ENABLE_RENDERING = _toggle
  }

  function render( time ) {
    requestAnimationFrame( render )

    if( !STATE.ENABLE_RENDERING ) return
    // STATE.WEBGL.cameraControls.normalizeRotations()
    STATE.WEBGL.cameraControls.update( STATE.WEBGL.cameraClock.getDelta() )
    if(STATE.WEBGL.parallax) parallax( time )

    // update animation mixer
    const dTime = STATE.WEBGL.clock.getDelta()
    for (let key in STATE.ANIMATIONS) {
      if(STATE.ANIMATIONS[key].mixer) STATE.ANIMATIONS[key].mixer.update( dTime )
    }

    if(window.isAnim) {
      // uv animations
      if (STATE.UV_ANIMATED_OBJECTS) {
        for (const key in STATE.UV_ANIMATED_OBJECTS) {
          STATE.UV_ANIMATED_OBJECTS[key].animate()
        }
      }

      // animations
      if (STATE.ANIMATED_OBJECTS) {
        for (const key in STATE.ANIMATED_OBJECTS) {
          STATE.ANIMATED_OBJECTS[key].animate()
        }
      }
    }

    TWEEN.update( time )
    STATE.WEBGL.renderer.render( STATE.WEBGL.scene, STATE.WEBGL.camera )
    
    // [NOTE] FOR SOBEL EFFECT
    // STATE.WEBGL.sobelComposer && STATE.WEBGL.sobelComposer.render()
    // STATE.WEBGL.finalComposer && STATE.WEBGL.finalComposer.render()

    STATE.WEBGL.labelRenderer.render( STATE.WEBGL.scene, STATE.WEBGL.camera )
  }

  return {
    createContext: createContext,
    loadAssets: loadAssets, // glb only
    initScene: initScene, // include texture
    toggleScene: toggleScene,
    toggleRendering: toggleRendering,
  }
})()
