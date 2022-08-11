import * as THREE from 'three'

export const PROPERTIES = {
  scale: new THREE.Vector3(10.5, 10.5, 10.5),
  position: new THREE.Vector3(0, -1.0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  texturesQuality: "medium"
}

export const MATERIALS = {
  "TANK_K9A1_Head_s": {
    "type": new THREE.MeshPhongMaterial(),
    "color": new THREE.Color("rgb(255,255,255)"),
    "specular": new THREE.Color("rgb(74,74,74)"),
    "map": "TANK_K9A1_Head_CAMO.jpg",
    "specularMap": "TANK_K9A1_Head_CAMO_Spec.jpg",
    "emissiveMap": "TANK_K9A1_Head_CAMO.jpg",
    "normalMap": "TANK_K9A1_Head_H_N_1k.jpg",
    "flipY": false,
    "shininess": 10,
    "reflectivity": 1.0,
    // "roughness": 1.0,
    // "metalness": 0.0,
    // "clearcoat": 1.0,
    // "clearcoatRoughness": 0.4,
  },
  "TANK_K9A1_Body_s": {
    "type": new THREE.MeshPhongMaterial(),
    "color": new THREE.Color("rgb(255,255,255)"),
    "specular": new THREE.Color("rgb(74,74,74)"),
    "map": "TANK_K9A1_Body_CAMO.jpg",
    "specularMap": "TANK_K9A1_Body_CAMO_Spec.jpg",
    "emissiveMap": "TANK_K9A1_Body_CAMO.jpg",
    "normalMap": "TANK_K9A1_Body_H_N_2k.jpg",
    "flipY": false,
    "shininess": 10,
    "reflectivity": 1.0,
    // "roughness": 1.0,
    // "metalness": 0.0,
    // "reflectivity": 0.5,
    // "clearcoat": 1.0,
    // "clearcoatRoughness": 0.4,
  },
  "TANK_K9A1_Track_s": {
    "type": new THREE.MeshPhongMaterial(),
    "color": new THREE.Color("rgb(255,255,255)"),
    "specular": new THREE.Color("rgb(255,255,255)"),
    "map": "TANK_K9A1_TrackWheel.jpg",
    "specularMap": "TANK_K9A1_TrackWheel_Spec.jpg",
    "emissiveMap": "TANK_K9A1_TrackWheel.jpg",
    "normalMap": "TANK_K9A1_TrackWheel_N.jpg",
    "flipY": false,
    "shininess": 10,
    "reflectivity": 1.0,
    // "roughness": 1.0,
    // "metalness": 0.0,
    // "reflectivity": 0.5,
    // "clearcoat": 1.0,
    // "clearcoatRoughness": 0.4,
    "side": THREE.DoubleSide,
    "mapTiling":{
      repeatX: 1,
      repeatY: 1,
    },
  },
  "TANK_K9A1_Track_UVAni_s": {
    "type": new THREE.MeshPhongMaterial(),
    "color": new THREE.Color("rgb(255,255,255)"),
    "map": "TANK_K9A1_TrackWheel.jpg",
    "specularMap": "TANK_K9A1_TrackWheel_Spec.jpg",
    "emissiveMap": "TANK_K9A1_TrackWheel.jpg",
    "normalMap": "TANK_K9A1_TrackWheel_N.jpg",
    "flipY": false,
    "shininess": 10,
    "reflectivity": 1.0,
    // "roughness": 1.0,
    // "metalness": 0.0,
    // "reflectivity": 0.5,
    // "clearcoat": 1.0,
    // "clearcoatRoughness": 0.4,
    "side": THREE.DoubleSide,
    "mapTiling":{
      repeatX: 1,
      repeatY: 1,
    },
  },
  "BG_Snow_Floor_TankShadow_s": {
    "type": new THREE.MeshPhysicalMaterial(),
    "color": new THREE.Color("rgb(15,23,40)"),
    "alphaMap": "BG_Snow_Floor_TankShadow_A.jpg",
    "transparent": true,
    "opacity": 0.4,
  },
  "BG_Snow_TrackSkid_s": {
    "type": new THREE.MeshPhysicalMaterial(),
    "color": new THREE.Color("rgb(255,255,255)"),
    "alphaMap": "TrackSkid_A.jpg",
    "transparent": true,
    "opacity": 0.4,
    "alphaMapTiling":{
      repeatX: 1,
      repeatY: 1,
    }
  },
  "BG_Snow_Dust_SeqAni_s": {
    "type": new THREE.MeshStandardMaterial(),
    "color": new THREE.Color("rgb(255,255,255)"),
    "alphaMap": "dirt_spritesheet_horizon.png",
    "transparent": true,
    "side": THREE.DoubleSide,
    "depthWrite": false,
  },
} 