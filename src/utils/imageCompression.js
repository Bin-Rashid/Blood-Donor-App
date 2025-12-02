// আপনার imageCompression.js ফাইলে যোগ করুন:
export const compressDonorImage = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.match('image.*')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Target size: 100KB
    const TARGET_SIZE_KB = 100;
    const TARGET_SIZE = TARGET_SIZE_KB * 1024;

    reader.onload = (e) => {
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        let quality = 0.9;

        // Reduce dimensions for large images
        if (width > 1200 || height > 1200) {
          const ratio = Math.min(1200 / width, 1200 / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], 
              file.name.replace(/\.[^/.]+$/, "") + '.jpg',
              { type: 'image/jpeg', lastModified: Date.now() }
            );

            console.log(`Compressed: ${Math.round(file.size/1024)}KB → ${Math.round(compressedFile.size/1024)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};