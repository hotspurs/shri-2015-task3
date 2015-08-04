modules.require(
    ['i-bem__dom_init', 'jquery', 'next-tick'],
    function(init, $, nextTick) {

    $(function() {
        nextTick(init);
    });
});

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
                    this._playList = [];
                    this._isPlaying = false;
                    this.domElem.draggable({ cancel: '.player__action, .player__progress, .player__time, .player__volume'});

                    this.findBlocksInside('progress')[1].on('change', this._onChangeProgress, this );
                }
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
            this._audioContext.decodeAudioData(data.buffer, function(buffer){
                var endtDecodeTime = +new Date;
                console.log('Total decode time', (endtDecodeTime - startDecodeTime) / 1000 );
                self._playList.push( { name : data.name, buffer : buffer } );
                console.log(self._playList);
                if(!self._source && self._playList.length === 1){
                    self._createBufferSource();
                    self.setAtIndex(0);
                    self.emit('progressActive');
                }
            },function(e){
                "Error with decoding audio data" + e.err
            }
            );
        },
        _createBufferSource : function(){
            this._source = this._audioContext.createBufferSource();
            this._source.connect(this._audioContext.destination);
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
            this.emit('onProgress', { value : 0 })
        },
        play : function(){
            var self = this;
            this._isPlaying = true;
            this._currentSongStartTime = this._audioContext.currentTime;
            if(!this._source){
                this._createBufferSource();
                this.setAtIndex(this._currentSong);

            }
            this._source.start( this._audioContext.currentTime, this._currentSongTime );

            this.progressTimer = setInterval(function(){
                var currentTime = (self._audioContext.currentTime - self._currentSongStartTime ) + self._currentSongTime;
                var value = Math.round( (currentTime / self._playList[self._currentSong].buffer.duration)*100 );
                console.log('Value',value);
                self.emit('onProgress', { value : value })
            }, 1000);

            this.endOfSongTimer = setTimeout(function(){
                clearInterval(self.progressTimer);
                self._onSongEnd();
            }, Math.round( self._playList[self._currentSong].buffer.duration - self._currentSongTime)* 1000  )
           
        },
        stop : function(){
            clearInterval(this.progressTimer);
            clearTimeout(this.endOfSongTimer);
            this._currentSongTime += (this._audioContext.currentTime - this._currentSongStartTime);
            console.log('Текущие время песни ', this._currentSongTime);
            this._source.stop();
            this._isPlaying = false;
            this._source =  null;
        },
        setAtIndex : function(index){
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


modules.define('progress', ['i-bem__dom'], function(provide, BEMDOM){
  provide( BEMDOM.decl(this.name, {
    onSetMod : {
      js : {
        inited : function(){
          console.log('Init progress');
          this._width = this.domElem.width();
          this.value = 0;
          this.active = false;
          this.findBlockOutside('player').on('progressActive',this._onActive, this);
        }
      }
    },
    _onActive : function(){
        console.log('Progress active');
        this.active = true;
    },
    _setCurrentWidth : function(value){
        this.elem('current').width(value+'%')
    }
  },{
    live : function(){

        this.liveBindTo('click', function(e){
            if(this.active)
              this._onClick(e);
        })        

        return false;
    }
  }))
});


modules.define('progress', function(provide, progress){
  provide(progress.decl({ modName : 'type', modVal : 'time'}, {
    onSetMod : {
      js : {
        inited : function(){
          console.log('Init progress time');
          this._width = this.domElem.width();
          this.value = 0;
          this.active = false;
          this.findBlockOutside('player').on('progressActive',this._onActive, this);
          this.findBlockOutside('player').on('onProgress', this._onProgress, this);
        }
      }
    },
    _onProgress : function(e, data){
      this._setCurrentWidth(data.value);
    },
    _onClick : function(e){
        this.value = Math.round( (e.offsetX / this._width) * 100);
        this._setCurrentWidth(this.value);
        this.emit('change', { value : this.value});
    }
  },
  {

  }))
});


modules.define('loader', ['i-bem__dom'], function(provide, BEMDOM){
    provide( BEMDOM.decl(this.name, {
        onSetMod : {
            js : {
                inited : function(){
                    console.log('loader inited')
                }
            }
        },
        _onFileChange : function(e){
            var files = e.target.files;
            this._loadFiles(files);
        },
        _onDropZoneDrop : function(e){
            var files = e.originalEvent.dataTransfer.files;
            e.stopPropagation();
            e.preventDefault();
            this._loadFiles(files);
        },
        _onDropZoneDragOver : function(e){
            e.stopPropagation();
            e.preventDefault();        
        },
        _loadFiles : function(files){
            
            for(var i = 0; i < files.length; i++){
                var self = this;
                (function(){
                    var name = files[i].name;
                    var reader = new FileReader();
                    reader.onload = function(e){
                        var data = e.target.result
                        self.emit('load', { buffer : data, name : name })
                    }
                    reader.readAsArrayBuffer(files[i])
                })();
            }

        }
    },
    {
        live : function(){
            this.liveBindTo('file', 'change', function(e){
                this._onFileChange(e);
            })

            this.liveBindTo('drop-zone', 'drop', function(e){
                this._onDropZoneDrop(e);
            });

            this.liveBindTo('drop-zone', 'dragover', function(e){
                this._onDropZoneDragOver(e);
            });
        }
    }
    ));
});
