AFRAME.registerShader('chromakey', {
  schema: {
    src: {type: 'map', is: 'uniform'},
    color: {type: 'color', is: 'uniform', default: '#00FF00'},
    similarity: {type: 'number', is: 'uniform', default: 0.3},
    smoothness: {type: 'number', is: 'uniform', default: 0.1},
    opacity: {type: 'number', is: 'uniform', default: 1.0}
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D src;
    uniform vec3 color;
    uniform float similarity;
    uniform float smoothness;
    uniform float opacity;
    varying vec2 vUv;

    void main() {
      vec4 texColor = texture2D(src, vUv);
      if (texColor.a == 0.0) discard; // Handle existing alpha if any

      float dist = distance(texColor.rgb, color);
      float alpha = smoothstep(similarity, similarity + smoothness, dist);
      
      if (alpha < 0.01) discard; // Performance optimization for transparent pixels

      gl_FragColor = vec4(texColor.rgb, alpha * opacity);
    }
  `
});
