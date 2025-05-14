	loadCodeButton.addEventListener('click', LoadDeck);
	const clearDeckButton = document.getElementById('clear-deck-button');
	clearDeckButton.addEventListener('click', ClearDeck);
	function ClearDeck() {
		const elements = container.children;
        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            if (!element.src.includes(diceUrl)) {
                container.removeChild(element);}}
    }
	let totalCardsToLoad = 0;
	let loadedCards = 0;
	let isWaiting = false;
	function LoadURL(deckParam) {
		const cardEntries = deckParam.split(';');
		let totalCardsInURL = 0;
		cardEntries.forEach(entry => {
			const [num, code, type] = entry.split('_');
			if (!isNaN(num) && code && (type === 'D' || type === 'E')) {
				totalCardsInURL += parseInt(num);
			}
		});
		totalCardsToLoad += totalCardsInURL;
		cardEntries.forEach(entry => {
			const [num, code, type] = entry.split('_');
			if (!isNaN(num) && code && (type === 'D' || type === 'E')) {
				const deckType = type === 'D' ? "Deck" : "Egg";
				addCards(parseInt(num), code.toUpperCase().trim(), deckType);
			}
		});
	}
	function LoadDeck() {
		let currentDeckType = "Deck";
		let input = document.getElementById('text-input').value.trim();
		input = input.replace(/[()]/g, '');
		const lines = input.split('\n');
		const cardEntries = [];
		let totalCardsInDeck = 0;
		lines.forEach(line => {
			line = line.trim();
			if (line.startsWith('//')) {
				if (line.toLowerCase().includes('egg deck')) {
					currentDeckType = "Egg";
				} else {
					currentDeckType = "Deck";
				}
				return;
			}
			const firstChar = line.charAt(0);
			if (!isNaN(firstChar)) {
				const parts = line.split(' ');
				const numCards = parseInt(firstChar);
				const cardCode = parts[parts.length - 1].toUpperCase().trim();
				if (!isNaN(numCards) && cardCode) {
					totalCardsInDeck += numCards;
					for (let i = 0; i < numCards; i++) {
						cardEntries.push({ code: cardCode, type: currentDeckType });
					}
				}
			}
		});
		totalCardsToLoad += totalCardsInDeck;
		Shuffling(cardEntries);
		cardEntries.forEach(entry => {
			addCards(1, entry.code, entry.type);
		});
		popup.style.display = 'none';
	}
	function addCards(num, code, type) {
            const apiUrl = `https://digimoncard.io/api/search.php?card=${code}`;
            GetInfo(apiUrl)
                .then(description => {
                    const cardPromises = [];
                    for (let i = 0; i < num; i++) {
                        cardPromises.push(GetCardInfo(code, type, description));
                    }
                    return cardPromises;
                })
                .then(cardPromises => {
                    updateLoadingBar(cardPromises);
                })
                .catch(error => {
                    console.error('Error fetching card description:', error);
                });
            popup.style.display = 'none';
        }
	let mulliganTriggered = false;
	function updateLoadingBar(cardPromises) {
		mulliganTriggered = false;
		document.getElementById('loading-container').style.display = 'block';
		const loadingBar = document.getElementById('loading-bar');
		function updateProgress() {
			const progress = (loadedCards / totalCardsToLoad) * 100;
			loadingBar.style.width = `${progress}%`;
			loadingBar.textContent = `${Math.round(progress)}%`;
			if (loadedCards >= totalCardsToLoad) {
				clearInterval(progressInterval);
				document.getElementById('loading-container').style.display = 'none';
				if (document.getElementById('mulligan-checkbox').checked && !mulliganTriggered) {
					mulliganTriggered = true;
					Mulligan();
				}
			}
		}
		let progressInterval = setInterval(updateProgress, 100);
		Promise.all(cardPromises)
			.then(() => {
				loadedCards += cardPromises.length;
			})
			.catch(error => {
				console.error('Error loading one or more cards:', error);
			});
	}
	function GetInfo(apiUrl) {
		return fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(apiUrl))
			.then(response => response.text())
			.then(responseText => {
				const data = JSON.parse(responseText);
				if (data.length > 0) {
					const cardData = data[0];
					return {
						name: cardData.name,
						main_effect: cardData.main_effect,
						source_effect: cardData.source_effect};
				} else {return {
						name: 'Unknown',
						main_effect: 'No effect available',
						source_effect: 'No effect available'
					};
				}
			})
			.catch(() => ({
				name: 'Error',
				main_effect: 'Failed to fetch effect',
				source_effect: 'Failed to fetch effect'
			}));
	}
	function GetCardInfo(code, type, description) {
		return new Promise((resolve, reject) => {
			const containerWidth = container.offsetWidth;
			const card = document.createElement('img');
			const imageUrl = `https://images.digimoncard.io/images/cards/${code}.jpg`;
			const CardBack = 'https://github.com/DracoFabz/DracoFabz.github.io/raw/main/Back.png';
			const img = new Image();
			img.onload = function() {
				card.src = imageUrl;
				card.dataset.originalImageUrl = imageUrl;
				card.dataset.name = description.name;
				card.dataset.mainEffect = description.main_effect;
				card.dataset.sourceEffect = description.source_effect;
				resolve(card);
			};
			img.onerror = function() {
				card.src = CardBack;
				card.dataset.originalImageUrl = CardBack;
				card.dataset.name = description.name;
				card.dataset.mainEffect = description.main_effect;
				card.dataset.sourceEffect = description.source_effect;
				resolve(card);
			};
			img.src = imageUrl;
			card.className = 'card';
			card.style.width = (containerWidth / 10) + 'px';
			card.style.height = 'auto';
			card.dataset.decktype = type;
			container.appendChild(card);
			HomeDeck(card);
			makeDraggable(card);
			Hovering(card);
		});
	}