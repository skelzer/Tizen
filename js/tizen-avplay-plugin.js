/**
 * Tizen AVPlay MediaPlayer Plugin for jellyfin-web PlaybackManager
 * Registers Tizen AVPlay as a hardware-accelerated player option
 * 
 * Priority: 100 (higher than HTML5's 0) to ensure Tizen is preferred
 * Special handling for Dolby Vision content
 */

(function() {
   'use strict';
   
   // Only register plugin if we're on Tizen platform
   if (typeof webapis === 'undefined' || !webapis.avplay) {
      console.log('[TizenPlugin] Tizen AVPlay not available, skipping plugin registration');
      return;
   }
   
   class TizenAVPlayPlugin {
      
      name() {
         return 'TizenAVPlay';
      }
      
      type() {
         return 'mediaplayer';
      }
      
      id() {
         return 'tizenavplay';
      }
      
      priority() {
         return 100;
      }
      
      /**
       * Determine if this player can play the given item
       * @param {Object} item - BaseItemDto to check
       * @returns {Promise<boolean>}
       */
      canPlayItem(item) {
         return Promise.resolve((function() {
            // Check if we're on Tizen platform
            if (typeof webapis === 'undefined' || !webapis.avplay) {
               return false;
            }
            
            // Prefer Tizen AVPlay for Dolby Vision (hardware acceleration)
            if (item.MediaSources && item.MediaSources.length > 0) {
               const mediaSource = item.MediaSources[0];
               const videoStream = mediaSource.MediaStreams?.find(s => s.Type === 'Video');
               
               if (videoStream && videoStream.VideoRangeType === 'DOVI') {
                  console.log('[TizenPlugin] Dolby Vision detected - prefer Tizen AVPlay');
                  return true;
               }
            }
            
            // Let Tizen handle all video playback for hardware acceleration
            if (item.MediaType === 'Video') {
               return true;
            }
            
            return false;
         })());
      }
      
      /**
       * Determine if this player can play the media source
       * More granular than canPlayItem
       * @param {Object} mediaSource - MediaSource to check
       * @returns {Promise<boolean>}
       */
      canPlayMediaSource(mediaSource) {
         return Promise.resolve((function() {
            if (typeof webapis === 'undefined' || !webapis.avplay) {
               return false;
            }
            
            // Check container support
            const container = (mediaSource.Container || '').toLowerCase();
            const supportedContainers = ['mp4', 'mkv', 'webm', 'mov', 'm3u8', 'ts', 'mpd'];
            
            if (!supportedContainers.includes(container)) {
               console.log('[TizenPlugin] Unsupported container:', container);
               return false;
            }
            
            // Check video codec support
            const videoStream = mediaSource.MediaStreams?.find(s => s.Type === 'Video');
            if (videoStream) {
               const codec = (videoStream.Codec || '').toLowerCase();
               const supportedCodecs = ['h264', 'hevc', 'h265', 'vp8', 'vp9', 'av1'];
               
               if (!supportedCodecs.includes(codec)) {
                  console.log('[TizenPlugin] Unsupported video codec:', codec);
                  return false;
               }
            }
            
            return true;
         })());
      }
      
      /**
       * Get device profile for PlaybackInfo requests
       * Delegates to existing Tizen adapter for consistency
       * @param {Function} profileBuilder - jellyfin-web's profile builder
       * @returns {Object} Device profile
       */
      getDeviceProfile(profileBuilder) {
         // Delegate to our existing Tizen adapter
         if (typeof NativeShell !== 'undefined' && NativeShell.AppHost) {
            return NativeShell.AppHost.getDeviceProfile(profileBuilder);
         }
         
         // Fallback if NativeShell not available
         if (typeof profileBuilder === 'function') {
            return profileBuilder({
               enableMkvProgressive: false,
               enableSsaRender: true
            });
         }
         
         return {};
      }
      
      /**
       * Play or resume playback
       * Note: Actual AVPlay setup is handled by video-player-adapter.js
       * This is called by PlaybackManager after player is created
       * @returns {Promise}
       */
      play() {
         return Promise.resolve();
      }
      
      pause() {
         return Promise.resolve();
      }
      
      stop() {
         return Promise.resolve();
      }
      
      /**
       * Seek to position in ticks
       * @param {number} ticks - Position in ticks (ms * 10000)
       * @returns {Promise}
       */
      seek(ticks) {
         return Promise.resolve();
      }
      
      /**
       * Get current playback position in seconds
       * Note: AVPlay returns milliseconds, we convert to seconds for consistency
       * @returns {number}
       */
      currentTime() {
         if (typeof webapis !== 'undefined' && webapis.avplay) {
            try {
               return webapis.avplay.getCurrentTime() / 1000;
            } catch (error) {
               console.error('[TizenPlugin] getCurrentTime error:', error);
               return 0;
            }
         }
         return 0;
      }
      
      /**
       * Get total duration in seconds
       * Note: AVPlay returns milliseconds, we convert to seconds for consistency
       * @returns {number}
       */
      duration() {
         if (typeof webapis !== 'undefined' && webapis.avplay) {
            try {
               return webapis.avplay.getDuration() / 1000;
            } catch (error) {
               console.error('[TizenPlugin] getDuration error:', error);
               return 0;
            }
         }
         return 0;
      }
      
      paused() {
         if (typeof webapis !== 'undefined' && webapis.avplay) {
            try {
               const state = webapis.avplay.getState();
               return state === 'PAUSED';
            } catch (error) {
               return true;
            }
         }
         return true;
      }
      
      /**
       * Set volume level (0-100)
       * Tizen handles volume at system level
       * @param {number} val - Volume level
       */
      setVolume(val) {
         console.log('[TizenPlugin] setVolume called (handled by system):', val);
      }
      
      /**
       * Get current volume level (0-100)
       * @returns {number}
       */
      getVolume() {
         return 100;
      }
      
      /**
       * Set audio stream index
       * @param {number} index - Stream index from MediaSource
       */
      setAudioStreamIndex(index) {
         console.log('[TizenPlugin] setAudioStreamIndex:', index);
      }
      
      /**
       * Set subtitle stream index
       * @param {number} index - Stream index from MediaSource (-1 to disable)
       */
      setSubtitleStreamIndex(index) {
         console.log('[TizenPlugin] setSubtitleStreamIndex:', index);
      }
      
      /**
       * Supports changing playback speed
       * @returns {boolean}
       */
      supportsPlaybackRate() {
         return false; // Tizen AVPlay doesn't support playback rate
      }
      
      canSeekMs() {
         return true;
      }
      
      supportsFullscreen() {
         return true;
      }
   }
   
   /**
    * Register plugin with PlaybackManager when available
    */
   function registerWithPlaybackManager() {
      if (typeof window.playbackManager !== 'undefined' && window.playbackManager.registerPlayer) {
         try {
            const plugin = new TizenAVPlayPlugin();
            window.playbackManager.registerPlayer(plugin);
            console.log('[TizenPlugin] Successfully registered with PlaybackManager');
            console.log('[TizenPlugin] Priority: 100 (higher than HTML5)');
         } catch (error) {
            console.error('[TizenPlugin] Failed to register plugin:', error);
         }
      } else {
         console.log('[TizenPlugin] PlaybackManager not available yet, will retry...');
         setTimeout(registerWithPlaybackManager, 500);
      }
   }
   
   // Register on DOMContentLoaded or immediately if already loaded
   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerWithPlaybackManager);
   } else {
      registerWithPlaybackManager();
   }
   
})();
