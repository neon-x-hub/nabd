export class AudioManager {
  constructor({ debug = false } = {}) {
    this.debug = debug;
    this.activeAudios = [];
    this.activeTimeouts = [];
    this.muted = false;
    this.masterVolume = 1.0;
  }

  playTracks(tracks = []) {
    this.stopAll();

    for (const track of tracks) {
      if (!track || !track.src) continue;

      const startMs = Math.max(0, Number(track.start ?? track.startTime ?? 0));
      const offsetSec = Math.max(0, Number(track.offset ?? 0)) / 1000;
      const trackVolume = Math.max(0, Math.min(1, Number(track.volume ?? 1.0)));
      const loop = Boolean(track.loop);
      const playbackRate = Number(track.playbackRate ?? 1.0);

      const audio = new Audio();
      audio.src = track.src;
      audio.preload = "auto";
      audio.volume = this.muted ? 0 : trackVolume * this.masterVolume;
      audio.loop = loop;
      if (playbackRate !== 1.0) {
        audio.playbackRate = playbackRate;
      }
      this.activeAudios.push(audio);

      const timeoutId = setTimeout(() => {
        if (offsetSec > 0) {
          try {
            audio.currentTime = offsetSec;
          } catch (e) {}
        }
        const promise = audio.play();
        if (promise?.catch) {
          promise.catch((err) => {
            if (this.debug) {
              console.warn(`[nabd/audio] Playback failed for "${track.id || track.src}":`, err.message);
            }
          });
        }

        if (track.duration != null && Number(track.duration) > 0) {
          const stopTimeoutId = setTimeout(() => {
            try {
              audio.pause();
              audio.currentTime = 0;
            } catch (e) {}
          }, Number(track.duration));
          this.activeTimeouts.push(stopTimeoutId);
        }
      }, startMs);

      this.activeTimeouts.push(timeoutId);
    }
  }

  stopAll() {
    for (const id of this.activeTimeouts) {
      clearTimeout(id);
    }
    this.activeTimeouts = [];

    for (const audio of this.activeAudios) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }
    this.activeAudios = [];
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    for (const audio of this.activeAudios) {
      audio.muted = this.muted;
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, Number(volume)));
    for (const audio of this.activeAudios) {
      audio.volume = this.masterVolume;
    }
  }
}
