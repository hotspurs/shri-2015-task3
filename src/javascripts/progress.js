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