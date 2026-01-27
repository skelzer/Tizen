/**
 * Tizen Video Service - Hardware-accelerated video playback using AVPlay APIs
 */
/* global webapis, navigator */

let isAVPlayAvailable = false;

export const isTizen = () => {
	if (typeof window === 'undefined') return false;
	if (typeof window.tizen !== 'undefined') return true;
	const ua = navigator.userAgent.toLowerCase();
	return ua.includes('tizen');
};

export const getTizenVersion = () => {
	// Try to get from webapis
	if (typeof webapis !== 'undefined' && webapis.productinfo) {
		try {
			const firmware = webapis.productinfo.getFirmware();
			// Firmware format varies, try to extract year
			const match = firmware?.match(/(\d{4})/);
			if (match) {
				const year = parseInt(match[1], 10);
				// Map years to approximate Tizen versions
				if (year >= 2024) return 8;
				if (year >= 2023) return 7;
				if (year >= 2022) return 6.5;
				if (year >= 2021) return 6;
				if (year >= 2020) return 5.5;
				if (year >= 2019) return 5;
				if (year >= 2018) return 4;
				if (year >= 2017) return 3;
			}
		} catch (e) {
			console.log('[tizenVideo] Could not get firmware version');
		}
	}
	return 4; // Default assumption
};

export const initTizenAPI = async () => {
	if (!isTizen()) {
		console.log('[tizenVideo] Not on Tizen platform');
		return false;
	}

	try {
		if (typeof webapis !== 'undefined' && webapis.avplay) {
			isAVPlayAvailable = true;
			console.log('[tizenVideo] AVPlay API initialized');
			return true;
		}
	} catch (e) {
		console.warn('[tizenVideo] AVPlay API not available:', e.message);
	}
	return false;
};

const getDefaultCapabilities = () => {
	const tizenVersion = getTizenVersion();
	return {
		tizenVersion,
		modelName: 'Unknown',
		uhd: true,
		uhd8K: false,
		hdr10: tizenVersion >= 4,
		dolbyVision: tizenVersion >= 5,
		dolbyAtmos: tizenVersion >= 4,
		hevc: true,
		av1: tizenVersion >= 6,
		vp9: tizenVersion >= 4,
		dts: true,
		ac3: true,
		eac3: true,
		truehd: tizenVersion >= 5,
		mkv: true,
		nativeHls: true,
		nativeHlsFmp4: true,
		hlsAc3: true
	};
};

export const getMediaCapabilities = async () => {
	const capabilities = getDefaultCapabilities();

	if (typeof webapis === 'undefined') {
		return capabilities;
	}

	try {
		// Get model info
		if (webapis.productinfo) {
			if (typeof webapis.productinfo.getModel === 'function') {
				capabilities.modelName = webapis.productinfo.getModel();
			}

			// Check resolution support
			if (typeof webapis.productinfo.is8KPanelSupported === 'function' &&
				webapis.productinfo.is8KPanelSupported()) {
				capabilities.uhd8K = true;
				capabilities.uhd = true;
			} else if (typeof webapis.productinfo.isUdPanelSupported === 'function' &&
				webapis.productinfo.isUdPanelSupported()) {
				capabilities.uhd = true;
			}
		}

		// Get HDR/Dolby Vision support
		if (webapis.avinfo) {
			if (typeof webapis.avinfo.isHdrTvSupport === 'function') {
				capabilities.hdr10 = webapis.avinfo.isHdrTvSupport();
			}
			if (typeof webapis.avinfo.isDolbyVisionSupport === 'function') {
				capabilities.dolbyVision = webapis.avinfo.isDolbyVisionSupport();
			}
		}
	} catch (e) {
		console.warn('[tizenVideo] Failed to get capabilities:', e.message);
	}

	return capabilities;
};

export const getPlayMethod = (mediaSource, capabilities) => {
	if (!mediaSource) return 'Transcode';

	const container = (mediaSource.Container || '').toLowerCase();
	const videoStream = mediaSource.MediaStreams?.find(s => s.Type === 'Video');
	const audioStream = mediaSource.MediaStreams?.find(s => s.Type === 'Audio');

	const videoCodec = (videoStream?.Codec || '').toLowerCase();
	const supportedVideoCodecs = ['h264', 'avc'];
	if (capabilities.hevc) supportedVideoCodecs.push('hevc', 'h265', 'hev1', 'hvc1');
	if (capabilities.av1) supportedVideoCodecs.push('av1');
	if (capabilities.vp9) supportedVideoCodecs.push('vp9');
	if (capabilities.dolbyVision) supportedVideoCodecs.push('dvhe', 'dvh1');

	const audioCodec = (audioStream?.Codec || '').toLowerCase();
	const supportedAudioCodecs = ['aac', 'mp3', 'flac', 'opus', 'vorbis'];
	if (capabilities.ac3) supportedAudioCodecs.push('ac3');
	if (capabilities.eac3) supportedAudioCodecs.push('eac3');
	if (capabilities.dts) supportedAudioCodecs.push('dts', 'dca');
	if (capabilities.truehd) supportedAudioCodecs.push('truehd');

	const supportedContainers = ['mp4', 'm4v', 'mov', 'ts', 'mpegts', 'mkv', 'matroska', 'webm'];
	if (capabilities.nativeHls) supportedContainers.push('m3u8');

	const videoOk = !videoCodec || supportedVideoCodecs.includes(videoCodec);
	const audioOk = !audioCodec || supportedAudioCodecs.includes(audioCodec);
	const containerOk = !container || supportedContainers.includes(container);

	let hdrOk = true;
	if (videoStream?.VideoRangeType) {
		const rangeType = videoStream.VideoRangeType.toUpperCase();
		if (rangeType.includes('DOLBY') || rangeType.includes('DV')) {
			hdrOk = capabilities.dolbyVision;
		} else if (rangeType.includes('HDR')) {
			hdrOk = capabilities.hdr10;
		}
	}

	console.log('[tizenVideo] getPlayMethod check:', {
		container,
		videoCodec,
		audioCodec,
		videoRange: videoStream?.VideoRangeType,
		videoOk,
		audioOk,
		containerOk,
		hdrOk,
		supportedContainers,
		supportedVideoCodecs,
		supportedAudioCodecs,
		serverSupportsDirectPlay: mediaSource.SupportsDirectPlay
	});

	if (mediaSource.SupportsDirectPlay && videoOk && audioOk && containerOk && hdrOk) {
		return 'DirectPlay';
	}

	if (mediaSource.SupportsDirectStream && videoOk && containerOk) {
		return 'DirectStream';
	}

	return 'Transcode';
};

export const getMimeType = (container) => {
	const mimeTypes = {
		mp4: 'video/mp4',
		m4v: 'video/mp4',
		mkv: 'video/x-matroska',
		matroska: 'video/x-matroska',
		webm: 'video/webm',
		ts: 'video/mp2t',
		mpegts: 'video/mp2t',
		m2ts: 'video/mp2t',
		avi: 'video/x-msvideo',
		mov: 'video/quicktime',
		m3u8: 'application/x-mpegURL',
		mpd: 'application/dash+xml'
	};
	return mimeTypes[container?.toLowerCase()] || 'video/mp4';
};

export const setDisplayWindow = async (rect) => {
	if (!isAVPlayAvailable) return false;

	try {
		webapis.avplay.setDisplayRect(
			rect.x || 0,
			rect.y || 0,
			rect.width || 1920,
			rect.height || 1080
		);
		return true;
	} catch (e) {
		console.warn('[tizenVideo] setDisplayRect failed:', e.message);
		return false;
	}
};

export const registerAppStateObserver = (onForeground, onBackground) => {
	if (typeof document === 'undefined') return () => {};

	const handleVisibilityChange = () => {
		if (document.hidden) {
			onBackground?.();
		} else {
			onForeground?.();
		}
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);

	return () => {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	};
};

export const keepScreenOn = async () => {
	// Tizen handles screen keeping via app lifecycle
	// No explicit API needed - video playback keeps screen on automatically
	return true;
};

export const getAudioOutputInfo = async () => {
	// Tizen doesn't have a direct equivalent to webOS audio output info
	return null;
};

// AVPlay wrapper functions
export const avplayOpen = (url) => {
	if (!isAVPlayAvailable) throw new Error('AVPlay not available');
	webapis.avplay.open(url);
};

export const avplayPrepare = () => {
	return new Promise((resolve, reject) => {
		if (!isAVPlayAvailable) {
			reject(new Error('AVPlay not available'));
			return;
		}
		webapis.avplay.prepareAsync(resolve, reject);
	});
};

export const avplayPlay = () => {
	if (!isAVPlayAvailable) return;
	webapis.avplay.play();
};

export const avplayPause = () => {
	if (!isAVPlayAvailable) return;
	webapis.avplay.pause();
};

export const avplayStop = () => {
	if (!isAVPlayAvailable) return;
	try {
		const state = webapis.avplay.getState();
		if (state !== 'NONE' && state !== 'IDLE') {
			webapis.avplay.stop();
		}
	} catch (e) {
		// Ignore
	}
};

export const avplayClose = () => {
	if (!isAVPlayAvailable) return;
	try {
		webapis.avplay.close();
	} catch (e) {
		// Ignore
	}
};

export const avplaySeek = (timeMs) => {
	return new Promise((resolve, reject) => {
		if (!isAVPlayAvailable) {
			reject(new Error('AVPlay not available'));
			return;
		}
		webapis.avplay.seekTo(timeMs, resolve, reject);
	});
};

export const avplayGetCurrentTime = () => {
	if (!isAVPlayAvailable) return 0;
	try {
		return webapis.avplay.getCurrentTime();
	} catch (e) {
		return 0;
	}
};

export const avplayGetDuration = () => {
	if (!isAVPlayAvailable) return 0;
	try {
		return webapis.avplay.getDuration();
	} catch (e) {
		return 0;
	}
};

export const avplayGetState = () => {
	if (!isAVPlayAvailable) return 'NONE';
	try {
		return webapis.avplay.getState();
	} catch (e) {
		return 'NONE';
	}
};

export const avplaySetListener = (listener) => {
	if (!isAVPlayAvailable) return;
	webapis.avplay.setListener(listener);
};

export const avplaySetSpeed = (speed) => {
	if (!isAVPlayAvailable) return;
	try {
		webapis.avplay.setSpeed(speed);
	} catch (e) {
		console.log('[tizenVideo] setSpeed not supported:', e);
	}
};

export const avplaySetDrm = (drmType, operation, drmData) => {
	if (!isAVPlayAvailable) return;
	webapis.avplay.setDrm(drmType, operation, drmData);
};

export default {
	isTizen,
	getTizenVersion,
	initTizenAPI,
	getMediaCapabilities,
	getPlayMethod,
	getMimeType,
	setDisplayWindow,
	registerAppStateObserver,
	keepScreenOn,
	getAudioOutputInfo,
	avplayOpen,
	avplayPrepare,
	avplayPlay,
	avplayPause,
	avplayStop,
	avplayClose,
	avplaySeek,
	avplayGetCurrentTime,
	avplayGetDuration,
	avplayGetState,
	avplaySetListener,
	avplaySetSpeed,
	avplaySetDrm
};
