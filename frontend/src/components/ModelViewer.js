import '@google/model-viewer';

const ModelViewer = ({ src, alt, poster, className = '', ...rest }) => (
  <model-viewer
    src={src}
    alt={alt}
    poster={poster}
    loading="eager"
    reveal="auto"
    camera-controls
    auto-rotate
    touch-action="pan-y"
    shadow-intensity="0.6"
    className={className}
    {...rest}
  />
);

export default ModelViewer;
