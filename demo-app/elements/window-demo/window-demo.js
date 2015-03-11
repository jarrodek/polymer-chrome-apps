Polymer('window-demo', {
  windowid: 'demo-window',
  windowhidden: false,
  isOpened: false,
  frameOption: 'chrome',


  onCreated: function(event, details, sender){
    console.log('Window created', details);
    this.isOpened = true;
  },
  onError: function(event, details, sender){
    console.error('Error from window API', details);
  },

  openWindow: function(event, details, sender){
    console.log('open window');
    this.$.window.create();
  },
  closeWindow: function(){
    this.$.window.window.close();
    this.isOpened = false;
  },


  frameOptionChanged: function(){
    // TODO: add "close" / "open" button highlight animation
    // to point a need to reopen a window.
  }
});


