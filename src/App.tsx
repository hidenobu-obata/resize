import { useState, useRef, ChangeEvent } from 'react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number; fileSize: number } | null>(null);
  
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [quality, setQuality] = useState<number>(0.8);
  
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);
  
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      
      const img = new Image();
      img.src = result;
      img.onload = () => {
        setOriginalSize({
          width: img.width,
          height: img.height,
          fileSize: file.size,
        });
        setWidth(img.width);
        setHeight(img.height);
        imageRef.current = img;
      };
    };
    reader.readAsDataURL(file);
    setConvertedUrl(null);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspect && originalSize && originalSize.width > 0) {
      const ratio = originalSize.height / originalSize.width;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspect && originalSize && originalSize.height > 0) {
      const ratio = originalSize.width / originalSize.height;
      setWidth(Math.round(val * ratio));
    }
  };

  const handleConvert = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(imageRef.current, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedSize(blob.size);
      },
      'image/webp',
      quality
    );
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '30px auto',
    padding: '25px',
    fontFamily: 'sans-serif',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  };

  const inputGroupStyle: React.CSSProperties = {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', padding: '20px' }}>
      <div style={containerStyle}>
        <h2 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>ブラウザ側画像リサイザー</h2>

        <div style={inputGroupStyle}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>画像をアップロード</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}
          />
        </div>

        {selectedImage && originalSize && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '13px', color: '#666', background: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
              元画像: {originalSize.width} × {originalSize.height} px （{(originalSize.fileSize / 1024).toFixed(1)} KB）
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={inputGroupStyle}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>幅 (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>高さ (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                id="aspect"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
              />
              <label htmlFor="aspect">アスペクト比を固定する</label>
            </div>

            <div style={inputGroupStyle}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>WebP画質: {Math.round(quality * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
            </div>

            <button
              onClick={handleConvert}
              style={{
                padding: '12px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              リサイズ & WebP変換する
            </button>
          </div>
        )}

        {convertedUrl && convertedSize && (
          <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#166534', fontWeight: 'bold' }}>
              変換完了！ 変換後サイズ: {(convertedSize / 1024).toFixed(1)} KB
            </p>
            <a
              href={convertedUrl}
              download={`${fileName}_resized.webp`}
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#16a34a',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              WebP画像をダウンロード
            </a>
          </div>
        )}
      </div>
    </div>
  );
}