import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

let model: mobilenet.MobileNet | null = null;

/**
 * Cosine Similarity
 */
function cosineSimilarity(a: tf.Tensor, b: tf.Tensor): number {
  return tf.tidy(() => {
    const dot = a.mul(b).sum();
    const normA = a.norm();
    const normB = b.norm();
    const result = dot.div(normA.mul(normB));
    return result.dataSync()[0];
  });
}

/**
 * Worker 訊息處理
 */
self.onmessage = async (event: MessageEvent) => {
  const { type, data } = event.data;

  try {
    if (type === 'LOAD_MODEL') {
      if (model) {
        self.postMessage({ type: 'MODEL_LOADED', success: true });
        return;
      }

      await tf.ready();
      model = await mobilenet.load({ version: 2, alpha: 1.0 });
      self.postMessage({ type: 'MODEL_LOADED', success: true });
    } else if (type === 'COMPUTE_SIMILARITY') {
      if (!model) {
        throw new Error('Model not loaded');
      }

      const { playerImageData, pokemonImageData } = data;

      // 從 Uint8Array 重建 ImageData
      const playerData = new ImageData(
        new Uint8ClampedArray(playerImageData.data),
        playerImageData.width,
        playerImageData.height,
      );
      const pokemonData = new ImageData(
        new Uint8ClampedArray(pokemonImageData.data),
        pokemonImageData.width,
        pokemonImageData.height,
      );

      // 提取特徵
      const embPlayer = model.infer(playerData, true) as tf.Tensor;
      const embPokemon = model.infer(pokemonData, true) as tf.Tensor;

      // 計算 Cosine Similarity
      const similarity = cosineSimilarity(embPlayer, embPokemon);

      // 清理記憶體
      embPlayer.dispose();
      embPokemon.dispose();

      self.postMessage({
        type: 'SIMILARITY_COMPUTED',
        similarity: Math.max(0, Math.min(1, similarity)),
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
