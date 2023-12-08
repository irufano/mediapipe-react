/**
 *  draw face detections canvas
 *
 * @param faces detections face
 * @param input input video/image
 * @param ctx canvas from canvas.getContext('2d')
 * @param withClear draw with clear first (used in realtime detection)
 * @param withKeypoint used keypoint default is true
 * @param pointColor color of keypoint
 * @param boxColor color of border box detection
 * @param boxWidth lineWidth of border box detection
 */
const drawFaceMarker = (
  faces,
  input,
  ctx,
  {
    withClear = true,
    withScore = false,
    withKeypoints = true,
    pointSize = 2,
    pointColor = "aquamarine",
    boxColor = "tomato",
    boxWidth = 3,
  } = {}
) => {
  if (withClear) {
    // clear the canvas after every drawing
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  faces.forEach((face) => {
    // do not draw if there is no face
    if (!face) return;
    const kp = face.keypoints;
    // do not draw if there is no keypoints
    if (!kp) return;
    const score = Math.round(parseFloat(face.categories[0].score) * 100);
    const keypoints = kp.map((keypoint) => [keypoint.x, keypoint.y]);
    const lineWidth = boxWidth;
    const left = face.boundingBox.originX;
    const top = face.boundingBox.originY;
    const width = face.boundingBox.width - 10;
    const height = face.boundingBox.height;
    const scoreHeight = 18;
    const scoreWidht = 46;
    const scoreTop = top - scoreHeight;
    const scoreLeft = left;
    const textScoreTop = scoreTop + 13;
    const textScoreLeft = scoreLeft + 10;

    // draw score confidence indicator
    if (withScore) {
      // draw score indicator background
      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = boxColor;
      ctx.fillStyle = boxColor;
      ctx.rect(scoreLeft, scoreTop, scoreWidht, scoreHeight);
      ctx.stroke();
      ctx.fill();

      // draw score indicator
      ctx.beginPath();
      ctx.font = "bold 10pt Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`${score}%`, textScoreLeft, textScoreTop);
    }

    // draw bounding box
    ctx.beginPath();
    ctx.rect(left, top, width, height);
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // draw keypoints
    if (withKeypoints) {
      for (let i = 0; i < keypoints.length; i++) {
        const x = keypoints[i][0] * input.offsetWidth - 3;
        const y = keypoints[i][1] * input.offsetHeight - 3;

        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, 3 * Math.PI);
        ctx.fillStyle = pointColor;
        ctx.fill();
      }
    }
  });
};

export default drawFaceMarker;
