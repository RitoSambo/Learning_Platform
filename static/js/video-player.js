// Video Player and Interaction Tracking JavaScript
class VideoPlayer {
    constructor(tutorialId) {
        this.tutorialId = tutorialId;
        this.interactionCounts = {
            play: 0,
            pause: 0,
            replay: 0
        };
        this.player = null;
        this.init();
    }

    init() {
        this.loadYouTubeAPI();
        this.setupEventListeners();
    }

    loadYouTubeAPI() {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    embedVideo(videoUrl) {
        const container = document.getElementById('videoContainer');
        if (!container) return;

        // Extract video ID from YouTube URL
        let videoId = this.extractVideoId(videoUrl);
        
        if (videoId) {
            this.createYouTubeEmbed(container, videoId);
        } else {
            this.createFallbackEmbed(container, videoUrl);
        }
    }

    extractVideoId(videoUrl) {
        let videoId = '';
        if (videoUrl.includes('youtube.com/watch?v=')) {
            videoId = videoUrl.split('v=')[1];
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
        } else if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1];
        }
        return videoId;
    }

    createYouTubeEmbed(container, videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.id = 'videoPlayer';
        container.appendChild(iframe);

        // Setup YouTube API when ready
        window.onYouTubeIframeAPIReady = () => {
            this.player = new YT.Player('videoPlayer', {
                events: {
                    'onStateChange': this.onPlayerStateChange.bind(this)
                }
            });
        };
    }

    createFallbackEmbed(container, videoUrl) {
        container.innerHTML = `
            <div class="d-flex align-items-center justify-content-center" style="height: 400px;">
                <div class="text-center">
                    <i class="fas fa-video fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Video Player</h5>
                    <p class="text-muted">Video URL: ${videoUrl}</p>
                    <a href="${videoUrl}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt me-2"></i>Open Video
                    </a>
                </div>
            </div>
        `;
    }

    onPlayerStateChange(event) {
        switch(event.data) {
            case YT.PlayerState.PLAYING:
                this.recordInteraction('play');
                break;
            case YT.PlayerState.PAUSED:
                this.recordInteraction('pause');
                break;
            case YT.PlayerState.ENDED:
                this.recordInteraction('replay');
                break;
        }
    }

    recordInteraction(interactionType) {
        // Update local counter
        this.interactionCounts[interactionType]++;
        this.updateInteractionDisplay();
        
        // Send to server
        this.sendInteractionToServer(interactionType);
    }

    sendInteractionToServer(interactionType) {
        fetch('/api/interaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tutorial_id: this.tutorialId,
                interaction_type: interactionType
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`${interactionType} interaction recorded successfully`);
            } else {
                console.error('Failed to record interaction:', data.error);
            }
        })
        .catch(error => {
            console.error('Error recording interaction:', error);
        });
    }

    updateInteractionDisplay() {
        const playCount = document.getElementById('playCount');
        const pauseCount = document.getElementById('pauseCount');
        const replayCount = document.getElementById('replayCount');

        if (playCount) playCount.textContent = this.interactionCounts.play;
        if (pauseCount) pauseCount.textContent = this.interactionCounts.pause;
        if (replayCount) replayCount.textContent = this.interactionCounts.replay;
    }

    setupEventListeners() {
        // Add manual interaction buttons event listeners
        document.querySelectorAll('[data-interaction]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const interactionType = button.getAttribute('data-interaction');
                this.recordInteraction(interactionType);
            });
        });
    }
}

// Global function for backward compatibility
function recordInteraction(interactionType) {
    if (window.videoPlayer) {
        window.videoPlayer.recordInteraction(interactionType);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a tutorial page
    const videoContainer = document.getElementById('videoContainer');
    if (videoContainer) {
        // Get tutorial ID from the container
        const container = document.querySelector('[data-tutorial-id]');
        if (container) {
            const tutorialId = container.getAttribute('data-tutorial-id');
            const videoUrl = container.getAttribute('data-video-url');
            
            if (tutorialId && videoUrl) {
                window.videoPlayer = new VideoPlayer(parseInt(tutorialId));
                window.videoPlayer.embedVideo(videoUrl);
            }
        }
    }
});
