import { ref } from 'vue';

export function useImageSimilarity() {
  const similarity = ref<number | null>(null);
  let modelWorker: Worker | null = null;

  /** 在 Worker 中預載模型（真正的背景載入，完全不阻塞主線程） */
  const preloadModel = () => {
    if (modelWorker) return; // Worker 已建立

    // 建立 Worker
    modelWorker = new Worker(
      new URL('../workers/modelLoader.ts', import.meta.url),
      { type: 'module' },
    );

    // 監聽 Worker 訊息
    modelWorker.onmessage = (event: MessageEvent) => {
      const { type, error } = event.data;

      if (type === 'MODEL_LOADED') {
        console.log('✅ Model loaded in Worker (background thread)');
      } else if (type === 'ERROR') {
        console.error('❌ Worker error:', error);
      }
    };

    modelWorker.onerror = (error: ErrorEvent) => {
      console.error('❌ Worker error:', error.message);
    };

    // 開始在 Worker 中載入
    modelWorker.postMessage({ type: 'LOAD_MODEL' });
  };

  /** 載入圖片（HTMLImageElement）並支援 CORS */
  const loadImage = (
    src: string,
    timeout = 10000,
  ): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const timer = setTimeout(() => {
        reject(new Error(`Image loading timeout (${timeout}ms): ${src}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timer);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  };

  /**
   * 計算相似度（0–1）
   * 在 Worker 中進行計算
   * @param playerCanvas - 玩家畫布 (HTMLCanvasElement)
   * @param pokemonImageUrl - 官方寶可夢圖片 URL
   * @returns 相似度分數 (0-1) 或 null（失敗時）
   */
  const computeSimilarity = async (
    playerCanvas: HTMLCanvasElement,
    pokemonImageUrl: string,
  ): Promise<number | null> => {
    try {
      if (!modelWorker) {
        console.error('❌ Worker not initialized');
        return null;
      }

      // 取得玩家畫布的圖像資料
      const ctx = playerCanvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Failed to get canvas context');
        return null;
      }

      const playerImageData = ctx.getImageData(
        0,
        0,
        playerCanvas.width,
        playerCanvas.height,
      );

      // 載入官方寶可夢圖片
      const pokemonImg = await loadImage(pokemonImageUrl);
      const pokemonCanvas = document.createElement('canvas');
      pokemonCanvas.width = pokemonImg.width;
      pokemonCanvas.height = pokemonImg.height;
      const pokemonCtx = pokemonCanvas.getContext('2d');
      if (!pokemonCtx) {
        console.error('❌ Failed to get pokemon canvas context');
        return null;
      }

      pokemonCtx.drawImage(pokemonImg, 0, 0);
      const pokemonImageData = pokemonCtx.getImageData(
        0,
        0,
        pokemonCanvas.width,
        pokemonCanvas.height,
      );

      // 傳送給 Worker 計算
      return new Promise((resolve) => {
        const messageHandler = (event: MessageEvent) => {
          const { type, similarity: sim, error } = event.data;

          if (type === 'SIMILARITY_COMPUTED') {
            similarity.value = sim;
            modelWorker?.removeEventListener('message', messageHandler);
            resolve(sim);
          } else if (type === 'ERROR') {
            console.error('❌ Worker error:', error);
            modelWorker?.removeEventListener('message', messageHandler);
            resolve(null);
          }
        };

        modelWorker!.addEventListener('message', messageHandler);
        modelWorker!.postMessage({
          type: 'COMPUTE_SIMILARITY',
          data: {
            playerImageData: {
              data: Array.from(playerImageData.data),
              width: playerImageData.width,
              height: playerImageData.height,
            },
            pokemonImageData: {
              data: Array.from(pokemonImageData.data),
              width: pokemonImageData.width,
              height: pokemonImageData.height,
            },
          },
        });
      });
    } catch (error) {
      console.error('❌ computeSimilarity error:', error);
      similarity.value = null;
      return null;
    }
  };

  return {
    similarity,
    preloadModel,
    computeSimilarity,
  };
}
