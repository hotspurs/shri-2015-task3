modules.define('loader', ['i-bem__dom', 'id3parser'], function(provide, BEMDOM, id3parser){

    provide( BEMDOM.decl(this.name, {
        onSetMod : {
            js : {
                inited : function(){
                    console.log('loader inited');
                    this._checkSupportFormats();
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
        _checkSupportFormats : function(){
            var audioElem = document.createElement('audio'),
                formats = { mp3 : false, wav : false, ogg : false, mp4 : false };

            formats.mp3 = !!(audioElem.canPlayType && audioElem.canPlayType('audio/mp3;').replace(/no/, ''));
            formats.wav = !!(audioElem.canPlayType && audioElem.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
            formats.ogg = !!(audioElem.canPlayType && audioElem.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
            formats.mp4 = !!(audioElem.canPlayType && audioElem.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ''));

            this.supportFormats = formats;

        },
        _getFileExtension : function(file){
          var arr = file.name.split('.');
          return arr[arr.length-1];
        },
        _loadFiles : function(files){
            var self = this;

            for(var i = 0; i < files.length; i++){
                
                (function(i){
                    var reader = new FileReader(),
                        title,
                        artist,
                        file = files[i];


                    if( !self.supportFormats[ self._getFileExtension(file) ]){
                        alert("Format is not supported");
                        return;
                    }

                    reader.onload = function(e){
                        var data = e.target.result
                        self.emit('load', { buffer : data, artist : artist, title : title })
                    };

                    reader.onerror = function(e) {
                        callback('File read failed');
                    };


                    

                    id3parser.getMetaData(file, function(err, tags){

                      title = tags.title || file.name;
                      artist = tags.artist || "";

                      reader.readAsArrayBuffer(file)
                    });

                })(i);
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
                this.delMod(this.elem('drop-zone'), 'over');
            });

            this.liveBindTo('drop-zone', 'dragover', function(e){
                this._onDropZoneDragOver(e);
            });

            this.liveBindTo('drop-zone', 'dragenter', function(e){
                this.setMod(this.elem('drop-zone'), 'over');
            });

            this.liveBindTo('drop-zone', 'dragleave', function(e){
                this.delMod(this.elem('drop-zone'), 'over');
            });
        }
    }
    ));
});