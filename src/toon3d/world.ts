// The whole place of a reel as one three.js scene: sky and light (ToonStage), every set, and the cards of the people
// and icons in the current shot. update() poses everything for one shot at one moment: a pure function of its inputs.
import * as THREE from "three";
import {cameraAt, type V3} from "./camera";
import {Cast, type FxPlace, type Place} from "./cards";
import {noInkFallback} from "./ink";
import {LIGHTS} from "./lights";
import {effectCard, isPinned, personCards, type Reel, type Shot} from "./reel";
import {ToonStage, sunDirection} from "./stage";

export class World {
  readonly root = new THREE.Group();
  private stage = new ToonStage();
  private cast: Cast;
  private sets: Record<string, THREE.Object3D>;
  /** sun direction per shot, fixed for the whole shot so shadows do not crawl while the camera moves */
  private suns = new Map<string, THREE.Vector3>();
  private focus = new THREE.Vector3();

  constructor(private reel: Reel) {
    this.cast = new Cast(this.root);
    this.sets = reel.sets();
    this.root.add(this.stage.root, ...Object.values(this.sets));
  }

  private sunFor(shot: Shot) {
    let sun = this.suns.get(shot.id);
    if (!sun) {
      sun = sunDirection(shot.from.pos, shot.from.look, shot.light);
      this.suns.set(shot.id, sun);
    }
    return sun;
  }

  /**
   * Pose camera, light, sets and cards. `t` = seconds into the shot, `u` = 0..1 progress of its camera move.
   * Returns the point the lens focuses on (for depth of field).
   */
  update(shot: Shot, t: number, u: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): {focus: THREE.Vector3; look: V3} {
    const c = cameraAt(shot.from, shot.to, u);
    cam.position.set(...c.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(...c.look);
    cam.rotateZ(c.roll);
    cam.fov = c.fov;
    cam.near = 0.2;
    cam.far = 1500;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    this.focus.set(...(shot.focus ?? c.look));
    this.stage.update(shot.light, cam, scene, this.focus, this.sunFor(shot));
    for (const [name, set] of Object.entries(this.sets)) set.visible = name === shot.set;

    const places: Place[] = [];
    const effects: FxPlace[] = [];
    shot.people(t).forEach((person, i) => {
      const cards = personCards(person, this.reel.looks[person.who], this.reel.groundY ?? 0, i, t, c);
      places.push(cards.place);
      effects.push(cards.blob);
    });
    for (const e of shot.effects?.(t) ?? []) {
      const card = isPinned(e) ? null : effectCard(e, t);
      if (card) effects.push(card);
    }
    this.cast.update(places, effects, cam, LIGHTS[shot.light].actorShadow);
    noInkFallback(this.root);
    return {focus: this.focus, look: c.look};
  }
}
