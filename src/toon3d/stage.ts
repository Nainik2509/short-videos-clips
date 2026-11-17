// The sky and the light of a 3D short: gradient sky dome, clouds, fog, one shadow-casting sun placed relative to
// the camera (frozen per shot), and the two-tone / card uniforms from LIGHTS. Call update() once per frame.
import * as THREE from "three";
import {NOINK} from "./ink";
import {LIGHTS, LOOK, LightName} from "./lights";
import {cloudHD} from "./paint";
import {CHAR, TONE, untone} from "./shade";
import type {V3} from "./camera";

const CLOUD_COUNT = 9;

/** Light name -> the grade preset that matches it (grade.ts only knows day and golden). */
export const gradeOf = (light: LightName): "day" | "golden" => (light === "golden" ? "golden" : "day");

/** Direction toward the sun for a camera: rotated `az` degrees from the view direction toward screen right, lifted by `el`. */
export const sunDirection = (pos: V3, look: V3, light: LightName): THREE.Vector3 => {
  const L = LIGHTS[light];
  let fx = look[0] - pos[0];
  let fz = look[2] - pos[2];
  const n = Math.hypot(fx, fz) || 1;
  fx /= n;
  fz /= n;
  const az = THREE.MathUtils.degToRad(L.az);
  const el = THREE.MathUtils.degToRad(L.el);
  const hx = fx * Math.cos(az) - fz * Math.sin(az);
  const hz = fz * Math.cos(az) + fx * Math.sin(az);
  return new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
};

export class ToonStage {
  readonly root = new THREE.Group();
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private sky: THREE.Mesh;
  private skyUniforms: Record<string, THREE.IUniform>;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private clouds: THREE.Mesh[] = [];
  private cloudMaps: Record<LightName, THREE.Texture[]>;

  constructor() {
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        c0: {value: new THREE.Color()}, c1: {value: new THREE.Color()}, c2: {value: new THREE.Color()},
        c3: {value: new THREE.Color()}, c4: {value: new THREE.Color()}, e: {value: new THREE.Vector4()},
      },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.skyUniforms = skyMat.uniforms;
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), skyMat);
    this.sky.renderOrder = -1;
    this.sky.frustumCulled = false;
    this.sky.layers.set(NOINK);

    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    this.root.add(this.sky, this.hemi, this.sun, this.sun.target);

    const maps = (name: LightName) => [0, 1, 2, 3].map((k) => cloudHD(k, LOOK[name].cloud));
    this.cloudMaps = {day: maps("day"), golden: maps("golden"), warm: maps("warm"), cool: maps("cool")};
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const a = (i / CLOUD_COUNT) * Math.PI * 2 + 0.3;
      const d = 620 + (i % 3) * 60;
      const w = 130 + (i % 4) * 30;
      const cloud = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false}),
      );
      cloud.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d);
      cloud.scale.set(w, w / 2, 1);
      cloud.layers.set(NOINK);
      this.clouds.push(cloud);
      this.root.add(cloud);
    }
  }

  /** Pose sky, clouds, fog and light for this frame. `focus` is the look point, used to fit the shadow map. */
  update(light: LightName, cam: THREE.PerspectiveCamera, scene: THREE.Scene, focus: THREE.Vector3, sunDir: THREE.Vector3) {
    const L = LIGHTS[light];
    const K = LOOK[light];
    cam.layers.enable(NOINK); // sky, clouds and cards live on the no-ink layer but are still rendered

    this.hemi.color.set(L.sky);
    this.hemi.groundColor.set(L.ground);
    this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol);
    this.sun.intensity = L.sunI;
    const dist = cam.position.distanceTo(focus);
    const radius = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220);
    this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -radius; sc.right = radius; sc.top = radius; sc.bottom = -radius; sc.near = 20; sc.far = 480;
    sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias;
    this.sun.shadow.normalBias = L.normalBias * (radius / 12);

    TONE.uLitCol.value.set(...L.lit);
    TONE.uShadeCol.value.set(...L.shade);
    TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert;
    TONE.uSideK.value = L.sideK;
    TONE.uTerm.value = L.term;
    TONE.uBounce.value.set(...K.bounce);
    TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint);
    CHAR.uCharShade.value = L.charShade;
    CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad;
    CHAR.uSideTint.value.set(...L.sideTint);

    // sky: 5 colour stops by elevation, written as tone-map-inverted linear values
    K.sky.c.forEach((hex, i) => untone(hex, this.skyUniforms["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    this.skyUniforms.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color);
    this.fog.near = L.fogNear;
    this.fog.far = L.fogFar;
    scene.fog = this.fog;
    scene.background = null;
    this.clouds.forEach((cloud, i) => {
      cloud.lookAt(cam.position.x, cloud.position.y, cam.position.z);
      (cloud.material as THREE.MeshBasicMaterial).map = this.cloudMaps[light][i % 4];
    });
  }
}
