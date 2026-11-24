# Balancly

A DeviceOrientation-based ball game where you tilt your device to control a yellow ball, collect targets, and avoid enemies.

## Features

- 🎮 **DeviceOrientation Controls**: Tilt your device to move the player
- 📱 **Mobile Optimized**:
  - iOS DeviceOrientation permission handling
  - Screen orientation lock (landscape)
  - Wake lock to prevent screen sleep
  - Touch event optimization
- 🎨 **3D Ball Graphics**: All game objects rendered as 3D balls with rolling animation
- 🎯 **Score Tracking**: Local score, highscore, and all-time statistics
- ⌨️ **Keyboard Fallback**: Desktop controls with WASD/Arrow keys

## Gameplay

- **Objective**: Collect yellow targets while avoiding red enemies
- **Controls**:
  - Mobile: Tilt device to move
  - Desktop: WASD or Arrow keys
- **Scoring**: Each target collected adds 1 point and spawns a new enemy
- **Game Over**: Collision with any enemy ends the game

## Technical Stack

- **TypeScript**: Strict mode, no `any` types
- **Vite**: Fast development with HTTPS support
- **HTML5 Canvas**: Custom 3D ball rendering with roll physics
- **DeviceOrientation API**: Motion control with iOS permission handling
- **LocalStorage**: Persistent score tracking

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Note:** DeviceOrientation API requires HTTPS. For local development, you can:
- Test on `http://localhost:3000` with keyboard controls (WASD/Arrow keys)
- Test the deployed version on GitHub Pages (automatically has HTTPS)
- Or set up a local HTTPS proxy if needed

## Mobile Features

### iOS Requirements
- HTTPS required for DeviceOrientation API
- Permission prompt on first use
- Full-screen capable when added to home screen

### Android Requirements
- HTTPS required for DeviceOrientation API
- Automatic orientation lock
- Wake lock support

## Game Mechanics

- **Player**: Yellow ball with happy face
- **Target**: Yellow ball to collect (spawns at random positions)
- **Enemies**: Red balls with sad faces (random velocity, bounce off walls)
- **Deadzone**: 5° deadzone to prevent hand tremor jitter
- **Physics**: Realistic ball rolling animation based on velocity

## Credits

Inspired by the "Evade" game from the phaser3-browsergame collection.

## License

MIT
