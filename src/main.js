import { gsap } from 'gsap';

// Wait for the scene to load
const sceneEl = document.querySelector('a-scene');

sceneEl.addEventListener('loaded', () => {
    console.log('🚀 AR Scene Loaded');

    const skateboardTarget = document.querySelector('[mindar-image-target="targetIndex: 0"]');
    const plane = document.querySelector('#ui-plane');
    const box = document.querySelector('#hero-box');

    const blobVideo = document.querySelector('#blob-video');
    const videoEntity = document.querySelector('#video-entity');

    // --- Texture Swap Logic ---
    box.addEventListener('model-loaded', () => {
        console.log('📦 Skateboard Model Loaded, applying texture...');
        const mesh = box.getObject3D('mesh');
        const textureLoader = new THREE.TextureLoader();
        const boardTexture = textureLoader.load('/assets/Board Art.png');

        // Rotate texture 90 degrees clockwise (-90 degrees)
        boardTexture.center.set(0.5, 0.5);
        boardTexture.rotation = -Math.PI / 2;

        // Stretch width (horizontal on screen) but not vertical length
        boardTexture.wrapS = THREE.RepeatWrapping;
        boardTexture.wrapT = THREE.RepeatWrapping;
        boardTexture.repeat.x = -0.92;
        boardTexture.offset.x = 1;
        boardTexture.repeat.y = 1.8; // Stretch width
        boardTexture.offset.y = 0.18; // Center width ( (1 - 0.7) / 2 )

        // Flip texture if needed (common for GLTF)
        boardTexture.flipY = false;

        mesh.traverse((node) => {
            if (node.isMesh) {
                console.log('🔍 Found Mesh:', node.name);

                // Exclude obvious non-board parts
                const isExclude = node.name.toLowerCase().includes('wheel') ||
                    node.name.toLowerCase().includes('truck') ||
                    node.name.toLowerCase().includes('bolt') ||
                    node.name.toLowerCase().includes('nut');

                if (!isExclude) {
                    node.material.map = boardTexture;
                    node.material.needsUpdate = true;
                    console.log('🎨 Applied texture to possible board surface:', node.name);
                }
            }
        });
    });

    // 1. Initial State (Final positions, hidden opacity for smooth pop)
    gsap.set(plane.object3D.position, { x: 0, y: 0, z: 0.02 });
    gsap.set(plane.object3D.scale, { x: 1, y: 1, z: 1 });
    gsap.set(plane, { opacity: 0 });

    gsap.set(videoEntity.object3D.scale, { x: 1, y: 1, z: 1 });
    gsap.set(videoEntity.object3D.position, { x: 0, y: 0, z: 0.01 });
    gsap.set(videoEntity, { opacity: 0 });

    gsap.set(box.object3D.scale, { x: 0.546, y: 0.546, z: 0.546 });
    gsap.set(box.object3D.rotation, { x: 0, y: 0, z: 0 });
    gsap.set(box.object3D.position, { x: 0, y: 0, z: 0.03 });
    gsap.set(box, { opacity: 0 });

    let bobbingAnimation;

    // 2. Listen for "Found" event
    skateboardTarget.addEventListener('targetFound', event => {
        console.log('🎯 Skateboard Found!');

        // Start Video
        blobVideo.play();

        // Simple Instant Reveal (Quick fade instead of sweep)
        gsap.to([plane, videoEntity, box], {
            opacity: 1,
            duration: 0.2
        });

        // Start Bobbing immediately (Subtle/Minimal movement)
        bobbingAnimation = gsap.to(plane.object3D.position, {
            y: "+=0.01",
            duration: 2.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    });

    // 3. Listen for "Lost" event
    skateboardTarget.addEventListener('targetLost', event => {
        console.log('❓ Target Lost');
        if (bobbingAnimation) bobbingAnimation.kill();

        // Pause and reset video
        blobVideo.pause();
        blobVideo.currentTime = 0;

        // Hide elements smoothly
        gsap.to([plane, videoEntity, box], {
            opacity: 0,
            duration: 0.2
        });
    });

    // ============================================
    // ARTWORK 2: Skate Park Slideshow (Target 0)
    // ============================================
    const skateparkTarget = document.querySelector('[mindar-image-target="targetIndex: 1"]');
    const slideshowPlane = document.querySelector('#slideshow-plane');
    const slideData = [
        { id: '#skatepark-d', width: 1.413927, height: 0.545918 },
        { id: '#skatepark-e', width: 1.152060, height: 0.545918 },
        { id: '#skatepark-f', width: 0.682500, height: 0.545918 }
    ];
    let slideIndex = 0;
    let slideshowInterval = null;

    gsap.set(slideshowPlane, { opacity: 0 });

    skateparkTarget.addEventListener('targetFound', () => {
        console.log('🎯 Skate Park Found!');
        slideIndex = 0;
        const current = slideData[slideIndex];
        
        slideshowPlane.setAttribute('src', current.id);
        slideshowPlane.setAttribute('width', current.width);
        slideshowPlane.setAttribute('height', current.height);

        // Fade in
        gsap.to(slideshowPlane, { opacity: 1, duration: 0.3 });

        // Start cycling images
        slideshowInterval = setInterval(() => {
            // Fade out current
            gsap.to(slideshowPlane, {
                opacity: 0,
                duration: 0.15,
                onComplete: () => {
                    slideIndex = (slideIndex + 1) % slideData.length;
                    const next = slideData[slideIndex];
                    
                    slideshowPlane.setAttribute('src', next.id);
                    slideshowPlane.setAttribute('width', next.width);
                    slideshowPlane.setAttribute('height', next.height);
                    
                    // Fade in next
                    gsap.to(slideshowPlane, { opacity: 1, duration: 0.15 });
                }
            });
        }, 750); // Switch every 0.75 seconds
    });

    skateparkTarget.addEventListener('targetLost', () => {
        console.log('❓ Target 2 Lost');
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
            slideshowInterval = null;
        }
        gsap.to(slideshowPlane, { opacity: 0, duration: 0.2 });
    });

    // ============================================
    // ARTWORK 3: Allience Design Stacked (Target 2)
    // ============================================
    const target3 = document.querySelector('[mindar-image-target="targetIndex: 2"]');
    const alliencePlanes = [
        document.querySelector('#allience-logs-plane'),
        document.querySelector('#allience-barrel-plane'),
        document.querySelector('#allience-mother-plane')
    ];
    const allienceBarrelVideo = document.querySelector('#allience-barrel-video');

    // 1. Initial State
    alliencePlanes.forEach((p, index) => {
        gsap.set(p, { opacity: 0 });
        // Set initial Z positions from HTML but ensure they are ready for GSAP
        gsap.set(p.object3D.position, { z: 0.01 * (index + 1) });
    });

    let allienceAnimations = [];

    target3.addEventListener('targetFound', () => {
        console.log('🎯 Target 3 Found! Revealing Allience design...');
        
        // Start Video
        allienceBarrelVideo.play();

        // Fade in layers with a slight stagger
        gsap.to(alliencePlanes, {
            opacity: 1,
            duration: 0.5,
            stagger: 0.1
        });

        // Add unique bobbing/parallax to each layer
        alliencePlanes.forEach((p, index) => {
            const anim = gsap.to(p.object3D.position, {
                y: `+=${0.01 + (index * 0.005)}`,
                duration: 2 + (index * 0.5),
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
            allienceAnimations.push(anim);
        });
    });

    target3.addEventListener('targetLost', () => {
        console.log('❓ Target 3 Lost');
        
        // Pause and reset video
        allienceBarrelVideo.pause();
        allienceBarrelVideo.currentTime = 0;

        // Kill animations
        allienceAnimations.forEach(anim => anim.kill());
        allienceAnimations = [];

        // Fade out
        gsap.to(alliencePlanes, {
            opacity: 0,
            duration: 0.3
        });
    });

    // ============================================
    // VIDEO RECORDING LOGIC
    // ============================================
    const recordBtn = document.querySelector('#record-btn');
    let mediaRecorder;
    let recordedChunks = [];
    let isRecording = false;

    // Helper to merge layers and record
    const captureStream = () => {
        const videoEl = document.querySelector('video'); // MindAR camera feed
        const canvasEl = document.querySelector('canvas.a-canvas'); // A-Frame 3D objects
        
        // Create a hidden canvas for merging
        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = canvasEl.width;
        compositeCanvas.height = canvasEl.height;
        const ctx = compositeCanvas.getContext('2d');

        const stream = compositeCanvas.captureStream(30); // 30 FPS
        
        const drawFrame = () => {
            if (!isRecording) return;
            
            // 1. Draw camera feed
            if (videoEl) {
                ctx.drawImage(videoEl, 0, 0, compositeCanvas.width, compositeCanvas.height);
            }
            
            // 2. Draw A-Frame content on top
            ctx.drawImage(canvasEl, 0, 0);
            
            requestAnimationFrame(drawFrame);
        };

        drawFrame();
        return stream;
    };

    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            // START RECORDING
            recordedChunks = [];
            const stream = captureStream();
            
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8,opus'
            });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `AR-Experience-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            };

            mediaRecorder.start();
            isRecording = true;
            recordBtn.classList.add('recording');
            console.log('🔴 Recording started...');
        } else {
            // STOP RECORDING
            mediaRecorder.stop();
            isRecording = false;
            recordBtn.classList.remove('recording');
            console.log('⬜ Recording stopped. Saving...');
        }
    });
});
