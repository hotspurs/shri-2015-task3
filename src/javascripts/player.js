modules.define('player', ['i-bem__dom'], function(provide, BEMDOM){

  function getAudioContext(){
    if(typeof AudioContext !== 'undefined'){
        return new AudioContext();
    }
    else if(typeof webkitAudioContext !== 'undefined'){
        return new webkitAudioContext();
    }
    else if(typeof mozAudioContext !== 'undefined'){
        return mozAudioContext();
    }
    else{
        throw new Error('AudioContext not supported');
    }
  }

  provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function() {
                    console.log('Player inited');
                    this._audioContext = getAudioContext();
                    this._analyser = this._audioContext.createAnalyser();
                    this._analyser.connect(this._audioContext.destination);
                    this._settingAnalyser();
                    this._playList = [];
                    this._isPlaying = false;
                    this.visualizator = this.findBlockInside('visualizator');
                    this.elem('wrapper').draggable({ cancel: '.player__action, .player__progress, .player__time, .player__volume, .player__icon', stack:'div'});

                    this.findBlocksInside('progress')[1].on('change', this._onChangeProgress, this );

                    this.bindTo( this.elem('icon', 'visualizator'), 'click', this._toggleVisualizator );

                }
            }
        },

        _settingAnalyser : function(){
            this._analyser.minDecibels = -140;
            this._analyser.maxDecibels = 0;
            this._analyser.smothngTimeConstant = 0.8;
            this._analyser.fftSize = 2048;
            this._freqs = new Uint8Array(this._analyser.frequencyBinCount);
        },
        _toggleVisualizator : function(){
            if( this.hasMod( this.elem('icon', 'visualizator'), 'inited' ) ){
                this.toggleMod( this.elem('icon', 'visualizator'), 'active' );
                this.emit('toggleVisualizator');
            }
        },
        _onChangeProgress : function(e, data){
            this._currentSongTime =  this._playList[this._currentSong].buffer.duration / 100 * data.value;
            if(this._isPlaying){
              this.stop();
              this.play();
            }

        },
        _decodeAndSaveBuffer : function(data){
            console.log('DecodeAudioData.... ')
            var startDecodeTime = +new Date;
            var self = this;
            this.setMod(this.elem('spiner'), 'visible');
            this._audioContext.decodeAudioData(data.buffer, function(buffer){
                var endtDecodeTime = +new Date;
                console.log('Total decode time', (endtDecodeTime - startDecodeTime) / 1000 );
                self._playList.push( { name : data.name, buffer : buffer } );
                console.log(self._playList);
                self.delMod(self.elem('spiner'), 'visible');
                if(!self._source && self._playList.length === 1){
                    self._createBufferSource();
                    self._setAtIndex(0);
                    self.emit('progressActive');
                    self.setMod(self.elem('icon'), 'inited');
                }
            },function(e){
                "Error with decoding audio data" + e.err
            }
            );
        },
        _createBufferSource : function(){
            this._source = this._audioContext.createBufferSource();
            this._source.connect(this._analyser);
        },
        _setTime : function(duration){
          var roudDuration = Math.round(duration),
              minutes = Math.floor(roudDuration / 60),
              seconds = roudDuration % 60;
            this.elem('time').text(minutes+':'+seconds);
        },
        _setSongName : function(name){
            this.elem('song').text(name);
        },
        _onSongEnd : function(){
            this._isPlaying = false;
            this._source =  null;
            this.toggleMod(this.elem('action'),'stop');
            this._currentSongTime = 0.0;
            this.emit('onProgress', { value : 0 });
            setTimeout( this.visualizator.clear.bind(this.visualizator), 50 );
        },
        play : function(){
            console.log('PLAY');
            var self = this;
            this._isPlaying = true;
            this._currentSongStartTime = this._audioContext.currentTime;

            if(!this._source){
                this._createBufferSource();
                this._setAtIndex(this._currentSong);

            }
            
            this.rafTimer = requestAnimationFrame(this.visualizator.draw.bind(this.visualizator));

            this._source.start( this._audioContext.currentTime, this._currentSongTime );

            this.progressTimer = setInterval(function(){
                var currentTime = (self._audioContext.currentTime - self._currentSongStartTime ) + self._currentSongTime;
                var value = Math.round( (currentTime / self._playList[self._currentSong].buffer.duration)*100 );
                console.log('Value', value);
                self.emit('onProgress', { value : value })
            }, 1000);

            this.endOfSongTimer = setTimeout(function(){
                clearInterval(self.progressTimer);
                self._onSongEnd();
            }, Math.round( self._playList[self._currentSong].buffer.duration - self._currentSongTime)* 1000  )
           
        },
        stop : function(){
            console.log('STOP');
            cancelAnimationFrame(this.rafTimer);
            cancelAnimationFrame(this.visualizator.rAfTimer);
            console.log('что тут?',this.rafTimer)
            this.rafTimer = null;
            clearInterval(this.progressTimer);
            clearTimeout(this.endOfSongTimer);
            this._currentSongTime += (this._audioContext.currentTime - this._currentSongStartTime);
            console.log('Текущие время песни ', this._currentSongTime);
            this._source.stop();
            this._isPlaying = false;
            this._source =  null;
        },
        _setAtIndex : function(index){
           var song = this._playList[index];
           this._source.buffer = song.buffer;
           this._currentSong = index;
           this._setTime(song.buffer.duration);
           this._setSongName(song.name);
        },
        _currentSongStartTime : 0.0,
        _currentSong : null,
        _currentSongTime : 0.0
    },
    {
       live : function(){
          var self = this;

          this.liveInitOnBlockInsideEvent('load', 'loader', function(e, data){
             this._decodeAndSaveBuffer(data);
          });

          this.liveBindTo('action', 'click', function(e){
            if(this._playList.length === 0) return;
            if(this._isPlaying) this.stop();
            else this.play();
            this.toggleMod(this.elem('action'),'stop');
          });

          return false; 
       }
    }
    ));
});