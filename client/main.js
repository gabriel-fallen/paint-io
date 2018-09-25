const randomHsl = () => `hsla(${Math.random() * 360}, 100%, 50%, 1)`;

document.addEventListener("DOMContentLoaded", () => {
  const socket = io.connect();

  const canvas_bg = document.getElementById('bg');
  const ctx_bg    = canvas_bg.getContext('2d');
  const canvas_fg = document.getElementById('fg');
  const ctx_fg    = canvas_fg.getContext('2d');

  let down = false;
  let cur_line = {
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 0
    },
    color: randomHsl()
  };

  // normalize mouse position to range 0.0 - 1.0
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / rect.width,
        y: (evt.clientY - rect.top) / rect.height
    };
  }

  function clearFG() {
    ctx_fg.clearRect(0, 0, canvas_fg.width, canvas_fg.height);
  }

  function clearBG() {
    ctx_bg.fillStyle = 'ivory';
    ctx_bg.fillRect(0, 0, canvas_bg.width, canvas_bg.height);
  }

  function drawLine(canvas, context, line) {
    const startX = (line.start.x * canvas.width) | 0;
    const startY = (line.start.y * canvas.height) | 0;
    const endX   = (line.end.x * canvas.width) | 0;
    const endY   = (line.end.y * canvas.height) | 0;
    // console.log(`drawLine: ${canvas.id}: (${startX}, ${startY}) - (${endX}, ${endY}); ${line.color}`)
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.strokeStyle = line.color;
    context.lineWidth = 2;
    context.stroke();
  }

  function redrawCurrent() {
    clearFG();
    drawLine(canvas_fg, ctx_fg, cur_line);
  }

  function commitCurrent() {
    clearFG();
    drawLine(canvas_bg, ctx_bg, cur_line);
    // send line to to the server
    socket.emit('draw_line', cur_line);
  }

  // register mouse event handlers
  canvas_fg.onmousedown = (e) => {
    down = true;
    cur_line.start = getMousePos(canvas_fg, e);
    cur_line.end = cur_line.start;
  };

  canvas_fg.onmousemove = (e) => {
    if (down) {
      cur_line.end = getMousePos(canvas_fg, e);
      redrawCurrent();
    }
  };

  canvas_fg.onmouseup = (e) => {
    down = false;
    commitCurrent();
  };

  // draw line received from server
  socket.on('draw_line', function (line) {
    drawLine(canvas_bg, ctx_bg, line);
  });

  socket.on('clear_canvas', function () {
    clearBG();
  });

  const button_clear = document.getElementById('clear');
  button_clear.addEventListener('click', function () {
    socket.emit('clear_canvas');
  });

  clearBG();
});
