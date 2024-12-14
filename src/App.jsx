import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  // Constants for physics
  const initialSpeed = 30; // Initial velocity magnitude
  const friction = 0.005;  // Lower friction for more gradual slowdown
  const minSpeed = 0.5;    // Slightly higher minimum speed to make the ball slow down slowly
  const ballRadius = 22;   // Radius of the ball (half of 44px)
  const borderWidth = 20;  // The width of the border (adjust as necessary)
  //const { width: canvasWidth, height: canvasHeight } = canvas.getBoundingClientRect();
  // Initial ball state
  const [ballState, setBallState] = useState({
    
    position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    velocity: { x: 0, y: 0 },
    isMoving: false,
  });
  const [instructionsVisible, setInstructionsVisible] = useState(true);

  const canvasRef = useRef(null);

  // Launch ball when clicked
  const launchBall = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const targetX = event.clientX - rect.left;
    const targetY = event.clientY - rect.top;

    // Calculate direction and velocity
    const deltaX = targetX - ballState.position.x;
    const deltaY = targetY - ballState.position.y;

    const angle = Math.atan2(deltaY, deltaX); // Get angle from ball to click position
    const velocityMagnitude = initialSpeed;

    // Calculate X and Y velocity components using angle and speed
    const velocityX = velocityMagnitude * Math.cos(angle);
    const velocityY = velocityMagnitude * Math.sin(angle);

    // Set the ball's new velocity and mark it as moving
    setBallState((prevState) => ({
      position: prevState.position, // Keep the current position
      velocity: { x: velocityX, y: velocityY }, // Update the velocity
      isMoving: true,
    }));

    setInstructionsVisible(false); // Hide instructions after ball starts moving
  };

  const updateBallPhysics = () => {
    // Update ball position, considering the canvas borders
    let newX = ballState.position.x + ballState.velocity.x;
    let newY = ballState.position.y + ballState.velocity.y;
   
    console.log(window.innerWidth);
    // Create a copy of the velocity to modify
    let velocityX = ballState.velocity.x;
    let velocityY = ballState.velocity.y;

    if (newX <= borderWidth && velocityX <= 0) {
      newX = borderWidth; // Prevent ball from going into the left border
      velocityX = -velocityX; // Reflect the ball
    } else if (newX + 2*ballRadius >= window.innerWidth - borderWidth && velocityX > 0) {
      console.log(newX + 2*ballRadius);
      console.log(window.innerWidth - borderWidth);
      newX = window.innerWidth - borderWidth - (2*ballRadius); // Prevent ball from going into the right border
      console.log(newX);
      velocityX = -velocityX; // Reflect the ball
    }

    // Check for collisions with the top/bottom walls
    if (newY <= borderWidth && velocityY <= 0) {
      newY = borderWidth; // Prevent ball from going into the top border
      velocityY = -velocityY; // Reflect the ball
    } else if (newY + 2*ballRadius >= window.innerHeight - borderWidth && velocityY > 0) {
      newY = window.innerHeight - borderWidth - (2*ballRadius); // Prevent ball from going into the bottom border
      velocityY = -velocityY; // Reflect the ball
    }

    // Apply friction to the velocity to gradually slow down the ball
    velocityX *= 1 - friction;
    velocityY *= 1 - friction;

    // Ensure the ball's velocity doesn't fall below the minimum speed
    if (Math.abs(velocityX) < minSpeed) velocityX = 0;
    if (Math.abs(velocityY) < minSpeed) velocityY = 0;

    // If both velocity components are zero, stop the ball (not moving anymore)
    const isMoving = Math.abs(velocityX) > 0 || Math.abs(velocityY) > 0;

    // Update the ball position and velocity state
    setBallState({
      position: { x: newX, y: newY },
      velocity: { x: velocityX, y: velocityY },
      isMoving,
    });
  };

  // Ensure the ball's position updates properly
  useEffect(() => {
    const interval = setInterval(updateBallPhysics, 16); // Update ball position every 16ms (about 60 FPS)
    return () => clearInterval(interval); // Clean up the interval when component unmounts
  }, [ballState]);

  return (
    <div
      id="canvas"
      ref={canvasRef}
      onClick={launchBall}
      style={{ position: "relative", backgroundColor: "white" }}
    >
      <div
        id="ball"
        style={{
          position: "absolute",
          left: ballState.position.x - ballRadius,
          top: ballState.position.y - ballRadius,
          width: ballRadius * 2,
          height: ballRadius * 2,
          borderRadius: "50%",
          backgroundImage: `url('./assets/tennis-ball.webp')`, // Tennis ball image
          backgroundSize: "cover",
          boxShadow: "inset 0px 0px 14px rgba(0, 0, 0, 0.5)",
        }}
      ></div>

      {instructionsVisible && (
        <div
          id="instructions"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#00000088",
            fontSize: "24px",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          Click to launch the ball!
        </div>
      )}
    </div>
  );
};

export default App;
