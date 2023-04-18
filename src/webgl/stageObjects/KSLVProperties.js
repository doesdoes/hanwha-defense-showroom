import * as THREE from 'three'

export const PROPERTIES = {
  scale: new THREE.Vector3(1, 1, 1),
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  texturesQuality: "medium"
}

export const MATERIALS = {
  "KSLV_II_s": {
    "sRGBmode": true,
    "type": new THREE.MeshPhysicalMaterial(),
    "map": "KSLV_II_D.jpg",
    "aoMap": "KSLV_II_AO.jpg",
    "roughnessMap": "KSLV_II_R.jpg",
    "roughness": 0.5,
    "metalnessMap": "KSLV_II_M.jpg",
    "metalness": 1,
    "normalMap": "KSLV_II_N.jpg",
    "envMapIntensity": 1,
    "flipY": false,
  },
  "KSLV_II_Insaid_s": {
    "sRGBmode": true,
    "type": new THREE.MeshPhysicalMaterial(),
    "roughness": 0.25,
    "metalness": 1,
    "envMapIntensity": 1,
    "flipY": false,
  }
}