class App {
    initProject() {
        let backgroundMain = document.getElementById("backgroundMain");
        let backgroundUL = document.getElementById("backgroundUL");
        let foreground1 = document.getElementById("foreground1");
        let foreground2 = document.getElementById("foreground2");

        let backgroundAudio = new Audio('./Audio/searching.wav');
        backgroundAudio.loop = true;

        initItems();
        initInteractables();
        initBird();
        makeComicDroppable();
        initFlower();

        document.getElementById("backgroundMain").addEventListener('mousedown', async function () {
            // Click to play audio on start
            let playPromise = backgroundAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(function() {
                }).catch(function(error) {
                    console.log(error)
                });
            }

            playAudio("SP_forest.wav")

            // If a closable item is open, close it
            let closeableItem = document.querySelector('.closable');
            if (closeableItem != null) {
                playAudio("SP_comic_close.wav");
                closeableItem.style.opacity = "0";
                await new Promise(resolve => setTimeout(resolve, 2000));
                closeableItem.style.zIndex = "0";
                closeableItem.classList.remove("closable");
            }
        })

        let x = 0;
        let scrollSpeed = 1;

        document.querySelector('.left').addEventListener('mouseover', function () {
            this.iid = setInterval(function() {
                if (x < 0) {
                    x += scrollSpeed
                }
                backgroundMain.style.left = x;
                backgroundUL.style.left = (x * 0.85).toString();
                foreground1.style.left = (x * 1.2).toString();
                foreground2.style.left = (x * 1.4).toString();

            }, 10);
        });
        document.querySelector('.left').addEventListener('mouseleave', function () {
            this.iid && clearInterval(this.iid);
        });

        document.querySelector('.right').addEventListener('mouseover', function () {
            this.iid = setInterval(function() {
                if (x > -Math.abs(backgroundMain.offsetWidth / 2 ) +200) {
                    x -= scrollSpeed
                }
                backgroundMain.style.left = x;
                backgroundUL.style.left = (x * 0.85).toString();
                foreground1.style.left = (x * 1.2).toString();
                foreground2.style.left = (x * 1.4).toString();
            }, 10);
        });
        document.querySelector('.right').addEventListener('mouseleave', function () {
            this.iid && clearInterval(this.iid);
        });

        let narrativeItems = document.getElementsByClassName('narrative')
        for (let i = 0; i < narrativeItems.length; i++) {
            narrativeItems[i].addEventListener('mousedown', function () {
                let bounds = narrativeItems[i].getBoundingClientRect();
                let title = narrativeItems[i].getAttribute('title');
                narrationInteract(bounds, title);
            })
        }
    }
}

window.onload = function () {
    window.app = new App();
    window.app.initProject()
    window.itemsManager = new Items();
}

async function narrationInteract(bounds, title) {
    // Delete old speech bubble if exists
    let activeDialogues = document.querySelectorAll('.speech');
    activeDialogues.forEach((dialogue) => {
        if (dialogue.getAttribute('title') === title) {
            dialogue.remove();
        }
    })

    let text;
    let storyFinished = false;
    let pos;
    let textOffsetx;
    let textOffsety;

    switch(title) {
        case "flower":
            // exit if story is concluded
            playAudio("flower.wav");
            pos = window.itemsManager.flower.narrationPosition;
            if (pos >= window.itemsManager.flower.story.length) {
                storyFinished = true;
                break
            }
            text = window.itemsManager.flower.story[pos];
            window.itemsManager.flower.narrationPosition += 1;

            // Speech bubble offset
            textOffsetx = 150;
            textOffsety = 150;
            break
        case "bird":
            playAudio("SP_clickbird.wav");
            if (window.itemsManager.bird.complete) {
                storyFinished = true
                break
            }
            pos = window.itemsManager.bird.narrationPosition;
            if (pos >= window.itemsManager.bird.story.length) {
                window.itemsManager.bird.narrationPosition = 0;
                break
            }
            text = window.itemsManager.bird.story[pos];
            window.itemsManager.bird.narrationPosition += 1;
            // Speech bubble offset
            textOffsetx = -100;
            textOffsety = 0;
            break
    }

    if (storyFinished) {
        storyComplete(title);
        return
    }

    createSpeechBubble(title, (bounds.x - textOffsetx).toString(), (bounds.y - textOffsety).toString(), text);
}

function addInventory(title, url) {
    playAudio("SP_into_inventory.wav");
    let inventory = document.querySelector('.inventoryItem');
    let newInventory = inventory.cloneNode(true);
    newInventory.style.background = url;
    newInventory.setAttribute('title', title);
    newInventory.style.backgroundRepeat = 'no-repeat';
    document.getElementById("inventory").appendChild(newInventory)
    newInventory.style.visibility = 'visible';

    newInventory.draggable = true;
    newInventory.addEventListener('dragstart', this.handleDragStart, false);
    newInventory.addEventListener('dragover', this.handleDragOver, false);
}

function handleDragStart(e) {
    e.dataTransfer.setData("text", e.target.title);
}

function handleDragOver(e) {
    e.preventDefault();
    if (e.preventDefault) {
        e.preventDefault();
    }
}

function handleBirdDrop(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    let droppedTitle = e.dataTransfer.getData("text")
    if (droppedTitle === "seed") {
        window.itemsManager.bird.complete = true;
        playAudio("SP_successfulmatch.wav")
        storyComplete("bird")
    }
    let seedItem = document.querySelector('[title="seed"]');
    seedItem.remove();
}

function playAudio(fileName) {
    let filePath = "./Audio/" + fileName;
    let audio = new Audio(filePath);
    audio.play();
}

async function storyComplete(title) {
    switch(title){
        case "flower":
            let flowerComic = document.getElementById("comic");
            if (window.itemsManager.flower.complete) {
                flowerComic.style.backgroundImage = "url('./Art/comic_002_small.png')"
                break;
            }
            flowerComic.style.opacity = "1";
            flowerComic.style.zIndex = "2000";
            playAudio("SP_comic_open.wav");
            await new Promise(resolve => setTimeout(resolve, 1000));
            flowerComic.classList.add("closable");
            break
        case "bird":
            createSpeechBubble("bird", 1160, 75, "That's it! I'm the birdbrain parent in every lifetime...")
            let photo = document.getElementById("birdComic");
            photo.style.opacity = "1";
            photo.style.zIndex = "1000";
            await new Promise(resolve => setTimeout(resolve, 1000));
            photo.classList.add("closable")
    }
}

async function createSpeechBubble(title, boundsX, boundsY, text) {
    let speechBubble = document.createElement("div");
    let speechContent = document.createTextNode(text)
    speechBubble.appendChild(speechContent)
    speechBubble.classList.add('speech');
    speechBubble.setAttribute('title', title);
    let parent = document.getElementById('backgroundMain');
    parent.appendChild(speechBubble);
    let parentBounds = parent.getBoundingClientRect();
    speechBubble.style.left = (boundsX - parentBounds.x).toString() + "px";
    speechBubble.style.top = (boundsY - parentBounds.y).toString() + "px";
    speechBubble.style.zIndex = "1000";
    await new Promise(resolve => setTimeout(resolve, 100));
    speechBubble.style.opacity = "1";
    await new Promise(resolve => setTimeout(resolve, 4000));
    speechBubble.style.opacity = "0";
    await new Promise(resolve => setTimeout(resolve, 4000));
    speechBubble.remove();
}

function initItems() {
    let items = document.querySelectorAll('.item');
    let clickedFilepath = "./Art/click_inventory_"
    items.forEach((item) => {
        let title = item.getAttribute("title");
        item.addEventListener('mouseover', function () {
            this.style.backgroundImage = "url('" + clickedFilepath + title + "_hover.png')"
        })
        item.addEventListener('mouseleave', function () {
            this.style.backgroundImage = "url('" + clickedFilepath + title + ".png')"
        })
        item.addEventListener('mousedown', function () {
            let bounds = this.getBoundingClientRect();
            let text;
            switch (title) {
                case "ball" :
                    text = window.itemsManager.ball.foundDialogue;
                    break
                case "boot1":
                    text = window.itemsManager.boot1.foundDialogue;
                    break
                case "boot2":
                    text = window.itemsManager.boot2.foundDialogue;
                    break
                case "sock":
                    text = window.itemsManager.sock.foundDialogue;
                    break
                case "seed":
                    text = window.itemsManager.seed.foundDialogue;
                    break
                case "rod":
                    text = window.itemsManager.rod.foundDialogue;
                    break
                case "grave":
                    text = window.itemsManager.grave.foundDialogue;
                    break
                case "mattsToy":
                    text = window.itemsManager.mattsToy.foundDialogue;
                    break
                case "chloesToy":
                    text = window.itemsManager.chloesToy.foundDialogue;
                    break
                case "elainesToy":
                    text = window.itemsManager.elainesToy.foundDialogue;
                    break
                case "chantesToy":
                    text = window.itemsManager.chantesToy.foundDialogue;
                    break
                case "linsToy":
                    text = window.itemsManager.linsToy.foundDialogue;
                    break
            }
            createSpeechBubble(title, (bounds.x -100).toString(), (bounds.y - 100).toString(), text);
            this.remove();
            addInventory(title, "url('./Art/inventory_" + title + ".png')")
        })
    })
}

function initInteractables() {
    let items = document.querySelectorAll('.interactable');
    let clickedFilepath = "./Art/click_"
    items.forEach((item) => {
        let title = item.getAttribute("title");
        item.addEventListener('mouseover', function () {
            this.style.backgroundImage = "url('" + clickedFilepath + title + "_hover.png')"
        })
        item.addEventListener('mouseleave', function () {
            this.style.backgroundImage = "url('" + clickedFilepath + title + ".png')"
        })
        item.addEventListener('mousedown', function () {
            let bounds = this.getBoundingClientRect();
            let text;
            switch (title) {
                case "ball" :
                    text = window.itemsManager.ball.foundDialogue;
                    break
                case "boot1":
                    text = window.itemsManager.boot1.foundDialogue;
                    break
                case "boot2":
                    text = window.itemsManager.boot2.foundDialogue;
                    break
                case "sock":
                    text = window.itemsManager.sock.foundDialogue;
                    break
                case "seed":
                    text = window.itemsManager.seed.foundDialogue;
                    break
                case "fishingrod":
                    text = window.itemsManager.fishingrod.foundDialogue;
                    break
                case "grave":
                    text = window.itemsManager.grave.foundDialogue;
                    break
                case "mattsToy":
                    text = window.itemsManager.mattsToy.foundDialogue;
                    break
                case "chloesToy":
                    text = window.itemsManager.chloesToy.foundDialogue;
                    break
                case "elainesToy":
                    text = window.itemsManager.elainesToy.foundDialogue;
                    break
                case "chantesToy":
                    text = window.itemsManager.chantesToy.foundDialogue;
                    break
                case "linsToy":
                    text = window.itemsManager.linsToy.foundDialogue;
                    break
            }
            createSpeechBubble(title, (bounds.x -100).toString(), (bounds.y - 100).toString(), text);
        })
    })
}

function initBird() {
    let bird = document.getElementById("bird");
    bird.addEventListener('mouseover', function () {
        this.style.backgroundImage = "url('./Art/click_bird_hover.png')"
    })
    bird.addEventListener('mouseleave', function () {
        this.style.backgroundImage = "url('./Art/click_bird.png')"
    })
    bird.addEventListener('dragover', handleDragOver, false);
    bird.addEventListener('drop', handleBirdDrop, false);
}

function initFlower() {
    let flower = document.getElementById("flower");
    flower.addEventListener('mouseover', function () {
        if (!itemsManager.flower.complete)
        this.style.backgroundImage = "url('./Art/click_flower_hover.png')";
    })
    flower.addEventListener('mouseleave', function () {
        if (!itemsManager.flower.complete)
            this.style.backgroundImage = "url('./Art/click_flower.png')";
    })
}

function makeComicDroppable() {
    let comicDropSpace = document.getElementById("comicdrop");
    comicDropSpace.addEventListener('dragover', handleDragOver, false);
    comicDropSpace.addEventListener('drop', handleComicDrop, false);
}

function handleComicDrop(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    let droppedTitle = e.dataTransfer.getData("text")
    if (droppedTitle === "sock") {
        window.itemsManager.flower.complete = true;
        playAudio("SP_successfulmatch.wav")
        storyComplete("flower")
        let flower = document.getElementById("flower");
        flower.style.backgroundImage = "url('./Art/click_flower_blossomed.png')";
        document.getElementById("catFlower").style.visibility = "visible";
    }
    let sockItem = document.querySelector('[title="sock"]');
    let comicdrop = document.getElementById("comicdrop");
    sockItem.remove();
    comicdrop.remove();
}
