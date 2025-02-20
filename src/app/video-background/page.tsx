'use client';

import React, { useEffect, useRef, useState } from 'react';

const VideoBackgroundPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBlurred, setIsBlurred] = useState(true);

  useEffect(() => {
    // Load p5.js script
    const loadP5 = () => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js';
      script.onload = () => {
        // Initialize game after p5.js loads
        const gameScript = document.createElement('script');
        gameScript.textContent = `
          let shells = [];
          let particles = [];
          let score = 0;
          let lives = 3;
          let gameOver = false;
          let lastMouseX = 0;
          let lastMouseY = 0;
          let mouseSpeed = 0;
          let mouseAngle = 0;
          let mouseHistory = [];
          let slashGraphic;
          let isTouching = false;

          function setup() {
            const canvas = createCanvas(windowWidth, windowHeight);
            canvas.parent('game-container');
            canvas.style('display', 'block'); // Ensure proper mobile display
            canvas.style('touch-action', 'none'); // Prevent default touch actions
            colorMode(HSB, 360, 100, 100, 1);
            
            // Create off-screen graphics for the slash effect
            slashGraphic = createGraphics(windowWidth, windowHeight);
            slashGraphic.stroke(255);
            slashGraphic.strokeWeight(3);
            
            // Start spawning shells
            setInterval(spawnShell, 1000);

            // Handle touch events
            canvas.touchStarted(handleTouchStart);
            canvas.touchMoved(handleTouchMove);
            canvas.touchEnded(handleTouchEnd);
          }

          function handleTouchStart() {
            isTouching = true;
            lastMouseX = touches[0].x;
            lastMouseY = touches[0].y;
            return false; // Prevent default
          }

          function handleTouchMove() {
            if (touches.length > 0) {
              mouseX = touches[0].x;
              mouseY = touches[0].y;
            }
            return false; // Prevent default
          }

          function handleTouchEnd() {
            isTouching = false;
            return false; // Prevent default
          }

          function spawnShell() {
            if (gameOver) return;
            
            shells.push({
              x: random(width * 0.1, width * 0.9),
              y: height + 20,
              targetY: random(height * 0.3, height * 0.7),
              size: random(30, 50),
              color: color(random(360), 80, 90),
              velX: random(-1, 1),
              velY: random(-14, -10),
              gravity: 0.2,
              exploded: false,
              slashed: false
            });
          }

          function createExplosion(x, y, shellColor) {
            const particleCount = random(30, 50);
            const baseHue = hue(shellColor);
            
            for (let i = 0; i < particleCount; i++) {
              const angle = random(TWO_PI);
              const speed = random(2, 6);
              particles.push({
                x: x,
                y: y,
                velX: cos(angle) * speed,
                velY: sin(angle) * speed,
                size: random(3, 8),
                color: color(
                  (baseHue + random(-20, 20)) % 360,
                  saturation(shellColor),
                  brightness(shellColor)
                ),
                alpha: 1,
                gravity: 0.05
              });
            }
          }

          function updateMouseData() {
            // Calculate mouse speed and direction
            const currentX = isTouching && touches.length > 0 ? touches[0].x : mouseX;
            const currentY = isTouching && touches.length > 0 ? touches[0].y : mouseY;
            
            const dx = currentX - lastMouseX;
            const dy = currentY - lastMouseY;
            mouseSpeed = sqrt(dx*dx + dy*dy);
            mouseAngle = atan2(dy, dx);
            
            // Update mouse history for trail
            mouseHistory.unshift({x: currentX, y: currentY, speed: mouseSpeed});
            if (mouseHistory.length > 10) {
              mouseHistory.pop();
            }
            
            lastMouseX = currentX;
            lastMouseY = currentY;
          }

          function draw() {
            clear(); // Use clear instead of background to make it transparent
            updateMouseData();
            
            // Draw and fade slash graphic
            image(slashGraphic, 0, 0);
            slashGraphic.background(0, 0, 0, 0.1); // Fade out slowly
            
            // Update and draw shells
            for (let i = shells.length - 1; i >= 0; i--) {
              let shell = shells[i];
              
              // Update shell position
              shell.velY += shell.gravity;
              shell.x += shell.velX;
              shell.y += shell.velY;
              
              // Check if shell is off screen
              if (shell.y > height + 100 && !shell.exploded) {
                shells.splice(i, 1);
                if (!gameOver) lives--;
                if (lives <= 0) gameOver = true;
                continue;
              }
              
              // Draw shell if not exploded
              if (!shell.exploded) {
                fill(shell.color);
                noStroke();
                ellipse(shell.x, shell.y, shell.size);
                
                // Draw fuse
                stroke(200, 30, 80);
                strokeWeight(2);
                const fuseLength = shell.size * 0.8;
                const fuseAngle = noise(frameCount * 0.1 + i) * PI;
                line(
                  shell.x, 
                  shell.y, 
                  shell.x + cos(fuseAngle) * fuseLength, 
                  shell.y + sin(fuseAngle) * fuseLength
                );
                
                // Check for slash
                if ((mouseSpeed > 15 || (isTouching && mouseSpeed > 5)) && !shell.slashed) {
                  const mouseDistance = dist(
                    isTouching && touches.length > 0 ? touches[0].x : mouseX,
                    isTouching && touches.length > 0 ? touches[0].y : mouseY,
                    shell.x,
                    shell.y
                  );
                  if (mouseDistance < shell.size/2 + 20) {
                    shell.exploded = true;
                    shell.slashed = true;
                    createExplosion(shell.x, shell.y, shell.color);
                    score += 10;
                    
                    // Draw slash through the shell
                    slashGraphic.stroke(255);
                    slashGraphic.strokeWeight(3);
                    for (let j = 1; j < mouseHistory.length; j++) {
                      const alpha = map(j, 0, mouseHistory.length - 1, 1, 0);
                      slashGraphic.stroke(255, 255, 255, alpha * 255);
                      slashGraphic.line(
                        mouseHistory[j-1].x, 
                        mouseHistory[j-1].y,
                        mouseHistory[j].x,
                        mouseHistory[j].y
                      );
                    }
                  }
                }
              }
            }
            
            // Update and draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
              let p = particles[i];
              p.velY += p.gravity;
              p.x += p.velX;
              p.y += p.velY;
              p.alpha -= 0.01;
              
              if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
              }
              
              const c = color(hue(p.color), saturation(p.color), brightness(p.color), p.alpha);
              fill(c);
              noStroke();
              ellipse(p.x, p.y, p.size);
            }
            
            // Draw mouse/touch trail when moving fast
            if (mouseSpeed > 8 || (isTouching && mouseSpeed > 3)) {
              noFill();
              stroke(255, 255, 255, 0.5);
              strokeWeight(2);
              beginShape();
              for (let pos of mouseHistory) {
                const alpha = map(pos.speed, 0, 30, 0, 255);
                stroke(255, 255, 255, alpha);
                vertex(pos.x, pos.y);
              }
              endShape();
            }
            
            // Draw UI
            fill(255);
            textSize(min(24, windowWidth / 20)); // Responsive text size
            textAlign(LEFT);
            text(\`Score: \${score}\`, 20, 40);
            
            textAlign(RIGHT);
            text(\`Lives: \${lives}\`, width - 20, 40);
            
            if (gameOver) {
              textAlign(CENTER);
              textSize(min(48, windowWidth / 10)); // Responsive text size
              text("GAME OVER", width/2, height/2);
              textSize(min(24, windowWidth / 20)); // Responsive text size
              text(\`Final Score: \${score}\`, width/2, height/2 + 50);
              text("Tap to restart", width/2, height/2 + 100);
            }
          }

          function mousePressed() {
            handleGameRestart();
            return false; // Prevent default
          }

          function touchStarted() {
            handleGameRestart();
            return false; // Prevent default
          }

          function handleGameRestart() {
            if (gameOver) {
              // Reset game
              shells = [];
              particles = [];
              score = 0;
              lives = 3;
              gameOver = false;
            }
          }

          function windowResized() {
            resizeCanvas(windowWidth, windowHeight);
            let newSlashGraphic = createGraphics(windowWidth, windowHeight);
            newSlashGraphic.stroke(255);
            newSlashGraphic.strokeWeight(3);
            slashGraphic = newSlashGraphic;
          }
        `;
        document.body.appendChild(gameScript);
      };
      document.body.appendChild(script);
    };

    loadP5();

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.src.includes('p5.js') || !script.src) {
          script.remove();
        }
      });
    };
  }, []);

  useEffect(() => {
    // Ensure video plays after component mounts
    if (videoRef.current) {
      console.log('Video element found:', videoRef.current);
      console.log('Video source:', videoRef.current.currentSrc);
      
      // Set the playback rate to slow down the video
      videoRef.current.playbackRate = 0.47; // Adjust this value to control speed

      videoRef.current.play().catch(error => {
        console.error('Video autoplay failed:', error);
      });
    }
  }, []);

  return (
    <div className="video-background-page fixed inset-0 z-[100] overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`w-full h-full object-cover ${isBlurred ? 'blur-sm' : ''}`}
      >
        <source src="ROI_BG_VID_2.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />
      <div id="game-container" className="absolute inset-0 z-[101] touch-none" />
    </div>
  );
};

export default VideoBackgroundPage; 