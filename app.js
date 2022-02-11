class App {
    initProject() {
        let backgroundMain = document.getElementById("backgroundMain");
        let background1 = document.getElementById("background1");
        let foreground1 = document.getElementById("foreground1");
        let foreground2 = document.getElementById("foreground2");
        let foreground3 = document.getElementById("foreground3");
        let backgroundCovers = document.getElementById("backgroundCovers");
        let backgroundAudio = new Audio('./Audio/searching.wav');
        backgroundAudio.loop = true;

        initItems();
        initBird();

        document.getElementById("foreground2").addEventListener('mousedown', async function () {
            // Click to play audio on start
            let playPromise = backgroundAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(function() {
                }).catch(function(error) {
                    console.log(error)
                });
            }

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
        let scrollSpeed = 2;

        document.querySelector('.left').addEventListener('mouseover', function () {
            this.iid = setInterval(function() {
                if (x < 0) {
                    x += scrollSpeed
                }
                backgroundMain.style.left = x;
                backgroundCovers.style.left = x;
                background1.style.left = (x * 0.9).toString();
                foreground1.style.left = (x * 1.9).toString();
                foreground2.style.left = (x * 1.9).toString();
                // foreground3.style.left = (x * 1.9).toString();
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
                backgroundCovers.style.left = x;
                background1.style.left = (x * 0.9).toString();
                foreground1.style.left = (x * 1.9).toString();
                foreground2.style.left = (x * 1.9).toString();
                // foreground3.style.left = (x * 1.9).toString();
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
            textOffsetx = -250;
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
    console.log("starting drag")
    console.log(e.target.title)
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
            flowerComic.style.opacity = "1";
            flowerComic.style.zIndex = "2000";
            playAudio("SP_comic_open.wav");
            await new Promise(resolve => setTimeout(resolve, 1000));
            flowerComic.classList.add("closable");
            break
        case "bird":
            console.log("Complete")
            createSpeechBubble("bird", 1160, 75, "That's it! You're so tweet. My little ones will love this!")
    }
}

async function createSpeechBubble(title, boundsX, boundsY, text) {
    let speechBubble = document.createElement("div");
    let speechContent = document.createTextNode(text)
    speechBubble.appendChild(speechContent)
    speechBubble.classList.add('speech');
    speechBubble.setAttribute('title', title);
    speechBubble.style.left = (boundsX).toString() + "px";
    speechBubble.style.top = (boundsY).toString() + "px";
    speechBubble.style.zIndex = "1000";
    document.getElementById('backgroundMain').appendChild(speechBubble);
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
            this.remove();
            addInventory(title, "url('./Art/inventory_" + title + ".png')")
        })
    })
}

function initBird() {
    let bird = document.getElementById("bird");
    bird.addEventListener('dragover', handleDragOver, false);
    bird.addEventListener('drop', handleBirdDrop, false);
}
