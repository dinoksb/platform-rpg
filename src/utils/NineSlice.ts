import Phaser from 'phaser';

const ASSET_CUT_FRAMES = {
  TL: 'TL',
  TM: 'TM',
  TR: 'TR',
  ML: 'ML',
  MM: 'MM',
  MR: 'MR',
  BL: 'BL',
  BM: 'BM',
  BR: 'BR',
} as const;
export type AssetCutFrames =
    (typeof ASSET_CUT_FRAMES)[keyof typeof ASSET_CUT_FRAMES];


const ASSET_CUT_FRAME_DATA_MANAGER_NAME = 'assetCutFrame';

interface NineSliceConfig {
  cornerCutSize: number;
  textureManager: Phaser.Textures.TextureManager;
  assetKeys: string[];
}

export class NineSlice {
  private cornerCutSize: number;

  constructor(config: NineSliceConfig) {
    this.cornerCutSize = config.cornerCutSize;
    config.assetKeys.forEach((assetKey) => {
      this.createNineSliceTextures(config.textureManager, assetKey);
    });
  }

  private createNineSliceTextures(textureManager: Phaser.Textures.TextureManager, assetKey: string): void {
    const methodName = 'createNineSliceTextures';

    const texture = textureManager.get(assetKey);
    if (texture.key === '__MISSING') {
      console.warn(`[${NineSlice.name}:${methodName}] the provided texture asset key was not found`);
      return;
    }

    const frames = texture.frames as Record<string, Phaser.Textures.Frame>;
    const baseFrame = frames['__BASE'];
    if (!baseFrame) {
      console.warn(`[${NineSlice.name}:${methodName}] the provided texture asset key does not have a base texture`);
      return;
    }

    if (texture.getFrameNames(false).length !== 0) {
      console.debug(`[${NineSlice.name}:${methodName}] the provided texture asset key already has additional frames`);
      return;
    }


    texture.add(ASSET_CUT_FRAMES.TL, 0, 0, 0, this.cornerCutSize, this.cornerCutSize);
    texture.add(
      ASSET_CUT_FRAMES.TM,
      0,
      this.cornerCutSize,
      0,
      baseFrame.width - this.cornerCutSize * 2,
      this.cornerCutSize
    );
    texture.add(
      ASSET_CUT_FRAMES.TR,
      0,
      baseFrame.width - this.cornerCutSize,
      0,
      this.cornerCutSize,
      this.cornerCutSize
    );
    texture.add(
      ASSET_CUT_FRAMES.ML,
      0,
      0,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize * 2
    );
    texture.add(
      ASSET_CUT_FRAMES.MM,
      0,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.width - this.cornerCutSize * 2,
      baseFrame.height - this.cornerCutSize * 2
    );
    texture.add(
      ASSET_CUT_FRAMES.MR,
      0,
      baseFrame.width - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize * 2
    );
    texture.add(
      ASSET_CUT_FRAMES.BL,
      0,
      0,
      baseFrame.height - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize
    );
    texture.add(
      ASSET_CUT_FRAMES.BM,
      0,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize,
      baseFrame.width - this.cornerCutSize * 2,
      this.cornerCutSize
    );
    texture.add(
      ASSET_CUT_FRAMES.BR,
      0,
      baseFrame.width - this.cornerCutSize,
      baseFrame.height - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize
    );
  }

  public createNineSliceContainer(
    scene: Phaser.Scene,
    targetWidth: number,
    targetHeight: number,
    assetKey: string
  ): Phaser.GameObjects.Container {
    const tl = scene.add.image(0, 0, assetKey, ASSET_CUT_FRAMES.TL).setOrigin(0);
    tl.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.TL);

    const tm = scene.add.image(tl.displayWidth, 0, assetKey, ASSET_CUT_FRAMES.TM).setOrigin(0);
    tm.displayWidth = targetWidth - this.cornerCutSize * 2;
    tm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.TM);

    const tr = scene.add.image(tl.displayWidth + tm.displayWidth, 0, assetKey, ASSET_CUT_FRAMES.TR).setOrigin(0);
    tr.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.TR);

    const ml = scene.add.image(0, tl.displayHeight, assetKey, ASSET_CUT_FRAMES.ML).setOrigin(0);
    ml.displayHeight = targetHeight - this.cornerCutSize * 2;
    ml.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.ML);

    const mm = scene.add.image(ml.displayWidth, ml.y, assetKey, ASSET_CUT_FRAMES.MM).setOrigin(0);
    mm.displayHeight = targetHeight - this.cornerCutSize * 2;
    mm.displayWidth = targetWidth - this.cornerCutSize * 2;
    mm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.MM);

    const mr = scene.add.image(ml.displayWidth + mm.displayWidth, ml.y, assetKey, ASSET_CUT_FRAMES.MR).setOrigin(0);
    mr.displayHeight = mm.displayHeight;
    mr.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.MR);

    const bl = scene.add.image(0, tl.displayHeight + ml.displayHeight, assetKey, ASSET_CUT_FRAMES.BL).setOrigin(0);
    bl.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.BL);

    const bm = scene.add.image(bl.displayWidth, bl.y, assetKey, ASSET_CUT_FRAMES.BM).setOrigin(0);
    bm.displayWidth = tm.displayWidth;
    bm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.BM);

    const br = scene.add.image(bl.displayWidth + bm.displayWidth, bl.y, assetKey, ASSET_CUT_FRAMES.BR).setOrigin(0);
    br.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, ASSET_CUT_FRAMES.BR);

    return scene.add.container(0, 0, [tl, tm, tr, ml, mm, mr, bl, bm, br]);
  }

  public updateNineSliceContainerTexture(
    textureManager: Phaser.Textures.TextureManager,
    container: Phaser.GameObjects.Container,
    assetKey: string
  ): void {
    const methodName = 'updateNineSliceContainerTexture';

    const texture = textureManager.get(assetKey);
    if (texture.key === '__MISSING') {
      console.warn(`[${NineSlice.name}:${methodName}] the provided texture asset key was not found`);
      return;
    }

    if (texture.getFrameNames(false).length === 0) {
      console.warn(
        `[${NineSlice.name}:${methodName}] the provided texture asset key does not have the required nine slice frames`
      );
      return;
    }

    container.each((gameObject: Phaser.GameObjects.GameObject) => {
      const phaserImageGameObject = gameObject as Phaser.GameObjects.Image;
      if (gameObject.type !== 'Image') {
        return;
      }
      const frameName = phaserImageGameObject.getData(ASSET_CUT_FRAME_DATA_MANAGER_NAME);
      if (frameName === undefined) {
        return;
      }
      phaserImageGameObject.setTexture(assetKey, frameName);
    });
  }
}
