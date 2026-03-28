// Simple notification sound using Web Audio API
class NotificationSound {
    constructor() {
        this.audioContext = null;
        this.isEnabled = true;
    }

    init() {
        if (!this.audioContext && window.AudioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    play() {
        if (!this.isEnabled) return;
        
        try {
            this.init();
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Create a simple beep sound
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;

            oscillator.start(now);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
            oscillator.stop(now + 0.5);

        } catch (error) {
            console.log('Audio play failed:', error);
        }
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}

export default new NotificationSound();