import CALCULATE from './calculations'
import SHUFFLE   from './shuffle'
import AUDIO     from './audio'
import DEBUG     from './debug'
import LAYOUT    from './layout'
import CONTROLS  from './controls'
import OPTIONS   from './options'
import WIDGET    from './components/widget'
import ARTWORK   from './components/artwork'
import DROPDOWN  from './components/dropdown'

var $doc = $(document),
    apiKey,
    didAutoPlay = false,
    players = [],
    updates = {},
    currentUrl;

var PLAYER = {

    audioEngine: (function() {        
        // TODO Expose the audio engine, so it can be unit-tested
        return AUDIO.available ? AUDIO.html5Driver() : AUDIO.flashDriver();
    }()),

    init: function() {

        var loadTracksData = function($player, links, key) {
                var index = 0,
                playerObj = {node: $player, tracks: []},
                loadUrl = function(link) {
                    var apiUrl = DEBUG.scApiUrl(link.url, apiKey);
                    $.getJSON(apiUrl, function(data) {
                        // DEBUG.log('data loaded', link.url, data);
                        index += 1;
                        if(data.tracks) {
                        // DEBUG.log('data.tracks', data.tracks);
                        playerObj.tracks = playerObj.tracks.concat(data.tracks);

                        } else if(data.duration) {
                            // a secret link fix, till the SC API returns permalink with secret on secret response
                            data.permalink_url = link.url;
                            // if track, add to player
                            playerObj.tracks.push(data);
                        } else if(data.creator) {
                            // it's a group!
                            links.push({url:data.uri + '/tracks'});
                        } else if(data.username) {
                            // if user, get his tracks or favorites
                            if(/favorites/.test(link.url)) {
                                links.push({url:data.uri + '/favorites'});
                            } else {
                                links.push({url:data.uri + '/tracks'});
                            }
                        } else if($.isArray(data)) {
                            playerObj.tracks = playerObj.tracks.concat(data);
                        }

                        if(links[index]) {
                            // if there are more track to load, get them from the api
                            loadUrl(links[index]);
                        } else {
                            // if loading finishes, anounce it to the GUI
                            playerObj.node.trigger({type:'onTrackDataLoaded', playerObj: playerObj, url: apiUrl});
                        }
                    });
            };

            // update current API key
            apiKey = key;
            // update the players queue
            players.push(playerObj);
            // load first tracks
            loadUrl(links[index]);
        },

        updateTrackInfo = function($player, track) {
            // update the current track title
            // DEBUG.log('updateTrackInfo', track);
            $('.badge__title', $player).each(function(index) {
                $('h4', this).html(track.user.username);
                $('h3', this).html(track.title);
            });

            // update the artwork
            $('.badge__artwork li', $player).each(function(index) {
                var $item     = $(this),
                    itemTrack = $item.data('sc-track');

                if (itemTrack === track) {
                    // show track artwork
                    $item
                        .addClass('active')
                        .find('.loading-artwork')
                        .each(function(index) {
                            // if the image isn't loaded yet, do it now
                            $(this).removeClass('loading-artwork');
                            $(this).html(ARTWORK.image(track, false));
                        });
                } else {
                    // reset other artworks
                    $item.removeClass('active');
                }
            });

            // update cover image
            $('.cover__image', $player).each(function(index) {
                WIDGET.cover();
            });

            // update the track duration in the progress bar
            $('.playbackTime__duration', $player).html(CALCULATE.time(track.duration));
            $player.trigger('onPlayerTrackSwitch.slvrPlayer', [track]);
        },

        play = function(track) {
            var url = track.permalink_url;
            if(currentUrl === url) {
                // DEBUG.log('will play');
                PLAYER.audioEngine.play();
            } else {
                currentUrl = url;
                // DEBUG.log('will load', url);
                PLAYER.audioEngine.load(track, apiKey);
            }
        },

        getPlayerData = function(node) {
            return players[$(node).data('slvr-player').id];
        },

        updatePlayStatus = function(player, status) {
            if(status) {
                // reset all other players playing status
                $('div.slvr-player.playing').removeClass('playing');
            }
            $(player)
                .toggleClass('playing', status)
                .trigger((status ? 'onPlayerPlay' : 'onPlayerPause'));
            },

            onPlay = function(player, id) {
                var track = getPlayerData(player).tracks[id || 0];
                updateTrackInfo(player, track);
                // cache the references to most updated DOM nodes in the progress bar
                updates = {
                    $buffer: $('.sc-buffer', player),
                    $played: $('.sc-played', player),
                    position:  $('.playbackTime__current', player)[0]
                };
                updatePlayStatus(player, true);
                play(track);
            },

            onPause = function(player) {
                updatePlayStatus(player, false);
                PLAYER.audioEngine.pause();
            },

            onFinish = function() {
                var $player = updates.$played.closest('.slvr-player');

                // update the scrubber width
                updates.$played.css('width', '0%');
                // show the position in the track position counter
                updates.position.innerHTML = CALCULATE.time(0);
                // reset the player state
                updatePlayStatus($player, false);
                // stop the audio
                PLAYER.audioEngine.stop();
                $player.trigger('onPlayerTrackFinish');
            },

            onSeek = function(player, relative) {
                PLAYER.audioEngine.seek(relative);
                $(player).trigger('onPlayerSeek');
            },

            onSkip = function(player) {
                var $player   = $(player),
                    $nextItem = $('.tracklist li.active', $player).next('li');

                // continue playing through all players
                // DEBUG.log('track finished get the next one');

                // try to find the next track in other player
                if(!$nextItem.length) {
                    $nextItem = $player.nextAll('div.slvr-player:first').find('.tracklist li.active');
                }
                $nextItem.click();
            },

            positionPoll;     

        // listen to audio engine events
        $doc
            .bind('scPlayer:onAudioReady', function(event) {
                // DEBUG.log('onPlayerReady: audio engine is ready');
                PLAYER.audioEngine.play();
                // set initial volume
                CONTROLS.onVolume(CONTROLS.soundVolume, PLAYER.audioEngine);
            })
            // when the loaded track started to play
            .bind('scPlayer:onMediaPlay', function(event) {
                clearInterval(positionPoll);
                positionPoll = setInterval(function() {
                    var duration = PLAYER.audioEngine.getDuration(),
                        position = PLAYER.audioEngine.getPosition(),
                        relative = (position / duration);

                    // update the scrubber width
                    updates.$played.css('width', (100 * relative) + '%');
                    // show the position in the track position counter
                    updates.position.innerHTML = CALCULATE.time(position);
                    // announce the track position to the DOM
                    $doc.trigger({
                        type: 'onMediaTimeUpdate.slvrPlayer',
                        duration: duration,
                        position: position,
                        relative: relative
                    });
                }, 500);
            })
            // when the loaded track is was paused
            .bind('scPlayer:onMediaPause', function(event) {
                clearInterval(positionPoll);
                positionPoll = null;
            })
            // change the volume
            .bind('scPlayer:onVolumeChange', function(event) {
                CONTROLS.onVolume(event.volume, PLAYER.audioEngine);
            })
            .bind('scPlayer:onMediaEnd', function(event) {
                onFinish();
            })
            .bind('scPlayer:onMediaBuffering', function(event) {
                updates.$buffer.css('width', event.percent + '%');                

            });

        // plugin wrapper
        $.fn.slvrPlayer = function(options) {
            // reset the auto play
            didAutoPlay = false;
            // create the players
            this.each(function() {
                $.slvrPlayer(options, this);
            });
            return this;
        };            
      
        // Generate custom skinnable HTML/CSS/JavaScript based SoundCloud player from links to SoundCloud resources
        $.slvrPlayer = function(options, node) {
            var opts          = $.extend({}, OPTIONS.defaults, options),
                playerId      = players.length,
                $source       = node && $(node),
                sourceClasses = $source[0].className.replace('slvr-player', ''),
                links         = opts.links || $.map($('a', $source).add($source.filter('a')), function(val) { return {url: val.href, title: val.innerHTML}; }),
                $player       = $('<div class="slvr-player loading"></div>').data('slvr-player', {id: playerId}),
                layout        = (opts.layout === 'grid') ? 'grid-layout' : 
                                (opts.layout === 'list') ? 'list-layout' : 'grid-layout',              
                skin          = (opts.skin === 'light') ? 'light-skin' :
                                (opts.skin === 'dark') ? 'dark-skin' : 'light-skin';

                // add the classes of the source node to the player itself
                // the players can be indvidually styled this way
                if(sourceClasses) {
                    $player.addClass(sourceClasses);
                }

                // player tracklist                
                var $tracklist = $('<ul class="'+ layout +' '+ skin +' tracklist"></ul>').appendTo($player);

                // Widget init
                WIDGET.init($player);

                // load and parse the track data from SoundCloud API
                loadTracksData($player, links, opts.apiKey);

        // init the player GUI, when the tracks data was laoded
        $player.bind('onTrackDataLoaded.slvrPlayer', function(event) {
            // DEBUG.log('onTrackDataLoaded.slvrPlayer', event.playerObj, playerId, event.target);
            var tracks = event.playerObj.tracks;
            if (opts.randomize) {
                tracks = SHUFFLE.init(tracks);
            }

            // create the playlist
            $.each(tracks, function(index, track) {
                var active = index === 0;

                // tracklist layout
                (opts.layout === 'list') ? LAYOUT.list(index, active, $tracklist, track) : 
                                           LAYOUT.grid(index, active, $tracklist, track);

                WIDGET.artwork(track, index >= opts.loadArtworks, active);
            });

            // responsive features 
            var $trackItem   = $('.track');

            if ($trackItem.length === 1) {
                $tracklist.addClass('single');
            } else if ($trackItem.length === 2) {
                $tracklist.addClass('2-tracks');
            } else if ($trackItem.length === 3) {
                $tracklist.addClass('3-tracks');
            }

            // update the element before rendering it in the DOM
            $player.each(function() {
                if($.isFunction(opts.beforeRender)) {
                    opts.beforeRender.call(this, tracks);
                }
            });

            // set the first track's duration
            $('.playbackTime__duration', $player)[0].innerHTML = CALCULATE.time(tracks[0].duration);
            $('.playbackTime__current', $player)[0].innerHTML = CALCULATE.time(0);            


            // set up the first track info
            updateTrackInfo($player, tracks[0]);

            // if continous play enabled always skip to the next track after one finishes
            if (opts.continuePlayback) {
                $player.bind('onPlayerTrackFinish', function(event) {
                    onSkip($player);
                });
            }

            // announce the succesful initialization
            $player
                .removeClass('loading')
                .trigger('onPlayerInit');

            // if auto play is enabled and it's the first player, start playing
            if(opts.autoPlay && !didAutoPlay) {
                onPlay($player);
                didAutoPlay = true;
            }

            // Dropdown init
            DROPDOWN.init();            
        });    

        // replace the DOM source (if there's one)
        $source.each(function(index) {
            $(this).replaceWith($player);
        });

        return $player;
        };

        // stop all players, might be useful, before replacing the player dynamically
        $.slvrPlayer.stopAll = function() {
            $('.slvr-player.playing a.sc-pause').click();
        };

        // destroy all the players and audio engine, usefull when reloading part of the page and audio has to stop
        $.slvrPlayer.destroy = function() {
            $('.slvr-player, .slvr-player__container').remove();
        };


        // the GUI event bindings
        //--------------------------------------------------------

        // toggling play/pause
        $doc.on('click','.playControls__play', function(event) {
            CONTROLS.play($(this));
        });        

        // next track
        $doc.on('click','.next-track', function(event) {
            CONTROLS.nextTrack($(this));
        });
        // prev track
        $doc.on('click','.prev-track', function(event) {
            CONTROLS.prevTrack($(this));
        });        

        // selecting tracks in the playlist and play
        $doc.on('click', '.tracklist .track__cover', function(event) {
            var track = $(this).parents('.track');
            CONTROLS.playTrack(track, onPlay, onPause);
        });


        // Seeking in the loaded track buffer
        $doc
            .on('click','.playbackTimeline', function(event) {
                CONTROLS.scrub(this, event.pageX, onSeek);
                return false;                
            })
            .on('touchstart','.playbackTimeline', function(event) {
                this.addEventListener('touchmove', CONTROLS.onTouchMove, false);
                event.originalEvent.preventDefault();
            })
            .on('touchend','.playbackTimeline', function(event) {
                this.removeEventListener('touchmove', CONTROLS.onTouchMove, false);
                event.originalEvent.preventDefault();
            });

        // Volume tracking
        $doc
            .on('input','.sc-volume-status', function(event) {
                CONTROLS.volumeTracking(this, event, $doc);
            })
            .on('change','.sc-volume-status', function(event) {
                CONTROLS.volumeTracking(this, event, $doc);
            });
    }  
}

export default {
    init: PLAYER.init    
}