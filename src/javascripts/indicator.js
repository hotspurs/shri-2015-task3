modules.define('indicator', ['i-bem__dom'], function(provide, BEMDOM){

	provide( BEMDOM.decl(this.name, {
		onSetMod : {
			js : {
				inited : function(){

				}
			}
		},
		_onActive : function(){
			this.active = true;
			this.setMod('active');
		},
		_setCurrentWidth : function(value){
		    this.elem('current').width(value+'%');
		}
		},{
		live : function(){
			this.liveBindTo('click', function(e){
			    if(this.active)
			       this._onClick(e);
			});
			return false;
		}
	}));

});


modules.define('indicator', function(provide, indicator){

	provide(indicator.decl({ modName : 'type', modVal : 'time'}, {
		onSetMod : {
			js : {
				inited : function(){
					console.log('Init indicator time');
					this._width = this.domElem.width();
					this.value = 0;
					this.active = false;
					this.findBlockOutside('player').on('indicatorActive',this._onActive, this);
					this.findBlockOutside('player').on('onProgress', this._onProgress, this);
				}
			}
		},
		_onClick : function(e){
		    this.value = Math.round( (e.offsetX / this._width) * 100);
		    this._setCurrentWidth(this.value);
		    this.emit('changeTime', { value : this.value});
		},
		_onProgress : function(e, data){
			this._setCurrentWidth(data.value);
		}
	}));

});

modules.define('indicator', function(provide, indicator){

	provide(indicator.decl({ modName : 'type', modVal : 'volume'}, {
		onSetMod : {
			js : {
				inited : function(){
					console.log('Init indicator volume');
					this._width = this.domElem.width();
					this.value = 0;
					this.active = false;
					this.findBlockOutside('player').on('indicatorActive',this._onActive, this);
				}
			}
	},
	_onClick : function(e){
		this.value = Math.round( (e.offsetX / this._width) * 100);
		this._setCurrentWidth(this.value);
		this.emit('changeVolume', { value : this.value});
	},
	_onActive : function(){
		this.active = true;
		this.setMod('active');
		this.emit('changeVolume', { value : 50});
		this._setCurrentWidth(50);
	}
	}));

});

