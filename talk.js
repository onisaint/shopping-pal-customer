function speakToUser(text) {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance();
        const voices = window.speechSynthesis.getVoices();
        msg.voice = voices[4];
        msg.lang = 'en-UK';
        msg.text = text;
        speechSynthesis.speak(msg);
    } else {
        return;
    }
}