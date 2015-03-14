Polymer('window-demo', {
  windowid: 'demo-window',
  windowhidden: false,
  windowmaximized: false,
  windowminimized: false,
  isOpened: false,
  frameOption: 'chrome',
  windowState: 'normal',


  onCreated: function(event, details, sender){
    console.log('Window created', details);
    this.isOpened = true;
    this.$.log.append('Window "' + this.windowid + '" has been created.');
  },
  onError: function(event, details, sender){
    console.error('Error from window API', details);
    this.$.log.append('An error occurred: ' + JSON.stringify(), true);
  },

  openWindow: function(event, details, sender){
    console.log('open window');
    this.$.window.create();
  },
  closeWindow: function(){
    var id = this.$.window.window.id;
    this.$.window.window.close();
    this.isOpened = false;
    this.$.log.append('Window "' + id + '" has been closed.');
  },


  frameOptionChanged: function(){
    // TODO: add "close" / "open" button highlight animation
    // to point a need to reopen a window.
    this.$.log.append('Reopen window so frame options change may take effect.');
  },

  windowhiddenChanged: function(){
    if(this.windowhidden){
      this.$.log.append('Window is now hidden');
    } else {
      this.$.log.append('Window is now visible');
    }
  },

  windowmaximizedChanged: function(){
    if(this.windowmaximized){
      this.$.log.append('Window is now maximized');
      this.windowState = "maximized";
    } else {
      this.$.log.append('Window has been restored');
      if(!this.windowminimized){
        this.windowState = "normal";
      } else {
        this.windowState = "minimized";
      }
    }
  },

  windowminimizedChanged: function(){
    if(this.windowminimized){
      this.$.log.append('Window is now minimized');
      this.windowState = "minimized";
    } else {
      this.$.log.append('Window has been restored');
      if(!this.windowmaximized){
        this.windowState = "normal";
      } else {
        this.windowState = "maximized";
      }
    }
  }

});


