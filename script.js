window.onload = function() {
    var config = {
        type: Phaser.AUTO,
        width: window.innerWidth * 0.85,
        height: window.innerHeight * 0.85,
        backgroundColor: '#000000',
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        }
    };
    
    var game = new Phaser.Game(config);
    
    window.addEventListener('resize', resizeGame);
    
    function resizeGame() {
        var width = window.innerWidth * 0.85;
        var height = window.innerHeight * 0.85;
    
        game.scale.resize(width, height);
        game.physics.world.setBounds(0, 0, width, height);
    }

    var icons;
    var iconTypes = ['blue', 'green', 'red'];
    var maxIcons = 45;  // Limite massimo di icone
    var gamePaused = true; // Indica se il gioco è fermo

    function preload() {
        this.load.image('blue', './assets/water.png');
        this.load.image('green', './assets/leaf.png');
        this.load.image('red', './assets/fire.png');
    }

    function create() {
        // Create a container for icons
        icons = this.physics.add.group({
            key: iconTypes,
            repeat: 15,
            setXY: { x: 100, y: 100, stepX: 140 }
        });

        icons.children.iterate(function(icon) {
            let x = Phaser.Math.Between(50, config.width - 50);
            let y = Phaser.Math.Between(50, config.height - 50);
            icon.setPosition(x, y);

            icon.setScale(0.05);
            icon.setBounce(1);
            icon.setCollideWorldBounds(true);
            icon.setVelocity(0, 0);  // Inizialmente ferma le icone
        });

        // Set up collision detection
        this.physics.add.collider(icons, icons, handleCollision, null, this);

        updateScores(); 
        // Set up world bounds collision
        this.physics.world.bounds.width = window.innerWidth * 0.85;
        this.physics.world.bounds.height = window.innerHeight * 0.85;

        // Gestione pulsanti
        document.getElementById('start-button').addEventListener('click', startGame);
        document.getElementById('stop-button').addEventListener('click', stopGame);
    }

    function update() {
        // Logica continua, se necessario
    }

    function updateScores() {
        scoreFire = 0;
        scoreGrass = 0;
        scoreWater = 0;
    
        icons.children.iterate(function(icon) {
            if (icon.texture.key === 'red') {
                scoreFire++;
            } else if (icon.texture.key === 'green') {
                scoreGrass++;
            } else if (icon.texture.key === 'blue') {
                scoreWater++;
            }
        });
    
        document.getElementById('fireCount').textContent = scoreFire;
        document.getElementById('grassCount').textContent = scoreGrass;
        document.getElementById('waterCount').textContent = scoreWater;
    }

    function startGame() {
        gamePaused = false;
        game.scene.resume('default');  // Riprendi il gioco
    
        icons.children.iterate(function(icon) {
            let angle = Phaser.Math.Between(0, 360);  // Angolo casuale in gradi
            let speed = Phaser.Math.Between(10, 50); // Velocità casuale
    
            // Imposta la velocità e la direzione per ogni icona
            let velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
            let velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * speed;
    
            icon.setVelocity(velocityX, velocityY);
        });
    
        document.getElementById('start-button').classList.add('hidden');
        document.getElementById('stop-button').classList.remove('hidden');
    }

    function stopGame() {
        gamePaused = true;
        icons.setVelocity(0, 0);  // Ferma tutte le icone
        game.scene.pause('default');  // Pausa il gioco

        document.getElementById('stop-button').classList.add('hidden');
        document.getElementById('start-button').classList.remove('hidden');
    }

    function handleCollision(icon1, icon2) {
        if (gamePaused) return;
    
        if (icon1 === icon2) return;
    
        var type1 = icon1.texture.key;
        var type2 = icon2.texture.key;
    
        var collisionX = (icon1.x + icon2.x) / 2;
        var collisionY = (icon1.y + icon2.y) / 2;
    
        if (type1 === 'blue' && type2 === 'green') {
            icon1.setTexture('green');
        } else if (type1 === 'green' && type2 === 'blue') {
            icon2.setTexture('green');
        } else if (type1 === 'blue' && type2 === 'red') {
            icon2.setTexture('blue');
        } else if (type1 === 'red' && type2 === 'blue') {
            icon1.setTexture('blue');
        } else if (type1 === 'green' && type2 === 'red') {
            icon1.setTexture('red');
        } else if (type1 === 'red' && type2 === 'green') {
            icon2.setTexture('red');
        }
    
        if (type1 === type2) {
            icon1.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
            icon2.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
        }
    
        updateScores();  // Aggiorna i punteggi dopo ogni collisione
    }
};
