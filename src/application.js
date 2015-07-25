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
                    var self = this;
                    this._audioContext = getAudioContext();
                    this._playList = [];
                }
            }
        },
        _decodeAndSaveBuffer : function(data){
            console.log('DecodeAudioData.... ')
            var startTime = +new Date;
            var self = this;
            this._audioContext.decodeAudioData(data.buffer, function(buffer){
                var endtTime = +new Date;
                console.log('Total time', (endtTime - startTime) / 1000 );
                self._playList.push( { name : data.name, buffer : buffer } );
            }, 
            function(e){
                "Error with decoding audio data" + e.err
            }
            );
        },
        _createBufferSource : function(){
            this._source = this._audioContext.createBufferSource();
            this._source.connect(this._audioContext.destination);
        },
        play : function(){

            if(!this._source){
                this._createBufferSource();
                this.current = 0;
                this.playAtNumber(0);
            }

            this._currentSongStartTime = this._audioContext.currentTime;
            console.log('currentSongStartTime', this._currentSongStartTime );
            this._source.start( this._audioContext.currentTime, this._currentSongTime );
           
        },
        stop : function(){
            this._currentSongTime += (this._audioContext.currentTime - this._currentSongStartTime);

            console.log('Текущие время песни ', this._currentSongTime);

            this._source.stop();
            this._source =  null;
        },
        playAtNumber : function(number){
           this._source.buffer = this._playList[number].buffer;
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

          this.liveBindTo('play', 'click', function(e){
            this.play();
          });

          this.liveBindTo('stop', 'click', function(e){
            this.stop();
          });

       }
    }
    ));
});


modules.define('loader', ['i-bem__dom'], function(provide, BEMDOM){

    provide( BEMDOM.decl(this.name, {
        onSetMod : {
            js : {
                inited : function(){
                    console.log( 'loader inited' )
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