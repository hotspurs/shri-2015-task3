modules.define('loader', ['i-bem__dom', 'id3parser'], function(provide, BEMDOM, id3parser){

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
            var self = this;

            for(var i = 0; i < files.length; i++){
                
                (function(i){
                    var reader = new FileReader(),
                        title,
                        artist;

                    reader.onload = function(e){
                        var data = e.target.result
                        self.emit('load', { buffer : data, artist : artist, title : title })
                    };

                    reader.onerror = function(e) {
                        callback('File read failed');
                    };

                    id3parser.getMetaData(files[i], function(err, tags){

                      title = tags.title || files[i].name;
                      artist = tags.artist || "";

                      reader.readAsArrayBuffer(files[i])
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