const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Setup camera
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.play();

  video.addEventListener('loadeddata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });
}

setupCamera();

// Load MediaPipe FaceMesh
// const faceMesh = new FaceMesh.FaceMesh({

const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });
  
  faceMesh.setOptions({
    maxNumFaces: 5,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  

const shinglesImage = new Image();
shinglesImage.src = 'shingle21.png'; // Path to the shingles texture


faceMesh.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (results.multiFaceLandmarks) {
    results.multiFaceLandmarks.forEach((landmarks) => {
      // Define the region for the left eye
      const leftEyeRegion = [33, 160, 159, 158, 144, 153, 154, 155]; // Left eye landmarks

      // Get the bounding box for the left eye region
      const points = leftEyeRegion.map((i) => landmarks[i]);
      const [x, y, width, height] = getBoundingBox(points);

      // Adjust bounding box for above-eye shingles effect
      const margin = 20; // Base margin around the eye
      const foreheadExtension = height * 1.5; // Extend upward for half-forehead effect
      const foreheadHeight = 50; // Extend height towards the forehead
      // Draw the shingles effect above the eye
      ctx.drawImage(
        shinglesImage,
        x - margin / 1.5,              // Left edge of the image
        y - margin - foreheadHeight /1.8, // Shift upwards by `foreheadHeight`
        width + margin * 1.6,      // Width including margin
        height + margin + foreheadHeight // Height including upward extension
      );

      // Create a half-closed eye effect by drawing a semi-transparent overlay
      // ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Dark semi-transparent color
      // const eyeOverlayHeight = height * 0.6; // Cover half the eye region
      // ctx.beginPath();
      // ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height); // Start at the top-left of the eye
      // points.forEach((point) => {
      //   ctx.lineTo(point.x * canvas.width, point.y * canvas.height); // Draw around the eye region
      // });
      // ctx.lineTo(points[0].x * canvas.width, points[0].y * canvas.height + eyeOverlayHeight); // Bottom edge for half-closed
      // ctx.closePath();
      // ctx.fill();
    });
  }
});
  
  

// Helper function to calculate bounding box
function getBoundingBox(region) {
  const xCoords = region.map((p) => p.x * canvas.width);
  const yCoords = region.map((p) => p.y * canvas.height);

  const x = Math.min(...xCoords);
  const y = Math.min(...yCoords);
  const width = Math.max(...xCoords) - x;
  const height = Math.max(...yCoords) - y;

  return [x, y, width, height];
}

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 1920 ,
  height:1080,
});

camera.start();
