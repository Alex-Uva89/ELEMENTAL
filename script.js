window.onload = function() {
    var config = {
        type: Phaser.AUTO,
        width: window.innerWidth * 0.85,
        height: window.innerHeight * 0.8,  // Altezza impostata al 90% dello schermo
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
        var height = window.innerHeight * 0.90;  // Altezza impostata al 90% dello schermo
    
        game.scale.resize(width, height);
        game.physics.world.setBounds(0, 0, width, height);
    }

    var icons;
    var iconTypes = ['squirtle', 'bulbasaur', 'charmander'];
    var maxIcons = 45;  // Limite massimo di icone
    var gamePaused = true; // Indica se il gioco è fermo
    let music;

    function preload() {
        this.load.image('squirtle', './assets/squirtle.png');
        this.load.image('bulbasaur', './assets/bulbasaur.png');
        this.load.image('charmander', './assets/charmander.png');
        this.load.audio('backgroundMusic', 'assets/pkmBattleMusic.mp3');
    }

    function create() {
        // play music back
        music = this.sound.add('backgroundMusic');
    
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
    
            if (window.innerWidth < 768) {
                icon.setScale(0.06);
            } else {
                icon.setScale(0.1);
            }
            icon.setBounce(1);
            icon.setCollideWorldBounds(true);
            icon.setVelocity(0, 0);  // Inizialmente ferma le icone
        });
    
        // Set up collision detection
        this.physics.add.collider(icons, icons, handleCollision, null, this);
    
        updateScores();
        // Set up world bounds collision
        this.physics.world.bounds.width = window.innerWidth * 0.85;
        this.physics.world.bounds.height = window.innerHeight * 0.90;  // Altezza impostata al 90% dello schermo
    
        // Gestione pulsanti
        document.getElementById('start-button').addEventListener('click', startGame);
        document.getElementById('stop-button').addEventListener('click', stopGame);
    }
    
    function checkVictory() {
        let iconCounts = {};
    
        icons.children.iterate(function(icon) {
            let key = icon.texture.key;
            if (!iconCounts[key]) {
                iconCounts[key] = 0;
            }
            iconCounts[key]++;
        });

        console.log('Icon counts:', iconCounts); // Log per il debug
    
        for (let key in iconCounts) {
            if (iconCounts[key] === 48) {
                console.log(`Victory detected for ${key}`); // Log per il debug
                showVictoryScreen(key);
                break;
            }
        }
    }
    
    function showVictoryScreen(winningIconKey) {
        // Ferma la musica e il gioco
        const tableScore = document.getElementById('scores');

        music.stop();
        game.scene.pause('default');
    
        // Mostra la schermata di vittoria
        let victoryScreen = document.createElement('div');
        victoryScreen.id = 'victory-screen';
        victoryScreen.style.position = 'absolute';
        victoryScreen.style.width = '90vw';
        victoryScreen.style.height = '90vh';
        victoryScreen.style.top = '50%';
        victoryScreen.style.left = '50%';
        victoryScreen.style.transform = 'translate(-50%, -50%)';
        victoryScreen.style.padding = '20px';
        victoryScreen.style.backgroundColor = 'yellow';
        victoryScreen.style.color = 'white';
        victoryScreen.style.textAlign = 'center';
        victoryScreen.style.zIndex = '1000';
        victoryScreen.style.display = 'flex';
        victoryScreen.style.flexDirection = 'column';
        victoryScreen.style.justifyContent = 'center';
        victoryScreen.style.alignItems = 'center';
        victoryScreen.style.color = 'black';
        victoryScreen.style.fontSize = '3rem';
        victoryScreen.style.fontWeight = 'bold';
        victoryScreen.style.borderRadius = '10px';
        victoryScreen.style.boxShadow = '0 0 10px 5px rgba(0, 0, 0, 0.5)';
        victoryScreen.style.textTransform = 'uppercase';
        victoryScreen.style.border = '5px solid black';

        tableScore.style.display = 'none';
    
        let winningIcon = document.createElement('img');
        winningIcon.src = `assets/${winningIconKey}.png`; // Assicurati che il percorso dell'immagine sia corretto
        winningIcon.style.width = '100px';
        winningIcon.style.height = '100px';
    
        let victoryMessage = document.createElement('p');
        victoryMessage.textContent = `${winningIconKey} ha vinto!`;
    
        victoryScreen.appendChild(winningIcon);
        victoryScreen.appendChild(victoryMessage);
        document.body.appendChild(victoryScreen);
    }

    function update() {
        // Logica continua, se necessario
    }

    function updateScores() {
        scoreFire = 0;
        scoreGrass = 0;
        scoreWater = 0;
    
        icons.children.iterate(function(icon) {
            if (icon.texture.key === 'charmander') {
                scoreFire++;
            } else if (icon.texture.key === 'bulbasaur') {
                scoreGrass++;
            } else if (icon.texture.key === 'squirtle') {
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
            let speed;
        
            if (window.innerWidth < 768) {
                speed = Phaser.Math.Between(5, 30); // Velocità più bassa per schermi piccoli
            } else {
                speed = Phaser.Math.Between(10, 50); // Velocità normale per schermi grandi
            }
        
            // Imposta la velocità e la direzione per ogni icona
            let velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
            let velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * speed;
        
            icon.setVelocity(velocityX, velocityY);
        });
    
        document.getElementById('start-button').classList.add('hidden');
        document.getElementById('stop-button').classList.remove('hidden');
        if (music.isPaused) {
            music.resume();
        } else {
            music.play({ loop: true });
        }
    }
    
    function stopGame() {
        gamePaused = true;
        icons.setVelocity(0, 0);  // Ferma tutte le icone
        game.scene.pause('default');  // Pausa il gioco
    
        document.getElementById('stop-button').classList.add('hidden');
        document.getElementById('start-button').classList.remove('hidden');
        music.pause();
    }

    function handleCollision(icon1, icon2) {
        if (gamePaused) return;
    
        if (icon1 === icon2) return;
    
        var type1 = icon1.texture.key;
        var type2 = icon2.texture.key;
    
        var collisionX = (icon1.x + icon2.x) / 2;
        var collisionY = (icon1.y + icon2.y) / 2;
    
        if (type1 === 'squirtle' && type2 === 'bulbasaur') {
            icon1.setTexture('bulbasaur');
        } else if (type1 === 'bulbasaur' && type2 === 'squirtle') {
            icon2.setTexture('bulbasaur');
        } else if (type1 === 'squirtle' && type2 === 'charmander') {
            icon2.setTexture('squirtle');
        } else if (type1 === 'charmander' && type2 === 'squirtle') {
            icon1.setTexture('squirtle');
        } else if (type1 === 'bulbasaur' && type2 === 'charmander') {
            icon1.setTexture('charmander');
        } else if (type1 === 'charmander' && type2 === 'bulbasaur') {
            icon2.setTexture('charmander');
        }
    
        if (type1 === type2) {
            icon1.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
            icon2.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
        }
    
        updateScores();
        checkVictory();
    }
};