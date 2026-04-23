AFRAME.registerShader('chromakey', {
  schema: {
    src: { type: 'map' },
    color: { type: 'color', default: '#00FF00' },
    similarity: { type: 'number', default: 0.3 },
    smoothness: { type: 'number', default: 0.1 },
    opacity: { type: 'number', default: 1.0 }
  },

  init: function(data) {
    this.textureLoader = new THREE.TextureLoader();
  },

  update: function(data) {
    this.material.uniforms.src.value = data.src;
    this.material.uniforms.color.value = new THREE.Color(data.color);
    this.material.uniforms.similarity.value = data.similarity;
    this.material.uniforms.smoothness.value = data.smoothness;
    this.material.uniforms.opacity.value = data.opacity;
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
      float dist = distance(texColor.rgb, color);
      float alpha = smoothstep(similarity, similarity + smoothness, dist);
      gl_FragColor = vec4(texColor.rgb, alpha * opacity);
    }
  `
});
