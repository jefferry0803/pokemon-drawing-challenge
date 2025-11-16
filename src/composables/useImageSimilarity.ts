import { ref, toRaw } from 'vue';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

export function useImageSimilarity() {
  const model = ref<mobilenet.MobileNet | null>(null);
  const isLoadingModel = ref(false);
  const similarity = ref<number | null>(null);

  /** 載入 MobileNet 模型 */
  const loadModel = async () => {
    if (model.value || isLoadingModel.value) return;

    isLoadingModel.value = true;
    model.value = await mobilenet.load({ version: 2, alpha: 1.0 });
    isLoadingModel.value = false;
  };

  /** 載入圖片（HTMLImageElement） */
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.error('❌ loadImage failed:', err, 'src:', src);
        reject(new Error('Failed to load image: ' + src));
      };
      img.src = src;
    });
  };

  /** Cosine Similarity */
  const cosineSimilarity = (a: tf.Tensor, b: tf.Tensor) => {
    console.log('a.shape', a.shape);
    console.log('b.shape', b.shape);
    return tf.tidy(() => {
      const dot = a.mul(b).sum();
      const normA = a.norm();
      const normB = b.norm();
      return dot.div(normA.mul(normB));
    });
  };

  /**
   * 計算相似度（0–1）
   * @param playerCanvas - 玩家畫布 (HTMLCanvasElement)
   * @param pokemonImageUrl - 官方寶可夢圖片 URL
   */
  const computeSimilarity = async (
    playerCanvas: HTMLCanvasElement,
    pokemonImageUrl: string,
  ) => {
    if (!model.value) await loadModel();

    if (!model.value) {
      console.error('MobileNet model not loaded');
      return null;
    }
    let rawModel = toRaw(model.value);

    // 1. 玩家畫的圖（canvas）
    const embPlayer = rawModel.infer(playerCanvas, true) as tf.Tensor;
    console.log('embPlayer', embPlayer);

    // 2. 官方圖片
    const pokemonImg = await loadImage(pokemonImageUrl);
    console.log('pokemonImg', pokemonImg);
    const embPokemon = rawModel.infer(pokemonImg, true) as tf.Tensor;
    console.log('embPokemon', embPokemon);

    // 3. Cosine similarity
    const simTensor = cosineSimilarity(embPlayer, embPokemon);
    console.log('simTensor', simTensor);
    const simValue = (await simTensor.data())[0];
    console.log('simValue', simValue);

    // 清理記憶體
    embPlayer.dispose();
    embPokemon.dispose();
    simTensor.dispose();

    similarity.value = simValue;
    return simValue;
  };

  return {
    model,
    isLoadingModel,
    similarity,
    loadModel,
    computeSimilarity,
  };
}
