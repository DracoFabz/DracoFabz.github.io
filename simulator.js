    const container = document.getElementById('drag-container');
    const CardBack = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/Back.png';
    const diceUrl = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/dice.png';
	const Counters = [
        { leftRatio: 0.96, topRatio: 0.418 }, // Trash Area [0]
        { leftRatio: 0.005, topRatio: 0.215 }, // Security Area [1]
        { leftRatio: 0.96, topRatio: 0.13 }, // Deck Area [2]
        { leftRatio: 0.035, topRatio: 0.63 }, // Egg Area [3]
		{ leftRatio: 0.96, topRatio: 0.84 } // Hand Area [4]
    ];
	let currentDeckType = "Deck";
    mulliganButton.addEventListener('click', Mulligan);
	setInterval(ReCount, 100);
    importButton.addEventListener('click', () => {
        popup.style.display = 'block';
    });
	function ReCount() {
		updateCountDisplays(Counters);
	}
	document.addEventListener('DOMContentLoaded', () => {
        adjustContainerSize();
        addDice();
        initializeAreaCounts(Counters);
        const urlParams = new URLSearchParams(window.location.search);
        const deckParam = urlParams.get('deck');
        if (deckParam) {
            LoadURL(deckParam);
        }
    });
	function TrowDice() {
		const randomNumber = Math.floor(Math.random() * 6) + 1;
		alert(`The dice rolled a ${randomNumber}`);
	}
	function updateCountDisplays(Counters) {
		const cards = document.querySelectorAll('.card');
		Counters.forEach((area, index) => {
			const count = Array.from(cards).filter(card => {
				const isDice = card.src && card.src.includes(diceUrl);
				return !isDice && CheckArea(card, index);
			}).length;
			const countBox = document.querySelector(`.count-box-${index}`);
			if (countBox) {
				countBox.textContent = count;
			}
		});
	}
	function initializeAreaCounts(Counters) {
		Counters.forEach((area, index) => {
			createCountDisplay(area, index);
		});
		updateCountDisplays(Counters);
	}
	function createCountDisplay(area, index) {
		const container = document.getElementById('drag-container');
		const countBox = document.createElement('div');
		countBox.className = `count-box-${index} counter`;
		countBox.style.position = 'absolute';
		countBox.style.backgroundColor =  'rgba(128, 128, 128, 0.7)';
		countBox.style.color = 'white';
		countBox.style.fontSize = `${container.offsetWidth / 40}px`;
		countBox.style.padding = '1px';
		countBox.style.borderRadius = '3px';
		countBox.style.zIndex = '9999';
		countBox.style.left = (area.leftRatio * 100) + '%';
		countBox.style.top = (area.topRatio * 100) + '%';
		countBox.textContent = '0';
		container.appendChild(countBox);
		return countBox;
	}
	function CheckArea(card, areaIndex) {
		const containerWidth = container.offsetWidth;
		const containerHeight = container.offsetHeight;
		const cardRect = card.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();
		const cardLeft = cardRect.left - containerRect.left;
		const cardTop = cardRect.top - containerRect.top;
		const cardRight = cardLeft + card.offsetWidth;
		const cardBottom = cardTop + card.offsetHeight;
		const areas = [
			{ // Trash Area [0]
				left: containerRect.width * 0.92,
				right: containerRect.width,
				top: containerRect.height * 0.58,
				bottom: containerRect.height * 0.60
			},
			{ // Security Area [1]
				left: 0,
				right: containerRect.width * 0.12,
				top: containerRect.height * 0.3,
				bottom: containerRect.height * 0.45
			},
			{ // Deck Area [2]
				left: containerRect.width * 0.92,
				right: containerRect.width,
				top: containerRect.height * 0.25,
				bottom: containerRect.height * 0.27
			},
			{ // Egg Area [3]
				left: containerRect.width * 0.13,
				right: containerRect.width * 0.11,
				top: containerRect.height * 0.87,
				bottom: containerRect.height
			},
			{ // Hand Area [4]
				left: containerRect.width * 0.4,
				right: containerRect.width,
				top: containerRect.height * 0.93,
				bottom: containerRect.height
			},
			{ // Raising Area [5]
				left: containerRect.width * 0.13,
				right: containerRect.width * 0.19,
				top: containerRect.height * 0.87,
				bottom: containerRect.height
			},
			{ // Board Area [6]
				left: containerRect.width * 0,
				right: containerRect.width,
				top: containerRect.height * 0,
				bottom: containerRect.height
			}
			// Add more areas as needed
		];
		const area = areas[areaIndex];
		const isInArea = cardRight > area.left && cardLeft < area.right &&
						 cardBottom > area.top && cardTop < area.bottom;
		return isInArea;
	}
	function makeDraggable(element) {
		let isMoving = false;
		let startX, startY, initialX, initialY;
		let longPressTimeout;
		let lastTapTime = 0;
		if (isSmartphone()) {
			element.addEventListener('touchstart', (e) => {
				if (e.touches.length === 1) {
					e.preventDefault();
					isMoving = true;
					startX = e.touches[0].clientX;
					startY = e.touches[0].clientY;
					initialX = element.offsetLeft;
					initialY = element.offsetTop;
					highestZIndex++;
					element.style.zIndex = highestZIndex;
					longPressTimeout = setTimeout(() => {
						ShowInfo({ currentTarget: element });
					}, 2000);

					document.addEventListener('touchmove', moveElement);
					document.addEventListener('touchend', stopMove);
				}
			});
			element.addEventListener('touchend', (e) => {
				const currentTime = new Date().getTime();
				const tapLength = currentTime - lastTapTime;
				clearTimeout(longPressTimeout);
				if (tapLength < 300 && tapLength > 0) {
					element.style.zIndex = ++highestZIndex;
					let rotation = parseInt(element.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
					if (element.src === 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/dice.png') {TrowDice();} else {
					if (CheckArea(element, 0)) {
						element.style.transform = 'rotate(0deg)';
						HomeDeck(element);
						element.style.zIndex = 1;
						element.src = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/Back.png';
					} else {
						if (rotation % 360 === 0) {
							rotation -= 90;
						} else {
							rotation += 90;
						}
						rotation = (rotation - 360) % 360;
						element.style.transform = `rotate(${rotation}deg)`;
					}}
				}
				lastTapTime = currentTime;
			});
		} else {
			element.addEventListener('mousedown', (e) => {
				isMoving = true;
				startX = e.clientX;
				startY = e.clientY;
				initialX = element.offsetLeft;
				initialY = element.offsetTop;
				highestZIndex++;
				element.style.zIndex = highestZIndex;
				document.addEventListener('mousemove', moveElement);
				document.addEventListener('mouseup', stopMove);
			});
			element.addEventListener('dblclick', () => {
				element.style.zIndex = ++highestZIndex;
				let rotation = parseInt(element.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
				if (element.src === 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/dice.png') {TrowDice();} else {
				if (CheckArea(element, 0)) {
					element.style.transform = 'rotate(0deg)';
					HomeDeck(element);
					element.style.zIndex = 1;
					element.src = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/Back.png';
				} else {
					if (rotation % 360 === 0) {
						rotation -= 90;
					} else {
						rotation += 90;
					}
					rotation = (rotation - 360) % 360;
					element.style.transform = `rotate(${rotation}deg)`;
				}}
			});
		}
		function moveElement(e) {
		if (isMoving) {
			element.style.zIndex = ++highestZIndex;
			const dx = isSmartphone() ? e.touches[0].clientX - startX : e.clientX - startX;
			const dy = isSmartphone() ? e.touches[0].clientY - startY : e.clientY - startY;
			const newX = initialX + dx;
			const newY = initialY + dy;
			const minY = 0;
			const maxX = container.offsetWidth - element.offsetWidth;
			const maxY = 1.1 * container.offsetHeight - element.offsetHeight;
			if (newX >= 0 && newX <= maxX && newY >= minY && newY <= maxY) {
				element.style.left = newX + 'px';
				element.style.top = newY + 'px';
				const visualLeftRatio = newX / container.offsetWidth;
				const visualTopRatio = newY / container.offsetHeight;
				element.dataset.visualLeftRatio = visualLeftRatio;
				element.dataset.visualTopRatio = visualTopRatio;
				if (!element.src || !element.src.includes(diceUrl)) {
					CardRegion(element);
					SnapCard(element);
					SnapArea(element);
					const snappedLeft = parseFloat(element.style.left);
					const snappedTop = parseFloat(element.style.top);
					element.dataset.visualLeftRatio = snappedLeft / container.offsetWidth;
					element.dataset.visualTopRatio = snappedTop / container.offsetHeight;
				} else {
					SnapDice(element);
				}
			}
		}
	}
		function stopMove(e) {
			isMoving = false;
			clearTimeout(longPressTimeout);
			document.removeEventListener(isSmartphone() ? 'touchmove' : 'mousemove', moveElement);
			document.removeEventListener(isSmartphone() ? 'touchend' : 'mouseup', stopMove);
		}
		element.dataset.originalImageUrl = element.src;
	}
	function Mulligan() {
		const cards = Array.from(container.children).filter(child => child.tagName === 'IMG' && !child.src.includes(diceUrl));
		Shuffling(cards);
		const maxZIndex = cards.length;
		cards.forEach((card, index) => {
			card.style.zIndex = maxZIndex - index;
		});
		const eggDeckCards = cards.filter(card => card.dataset.decktype === 'Egg');
		const mainDeckCards = cards.filter(card => card.dataset.decktype !== 'Egg');
		eggDeckCards.forEach(card => {
			HomeDeck(card);
		});
		const securityCards = mainDeckCards.slice(0, 5);
		securityCards.forEach(card => {
			card.src = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/Back.png';
			card.style.transition = 'none';
			card.style.transform = 'rotate(-90deg)';
		});
		MoveTo(securityCards, {
			left: container.offsetWidth * 0.04,
			top: container.offsetHeight * 0.39,
			xSpacing: 0.05,
			ySpacing: -0.22
		});
		const handCards = mainDeckCards.slice(5, 10);
		handCards.forEach(card => {
			card.src = card.dataset.originalImageUrl;
			card.style.transition = 'none';
			card.style.transform = 'rotate(0deg)';
		});
		MoveTo(handCards, {
			left: container.offsetWidth * 0.5,
			top: container.offsetHeight * 0.84,
			xSpacing: 0.8,
			ySpacing: 0
		});
		mainDeckCards.slice(10).forEach(card => {
			card.src = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/Back.png';
			card.style.transition = 'none';
			card.style.transform = 'rotate(0deg)';
			HomeDeck(card);
		});
	}
	function Shuffling(array) {
		const shuffle = (arr) => {
			for (let i = arr.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[arr[i], arr[j]] = [arr[j], arr[i]];}};
			for (let k = 0; k < 3; k++) {shuffle(array);}
	}
	function MoveTo(cards, area) {
		let highestZIndex = 1;
		cards.forEach((card, i) => {
			const cardWidth = card.offsetWidth;
			const cardHeight = card.offsetHeight;
			const targetX = area.left + (i * (cardWidth * area.xSpacing));
			const targetY = area.top + (i * (cardHeight * area.ySpacing));
			const initialX = card.offsetLeft;
			const initialY = card.offsetTop;
			const initialVisualLeftRatio = initialX / container.offsetWidth;
			const initialVisualTopRatio = initialY / container.offsetHeight;
			card.style.zIndex = ++highestZIndex;
			card.style.transition = 'left 0.2s ease, top 0.2s ease';
			card.style.left = `${targetX}px`;
			card.style.top = `${targetY}px`;
			const onTransitionEnd = () => {
				const newVisualLeftRatio = targetX / container.offsetWidth;
				const newVisualTopRatio = targetY / container.offsetHeight;
				const hasMoved = initialX !== targetX || initialY !== targetY;
				if (hasMoved) {
					card.dataset.visualLeftRatio = newVisualLeftRatio;
					card.dataset.visualTopRatio = newVisualTopRatio;
				}
				card.style.transition = '';
				card.removeEventListener('transitionend', onTransitionEnd);
			};
			card.addEventListener('transitionend', onTransitionEnd);
		});
	}
	
	function CardRegion(card) {
		if (CheckArea(card, 1) || CheckArea(card, 2) || CheckArea(card, 3)) {
			card.src = CardBack;} else {card.src = card.dataset.originalImageUrl || CardBack;}
		if (CheckArea(card, 1)) {
			let rotation = parseInt(card.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
			if (rotation % 360 === 0) {rotation -= 90;}
			rotation = (rotation - 360) % 360;
			card.style.transform = `rotate(${rotation}deg)`;}
		if (CheckArea(card, 5) || CheckArea(card, 0) || CheckArea(card, 2)) {
			let rotation = parseInt(card.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
			if (rotation % 360 === 0) {rotation -= 0;} else {rotation += 90;}
			rotation = (rotation - 360) % 360;
			card.style.transform = `rotate(${rotation}deg)`;
		}
	}
    let highestZIndex = 1;
	function SnapCard(card) {
		const allCards = document.querySelectorAll('.card');
		allCards.forEach(otherCard => {
			if (card !== otherCard) {
				const cardCenterX = card.offsetLeft + card.offsetWidth / 2;
				const cardCenterY = card.offsetTop + card.offsetHeight / 2;
				const otherCardCenterX = otherCard.offsetLeft + otherCard.offsetWidth / 2;
				const otherCardCenterY = (otherCard.offsetTop + otherCard.offsetHeight / 2) * 0.93;
				const distanceX = Math.abs(cardCenterX - otherCardCenterX);
				const distanceY = Math.abs(cardCenterY - otherCardCenterY);
				const thresholdX = otherCard.offsetWidth * 0.1;
				const thresholdY = otherCard.offsetHeight * 0.08;
				if (distanceX < thresholdX && distanceY < thresholdY) {
					const snapX = otherCard.offsetLeft;
					const snapY = otherCard.offsetTop - otherCard.offsetHeight * 0.16;
					card.style.left = `${snapX}px`;
					card.style.top = `${snapY}px`;
					const visualLeftRatio = snapX / container.offsetWidth;
					const visualTopRatio = snapY / container.offsetHeight;
					card.dataset.visualLeftRatio = visualLeftRatio;
					card.dataset.visualTopRatio = visualTopRatio;
				}
			}
		});
	}
	function SnapArea(card) {
		const positions = [
			{ x: 0.115, y: 0.825 }, //Digitama deck
			{ x: 0.237, y: 0.825 }, //Hatched egg
			{ x: 0.9163, y: 0.255 }, //Main Deck
			{ x: 0.9163, y: 0.543 } //Trash
		];
		positions.forEach(position => {
			const cardCenterX = card.offsetLeft + card.offsetWidth / 2;
			const cardCenterY = card.offsetTop + card.offsetHeight / 2;
			const distanceX = Math.abs(cardCenterX - (container.offsetWidth * position.x));
			const distanceY = Math.abs(cardCenterY - (container.offsetHeight * position.y));
			const thresholdX = card.offsetWidth * 0.12;
			const thresholdY = card.offsetHeight * 0.1;
			if (distanceX < thresholdX && distanceY < thresholdY) {
				const snapX = (container.offsetWidth * position.x) - card.offsetWidth / 2;
				const snapY = (container.offsetHeight * position.y) - card.offsetHeight / 2;
				card.style.left = `${snapX}px`;
				card.style.top = `${snapY}px`;
				const visualLeftRatio = snapX / container.offsetWidth;
				const visualTopRatio = snapY / container.offsetHeight;
				card.dataset.visualLeftRatio = visualLeftRatio;
				card.dataset.visualTopRatio = visualTopRatio;
			}
		});
	}
	function SnapDice(dice) {
		const positions = [
			{ x: 0.055, y: 0.055 }, //+10
			{ x: 0.100, y: 0.055 }, //+09
			{ x: 0.145, y: 0.055 }, //+08
			{ x: 0.190, y: 0.055 }, //+07
			{ x: 0.235, y: 0.055 }, //+06
			{ x: 0.280, y: 0.055 }, //+05
			{ x: 0.325, y: 0.055 }, //+04
			{ x: 0.370, y: 0.055 }, //+03
			{ x: 0.415, y: 0.055 }, //+02
			{ x: 0.460, y: 0.055 }, //+01
			{ x: 0.500, y: 0.055 }, //+00
			{ x: 0.540, y: 0.055 }, //-01
			{ x: 0.585, y: 0.055 }, //-02
			{ x: 0.630, y: 0.055 }, //-03
			{ x: 0.675, y: 0.055 }, //-04
			{ x: 0.720, y: 0.055 }, //-05
			{ x: 0.765, y: 0.055 }, //-06
			{ x: 0.810, y: 0.055 }, //-07
			{ x: 0.855, y: 0.055 }, //-08
			{ x: 0.900, y: 0.055 }, //-09
			{ x: 0.945, y: 0.055 } //-10
		];
		positions.forEach(position => {
			const diceCenterX = dice.offsetLeft + dice.offsetWidth / 2;
			const diceCenterY = dice.offsetTop + dice.offsetHeight / 2;
			const distanceX = Math.abs(diceCenterX - (container.offsetWidth * position.x));
			const distanceY = Math.abs(diceCenterY - (container.offsetHeight * position.y));
			const thresholdX = dice.offsetWidth * 0.5;
			const thresholdY = dice.offsetHeight * 2.5;
			if (distanceX < thresholdX && distanceY < thresholdY) {
				const snapX = (container.offsetWidth * position.x) - dice.offsetWidth / 2;
				const snapY = (container.offsetHeight * position.y) - dice.offsetHeight / 2;
				dice.style.left = `${snapX}px`;
				dice.style.top = `${snapY}px`;
				const visualLeftRatio = snapX / container.offsetWidth;
				const visualTopRatio = snapY / container.offsetHeight;
				dice.dataset.visualLeftRatio = visualLeftRatio;
				dice.dataset.visualTopRatio = visualTopRatio;
			}
		});
	}
	let selectionBox = null;
	let selectedCards = [];
	let initialMouseX, initialMouseY, initialCardPositions = [];
	function startSelectionBox(e) {
		selectionBox = document.createElement('div');
		selectionBox.style.position = 'absolute';
		selectionBox.style.border = '1px dashed #00f';
		selectionBox.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
		selectionBox.style.pointerEvents = 'none';
		container.appendChild(selectionBox);
		initialMouseX = e.clientX - container.getBoundingClientRect().left;
		initialMouseY = e.clientY - container.getBoundingClientRect().top;
		selectionBox.style.left = `${initialMouseX}px`;
		selectionBox.style.top = `${initialMouseY}px`;
		document.addEventListener('mousemove', resizeSelectionBox);
		document.addEventListener('mouseup', finishSelectionBox);
	}
	function resizeSelectionBox(e) {
		const currentMouseX = e.clientX - container.getBoundingClientRect().left;
		const currentMouseY = e.clientY - container.getBoundingClientRect().top;
		const width = Math.abs(currentMouseX - initialMouseX);
		const height = Math.abs(currentMouseY - initialMouseY);
		selectionBox.style.width = `${width}px`;
		selectionBox.style.height = `${height}px`;
		if (currentMouseX < initialMouseX) {
			selectionBox.style.left = `${currentMouseX}px`;
		}
		if (currentMouseY < initialMouseY) {
			selectionBox.style.top = `${currentMouseY}px`;
		}
		selectedCards = [];
		allCards.forEach(card => {
			const cardRect = card.getBoundingClientRect();
			const boxRect = selectionBox.getBoundingClientRect();
			if (
				cardRect.left >= boxRect.left &&
				cardRect.right <= boxRect.right &&
				cardRect.top >= boxRect.top &&
				cardRect.bottom <= boxRect.bottom
			) {
				selectedCards.push(card);
			}
		});
	}
	function finishSelectionBox() {
		if (selectionBox) {
			container.removeChild(selectionBox);
			selectionBox = null;
			initialCardPositions = selectedCards.map(card => ({
				card,
				initialX: card.offsetLeft,
				initialY: card.offsetTop
			}));
			if (selectedCards.length > 0) {
				document.addEventListener('mousemove', moveSelectedCards);
				document.addEventListener('mouseup', stopMoveSelectedCards);
			}
		}
	}
	function moveSelectedCards(e) {
		const dx = e.clientX - container.getBoundingClientRect().left - initialMouseX;
		const dy = e.clientY - container.getBoundingClientRect().top - initialMouseY;
		selectedCards.forEach(({ card, initialX, initialY }) => {
			const newX = initialX + dx;
			const newY = initialY + dy;
			card.style.left = `${newX}px`;
			card.style.top = `${newY}px`;
		});
	}
	function stopMoveSelectedCards() {
		document.removeEventListener('mousemove', moveSelectedCards);
		document.removeEventListener('mouseup', stopMoveSelectedCards);
		selectedCards = [];
	}
	container.addEventListener('mousedown', (e) => {
		if (isSmartphone()) {} else {
			if (e.target === container) {
				startSelectionBox(e);
			}
		}
	});
    function addDice() {
        const dice = document.createElement('img');
		const containerWidth = container.offsetWidth;
        dice.src = diceUrl;
        dice.className = 'card';
        dice.style.width = (containerWidth / 25) + 'px';
        dice.style.height = 'auto';
        dice.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        container.appendChild(dice);
        makeDraggable(dice);
        HomeDice(dice);
    }
    function HomeDice(dice) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const diceWidth = dice.offsetWidth;
        const diceHeight = dice.offsetHeight;
        const defaultCenterXRatio = 0.483;
        const defaultCenterYRatio = 0.024;
        dice.dataset.defaultCenterXRatio = defaultCenterXRatio;
        dice.dataset.defaultCenterYRatio = defaultCenterYRatio;
        dice.dataset.visualLeftRatio = defaultCenterXRatio;
        dice.dataset.visualTopRatio = defaultCenterYRatio;
        DicePlace(dice);
    }
    function adjustContainerSize() {
		const backgroundImg = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/Layout.png';
		const img = new Image();
		img.src = backgroundImg;
		img.onload = function() {
			const bannerHeight = document.getElementById('banner').offsetHeight;
			const buttonsBannerHeight = document.getElementById('buttons-banner').offsetHeight;
			const imgWidth = img.width;
			const imgHeight = img.height;
			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight - (bannerHeight + buttonsBannerHeight);
			const imgAspectRatio = imgWidth / imgHeight;
			const windowAspectRatio = windowWidth / windowHeight;
			let newWidth, newHeight;
			if (windowAspectRatio > imgAspectRatio) {
				newHeight = windowHeight;
				newWidth = newHeight * imgAspectRatio;
			} else {
				newWidth = windowWidth;
				newHeight = newWidth / imgAspectRatio;
			}
			container.style.width = `${newWidth}px`;
			container.style.height = `${newHeight}px`;
			container.style.position = 'absolute';
			container.style.left = '50%';
			container.style.transform = 'translateX(-50%)';
			CardSize();
			DiceSize();
			CountSize();
		};
	}
	function CardSize() {
        const cards = document.querySelectorAll('.card');
		const containerWidth = container.offsetWidth;
        cards.forEach(card => {
            if (!card.src.includes(diceUrl)) { 
                card.style.width = (containerWidth / 10) + 'px';
                CardPlace(card);
            }
        });
    }
    function DiceSize() {
        const dice = document.querySelectorAll('.card');
		const containerWidth = container.offsetWidth;
        dice.forEach(d => {
            if (d.src.includes(diceUrl)) { 
                d.style.width = (containerWidth / 25) + 'px';
                DicePlace(d);
            }
        });
    }
	function CountSize() {
		const counters = document.querySelectorAll('.counter');
		const containerWidth = container.offsetWidth;
		const fontSize = containerWidth / 40 + 'px';
		counters.forEach(counter => {
			counter.style.fontSize = fontSize;
		});
	}
	function DicePlace(dice) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const defaultCenterXRatio = parseFloat(dice.dataset.defaultCenterXRatio);
        const defaultCenterYRatio = parseFloat(dice.dataset.defaultCenterYRatio);
        const visualLeftRatio = parseFloat(dice.dataset.visualLeftRatio);
        const visualTopRatio = parseFloat(dice.dataset.visualTopRatio);
        const diceWidth = dice.offsetWidth;
        const diceHeight = dice.offsetHeight;
        const newX = visualLeftRatio * containerWidth - defaultCenterXRatio;
        const newY = visualTopRatio * containerHeight - defaultCenterYRatio;
        dice.style.left = newX + 'px';
        dice.style.top = newY + 'px';
    }
	function CardPlace(card) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const defaultCenterXRatio = parseFloat(card.dataset.defaultCenterXRatio);
        const defaultCenterYRatio = parseFloat(card.dataset.defaultCenterYRatio);
        const visualLeftRatio = parseFloat(card.dataset.visualLeftRatio);
        const visualTopRatio = parseFloat(card.dataset.visualTopRatio);
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        const newX = visualLeftRatio * containerWidth - defaultCenterXRatio;
        const newY = visualTopRatio * containerHeight - defaultCenterYRatio;
        card.style.left = newX + 'px';
        card.style.top = newY + 'px';
    }
	
	function HomeDeck(card) {
		const containerWidth = container.offsetWidth;
		const containerHeight = container.offsetHeight;
		const cardWidth = card.offsetWidth;
		const cardHeight = card.offsetHeight;
		let defaultCenterXRatio, defaultCenterYRatio;
		if (card.dataset.decktype === "Egg") 
			{defaultCenterXRatio = 0.065;defaultCenterYRatio = 0.708;} 
			else 
			{defaultCenterXRatio = 0.867;defaultCenterYRatio = 0.137;}
		const defaultCenterX = containerWidth * defaultCenterXRatio;
		const defaultCenterY = containerHeight * defaultCenterYRatio;
		card.dataset.defaultCenterXRatio = defaultCenterXRatio;
		card.dataset.defaultCenterYRatio = defaultCenterYRatio;
		card.dataset.visualLeftRatio = defaultCenterXRatio;
		card.dataset.visualTopRatio = defaultCenterYRatio;
		card.style.transition = 'transform 0.3s';
		card.style.transform = 'rotate(0deg)';
		card.src = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/Back.png';
		CardPlace(card);
		ReCount();
	}
	function ShowInfo(event) {
		if (isSmartphone()) {} else {
			const card = event.currentTarget;
			const infoBox = document.createElement('div');
			infoBox.style.position = 'absolute';
			infoBox.style.left = `${card.offsetLeft + card.offsetWidth}px`;
			infoBox.style.top = `${card.offsetTop}px`;
			infoBox.style.width = `${2.1 * card.offsetHeight}px`;
			infoBox.style.backgroundColor = 'rgba(128, 128, 128, 0.9)';
			infoBox.style.color = 'white';
			infoBox.style.fontSize = 'calc(1.0vw)';
			infoBox.style.padding = '5px';
			infoBox.style.display = 'flex';
			infoBox.style.alignItems = 'flex-start';
			infoBox.style.justifyContent = 'center';
			infoBox.style.textAlign = 'left';
			infoBox.style.borderRadius = '5px';
			infoBox.style.boxShadow = '0 0 3px rgba(0, 0, 0, 1)';
			infoBox.style.zIndex = 10000;
			const combinedText = `${card.dataset.name}\n${card.dataset.mainEffect}\n${card.dataset.sourceEffect}`;
			const numCharacters = combinedText.length;
			const fontSize = parseFloat(infoBox.style.fontSize);
			const boxWidth = parseFloat(infoBox.style.width);
			const charsPerLine = Math.floor(boxWidth / fontSize);
			const numLines = Math.ceil(numCharacters / charsPerLine);
			const calculatedHeight = numLines * fontSize + 3 * fontSize;
			infoBox.style.height = `${calculatedHeight}px`;
			infoBox.innerHTML = `
				<strong>${card.dataset.name}<br>
				<br>
				${card.dataset.mainEffect}<br>
				<br>
				${card.dataset.sourceEffect}
			`;
			container.appendChild(infoBox);
			const removeInfoBox = () => infoBox.remove();
			const removeTimeout = setTimeout(removeInfoBox, 6000);
			function removeOnMouseMove() {
				infoBox.remove();
				clearTimeout(removeTimeout);
				card.removeEventListener('mousemove', removeOnMouseMove);
			}
			card.addEventListener('mousemove', removeOnMouseMove);
		}
	}
	function Hovering(card) {
		if (isSmartphone()) {} else {
			let hoverTimeout;
			let isHovered = false;
			card.addEventListener('mouseenter', () => {
				isHovered = true;
				hoverTimeout = setTimeout(() => {
					if (isHovered) {
						ShowInfo({ currentTarget: card });
					}
				}, 2000);
			});
			card.addEventListener('mouseleave', () => {
				isHovered = false;
				clearTimeout(hoverTimeout);
			});
			card.addEventListener('mousemove', () => {
				isHovered = true;
			});
		}
	}
	
	function ToClip(text) {
		const dummyInput = document.createElement('textarea');
		document.body.appendChild(dummyInput);
		dummyInput.value = text;
		dummyInput.select();
		document.execCommand('copy');
		document.body.removeChild(dummyInput);
		alert('Deck link copied to clipboard!');
	}