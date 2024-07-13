const fetch = require('node-fetch');
const dotenv = require('dotenv').config();

const roleId = process.env.ROLE_ID;
const interval = process.env.INTERVAL_IN_SECONDS; // Interval in Sekunden
const eventName = process.env.EVENT_NAME; // Der Name des Events
const eventLocation = process.env.EVENT_LOCATION; // Die Location des Events
const webhookUrl = process.env.WEBHOOK_URL; // Webhook-URL

const url = 'https://api.soopy.dev/skyblock/chevents/get'; // API-URL

var lastStatus = false; // Speichert den letzten Status, ob das Event aktiv war

function sendDiscordMessage(message) {
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: message,
            username: 'Powder Tracker', // Optional: Custom-Bot-Name
        })
    })
        .then(res => res.text())
        .then(text => console.log(text))
        .catch(err => console.error('Fehler beim Senden der Webhook-Nachricht:', err));
}

setInterval(() => {
    fetch(url)
        .then(res => res.json())
        .then(json => {
            const eventInfo = json.data.running_events[eventLocation];
            const specificEvent = eventInfo && eventInfo.find(e => e.event === eventName);

            // Überprüfung, ob das Event aktiv ist
            const currentTime = json.data.curr_time;
            const eventActive = specificEvent && currentTime <= specificEvent.ends_at;
            const remainingTimeMs = specificEvent ? specificEvent.ends_at - currentTime : 0; // Verbleibende Zeit in Millisekunden
            const remainingTimeMin = Math.floor(remainingTimeMs / 60000); // Verbleibende Zeit in Minuten
            const lobbyCount = specificEvent ? specificEvent.lobby_count : 0; // Anzahl der Lobbys

            console.log(`Event '${eventName}' in '${eventLocation}': ${eventActive ? 'Aktiv' : 'Inaktiv'}`);

            if (eventActive && !lastStatus) {
                const message = `<@&${roleId}> Hey there is a '${eventName}' in '${eventLocation}' aktiv. Time Left: ${remainingTimeMin} Min. Lobbys: ${lobbyCount}.`;
                sendDiscordMessage(message);
                lastStatus = true; // Aktualisierung des Status, um Mehrfachbenachrichtigungen zu vermeiden
            } else if (!eventActive && lastStatus) {
                lastStatus = false; // Zurücksetzen des Status
            }
        })
        .catch(err => {
            console.error('Fehler beim Abrufen der API:', err);
        });
}, interval * 1000);
