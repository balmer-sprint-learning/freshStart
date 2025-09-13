// Clear events from localStorage and reset event counter
localStorage.removeItem('events');
localStorage.removeItem('eventCounter');
console.log('Events data cleared from localStorage');
console.log('localStorage.getItem("events"):', localStorage.getItem('events'));
console.log('localStorage.getItem("eventCounter"):', localStorage.getItem('eventCounter'));
