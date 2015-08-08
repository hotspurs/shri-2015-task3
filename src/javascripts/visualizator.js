modules.define('visualizator', ['i-bem','i-bem__dom'], function(provide, BEM, BEMDOM){
  
  provide(BEMDOM.decl(this.name, {
    onSetMod : {
      js : {
      	inited : function(){
          console.log('Visualizator inited');
          this.player = this.findBlockOutside('player');
          this._canvas = this.elem('canvas')[0];
          BEM.blocks['player'].on('toggleVisualizator', this._onToggle, this);
          this.domElem.draggable({stack:'div'});
          this.bindTo( this.elem('close'), 'click', this._onClickClose );
          this.outerWidth = this.domElem.outerWidth();
      	}
      }
    },
    draw : function(){
      var width,
          canvasheight,
          canvasWidth,
          drawContext = this._canvas.getContext('2d');
      canvasWidth = this._canvas.width = 220;
      canvasheight = this._canvas.height = 196;
      this.player._analyser.getByteFrequencyData(this.player._freqs);
      width = Math.floor(1/this.player._freqs.length,10);

      for(var i = 0; i < this.player._analyser.frequencyBinCount; i++){
        var value = this.player._freqs[i],
            percent = value / 256,
            height = canvasheight * percent,
            offset = canvasheight - height - 1,
            barWidth = canvasWidth / this.player._analyser.frequencyBinCount,
            hue = i / this.player._analyser.frequencyBinCount * 360;

            drawContext.fillStyle = 'hsl('+ hue + ', 100%, 50%)';
            drawContext.fillRect(i * barWidth, offset, barWidth, height);
      }
      if(this.player._isPlaying){
        this.rAfTimer = requestAnimationFrame(this.draw.bind(this));
      }
    },
    clear : function(){
      console.log('Clear');
      this._canvas.getContext('2d').clearRect(0, 0, this._canvas.width, this._canvas.height);
    },
    _onToggle : function(){
      this.toggleMod('visible');
      this._setCords();
    },
    _onClickClose : function(){
      this.player._toggleVisualizator();
    },
    _setCords : function(){

      var playerElemWrapper = this.player.elem('wrapper'),
          playerElemWrapperOffset = playerElemWrapper.offset(),

          top = playerElemWrapperOffset.top,
          left = playerElemWrapperOffset.left - this.outerWidth - 10;

      this.domElem.css({ top : top, left : left});
    }
  },{
  }))
});