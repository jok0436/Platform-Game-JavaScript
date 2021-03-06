/* global Vec Lives */
var Player = class Player {
  constructor (pos, speed, lives) {
    this.pos = pos
    this.speed = speed
    this.lives = lives
  }

  get type () {
    return 'player'
  }

  static create (pos) {
    return new Player(pos.plus(new Vec(0, 0)),
      new Vec(0, 0), new Lives(2))
  }
}
/* That leaves the player itself. Player motion is handled separately per axis because hitting the floor
 should not prevent horizontal motion, and hitting a wall should not stop falling or jumping motion. */
Player.prototype.update = function (time, state, keys) {
  let xSpeed = 0
  if (keys.ArrowLeft || this.checkTouches(state, 'left')) xSpeed -= this.playerXSpeed
  if (keys.ArrowRight || this.checkTouches(state, 'right')) xSpeed += this.playerXSpeed
  let pos = this.pos
  let movedX = pos.plus(new Vec(xSpeed * time, 0))
  if (!state.level.touches(movedX, this.size, 'wall')) {
    pos = movedX
  }

  let ySpeed = this.speed.y + time * this.gravity
  let movedY = pos.plus(new Vec(0, ySpeed * time))
  if (!state.level.touches(movedY, this.size, 'wall')) {
    pos = movedY
  } else if ((keys.ArrowUp || this.checkTouches(state, 'up')) && ySpeed > 0) {
    ySpeed = -this.jumpSpeed
  } else {
    ySpeed = 0
  }
  return new Player(pos, new Vec(xSpeed, ySpeed), new Lives(this.lives.count))
}
Player.prototype.reset = function (state) {
  this.pos = state.level.playerStartPosition
}
Player.prototype.checkTouches = function (state, whichTouch) {
  let touchRingBlack = state.touchRingBlack
  let touchRingWhite = state.touchRingWhite
  switch (whichTouch) {
    case 'left':
      if (touchRingBlack.innerRingPosition.x < touchRingBlack.outerRingPosition.x) return true
      break
    case 'right':
      if (touchRingBlack.innerRingPosition.x > touchRingBlack.outerRingPosition.x) return true
      break
    case 'up':
      if (touchRingWhite.innerRingPosition.y < touchRingWhite.outerRingPosition.y) return true
      break
    default:
      break
  }
  return false
}
/* The horizontal motion is computed based on the state of the left and right arrow keys. When there’s no wall blocking the new
position created by this motion, it is used. Otherwise, the old position is kept. Vertical motion works in a similar way but
has to simulate jumping and gravity. The player’s vertical speed (ySpeed) is first accelerated to account for gravity.
We check for walls again. If we don’t hit any, the new position is used. If there is a wall, there are two possible
outcomes. When the up arrow is pressed and we are moving down (meaning the thing we hit is below us), the speed is set to a
relatively large, negative value. This causes the player to jump. If that is not the case, the player simply bumped into something,
and the speed is set to zero. The gravity strength, jumping speed, and pretty much all other constants in this game have been set
by trial and error. I tested values until I found a combination I liked */
Player.prototype.size = new Vec(0.4, 0.4)
Player.prototype.gravity = 30
Player.prototype.playerXSpeed = 7
Player.prototype.jumpSpeed = 17
