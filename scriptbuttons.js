//Parte del codigo que sera scrip de botones
    const HelpButton = document.getElementById('help-button');
    const importButton = document.getElementById('import-button');
    const popup = document.getElementById('popup');
    const goBackButton = document.getElementById('go-back-button');
    const loadCodeButton = document.getElementById('load-code-button');
	const mulliganButton = document.getElementById('mulligan-button');
	
	const messageButton = document.getElementById('message-button');
	const messagePopup = document.getElementById('message-popup');
	const sendMessageButton = document.getElementById('send-message-button');
	const backMessageButton = document.getElementById('back-message-button');
		
	const shareDeckButton = document.getElementById('share-deck-button');
	shareDeckButton.addEventListener('click', ShareLink);
	
	
	goBackButton.addEventListener('click', () => {
        popup.style.display = 'none';
    });
	window.addEventListener('resize', () => {
    adjustContainerSize();
	});
	HelpButton.addEventListener('click', () => {
        alert('Cards are loaded by list, use the quantity followed by the card-codes, Example; 4 BT14-033, you can copy/paste from the "Export" button in https://digimoncard.io/, or manually add one by one. Any double clicked card in the trash will return to the bottom of the deck. If you have any other questions please contact me, (DracoFabz) in the button Contact DracoFabz.');
    });
	// Función para abrir el popup de enviar mensaje
	function openMessagePopup() {
		messagePopup.style.display = 'block';
	}
	function isSmartphone() {
		return /Mobi|Android/i.test(navigator.userAgent);
	}
	function ShareLink() {
		const cards = container.getElementsByClassName('card');
		const deckEntries = [];
		Array.from(cards).forEach(card => {
			if (!card.src.includes('dice')) {
				const cardCode = card.dataset.originalImageUrl.split('/').pop().split('.')[0];
				const deckType = card.dataset.decktype === "Deck" ? "D" : "E";
				deckEntries.push(`${1}_${cardCode}_${deckType}`);
			}
		});
		const groupedEntries = deckEntries.reduce((acc, entry) => {
			if (acc[entry]) {
				acc[entry]++;
			} else {
				acc[entry] = 1;
			}
			return acc;
		}, {});
		const finalDeckString = Object.keys(groupedEntries).map(entry => {
			return `${groupedEntries[entry]}_${entry.split('_')[1]}_${entry.split('_')[2]}`;
		}).join(';');
		const fullUrl = `https://dracofabz.github.io/?deck=${finalDeckString}`;
		ToClip(fullUrl);
	}


// Mostrar el popup de mensajes
messageButton.addEventListener('click', () => {
    messagePopup.style.display = 'block';
});

// Botón Atrás: cerrar y limpiar campos
backMessageButton.addEventListener('click', () => {
    messagePopup.style.display = 'none';
    clearMessageForm();
});

// Botón Enviar: enviar mensaje a Firebase
sendMessageButton.addEventListener('click', () => {
    const name = document.getElementById('name-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    const message = document.getElementById('message-input').value.trim();

    if (name === '' || phone === '' || message === '') {
        alert('Por favor llena todos los campos.');
        return;
    }

    sendMessageToFirebase(name, phone, message);
    messagePopup.style.display = 'none';
    clearMessageForm();
});

// Función para limpiar los campos
function clearMessageForm() {
    document.getElementById('name-input').value = '';
    document.getElementById('phone-input').value = '';
    document.getElementById('message-input').value = '';
}

// Función para mandar el mensaje a Firebase
function sendMessageToFirebase(name, phone, message) {
    const database = firebase.database();
    const messagesRef = database.ref('messages');
    const newMessageRef = messagesRef.push();
    newMessageRef.set({
        name: name,
        phone: phone,
        message: message,
        timestamp: Date.now()
    }).then(() => {
        alert('¡Mensaje enviado exitosamente!');
    }).catch((error) => {
        alert('Error al enviar el mensaje: ' + error.message);
    });
}