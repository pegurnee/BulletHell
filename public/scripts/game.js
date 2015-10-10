define([
    'd2/collections/actorManager',
    'd2/rendering/defaultActorRenderer',
    'd2/utils/shaderCompiler',
    'd2/utils/animator',
    'd2/utils/rectangle',
    'd2/utils/vector',
    'emitters/circleEmitter',
    'ships/ship',
    'bullets/RedBullet',
    'd2/utils/quadTree',
    'd2/rendering/defaultRenderer',
    'd2/rendering/textureRegion',
    'keyManager/keyManager',
    'image!images/bullets.png',
    'text!shaders/vertex-shader.vert',
    'text!shaders/fragment-shader.frag'
  ], function(ActorManager, DefaultActorRenderer, ShaderCompiler, Animator, Rectangle,
        Vector, CircleEmitter, Ship, RedBullet, QuadTree,
        DefaultRenderer, TextureRegion,
        KeyManager, image, vertexShader, fragmentShader) {

    const LEFT          = 37;
    const UP            = 38;
    const RIGHT         = 39;
    const DOWN          = 40;
    const SHIP_SPEED    = 200;
    const BULLET_SPEED  = 100;

    var Game = function(canvas) {
      this.canvas = canvas;
      this.width = canvas.width;
      this.height = canvas.height;
      this.gl = canvas.getContext('webgl');
      this.actorManager = new ActorManager();
      this.defaultActorRenderer = new DefaultActorRenderer();
      this.shaderProgram = new ShaderCompiler().compileProgram(
        this.gl, vertexShader, fragmentShader
      );

      var worldBounds = new Rectangle(0, 0, this.width, this.height);
      this.quadTree = new QuadTree(worldBounds, 10, 10);

      this.gameState = {
        worldBounds: worldBounds
      };

      this.ship = new Ship(new Vector(this.width / 2, this.height * 0.75));
      this.actorManager.addActor(this.ship);
      this.ship.magnification = 2;

      this.emitters = [];
      var actorManager = this.actorManager;
      var gameState = this.gameState;
      this.emitters.push(new CircleEmitter(
        function(position, velocity, fromTime) {
          var newBullet = new RedBullet(
            position, velocity.scale(BULLET_SPEED)
          );
          newBullet.update(fromTime, gameState);
          newBullet.magnification = 1;
          actorManager.addActor(newBullet);
        }, new Vector(this.width / 2, this.height / 2),
        60, 0.04, 0.1
      ));

      this.renderer = new DefaultRenderer(this.gl, this.shaderProgram);
      this.renderer.setResolution(this.width, this.height);
      this.frame = 0;
      this.animator = new Animator(this.onFrame, this);

      var keyManager = new KeyManager();
      this.keyManager = keyManager;
      keyManager.registerAction(LEFT);
      keyManager.registerAction(UP);
      keyManager.registerAction(RIGHT);
      keyManager.registerAction(DOWN);

      keyManager.registerKey(LEFT, LEFT);
      keyManager.registerKey(UP, UP);
      keyManager.registerKey(RIGHT, RIGHT);
      keyManager.registerKey(DOWN, DOWN);

      this.animator.start();
    };

    Game.prototype.onFrame = function(deltaTime) {
      this.frame++;
      if (this.frame > 900) {
        this.animator.stop();
      };

      this.handleInput(deltaTime);
      this.updateActors(deltaTime, this.gameState);
      this.updateEmitters(deltaTime);
      this.handleCollisions();
      this.removeDeadActors();


      this.renderAll();

      this.renderer.draw(this.actorManager.size());

      // stat loggin every 10 frames
      if (!(this.frame % 10)) {
        var fps = Math.round(1 / deltaTime);
        console.log(this.actorManager.size()
            + ' things rendered at '
            + fps + ' fps');
      }
    };

    Game.prototype.updateActors = function(deltaTime, gameState) {
      this.actorManager.forEach(function(actor) {
        actor.update(deltaTime, gameState);
      });
    };

    Game.prototype.handleCollisions = function() {
      var quadTree = this.quadTree;
      var ship = this.ship;

      this.actorManager.forEach(function(actor) {
        quadTree.insert(actor);
      });

      var collisions = quadTree.getCollisions(this.ship.bounds);
      for (var i = 0; i < collisions.length; i++) {
        if (collisions[i] !== ship) {
          collisions[i].isAlive = false;
        }
      }
    };

    Game.prototype.updateEmitters = function(deltaTime) {
      for (var i = 0; i < this.emitters.length; i++) {
        this.emitters[i].update(deltaTime);
      }
    };

    Game.prototype.handleInput = function(deltaTime) {
      var x = 0,
          y = 0;

      if (this.keyManager.isDown(LEFT)) {
        x -= 1;
      }
      if (this.keyManager.isDown(RIGHT)) {
        x += 1;
      }
      if (this.keyManager.isDown(UP)) {
        y -= 1;
      }
      if (this.keyManager.isDown(DOWN)) {
        y += 1;
      }

      this.ship.velocity.set(x, y)
          .normalize()
          .scale(SHIP_SPEED);
    };

    Game.prototype.removeDeadActors = function() {
      this.actorManager.removeIf(function(actor) {
        return !actor.isAlive;
      });
    };

    Game.prototype.renderAll = function() {
      this.renderer.clear(this.actorManager.size());

      var defaultActorRenderer = this.defaultActorRenderer;
      var renderer = this.renderer;
      var ship = this.ship;
      this.actorManager.forEach(function(actor) {
        defaultActorRenderer.render(actor, renderer, actor == ship);
      });
    };

    return Game;

});
