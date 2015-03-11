Polymer('chrome-app-window', {
  /**
   * Fired when a new window has been created but before load event is called
   * in created window.
   * Details object will contain a "createdWindow" key wioth a reference
   * to created window object. You can access it's JS's window via
   * createdWindow.contentWindow
   *
   * @event created
   */

   publish: {
     /**
      * The URL for new window.
      * New window will be created each time the url atributte is changed
      *
      * @attribute url
      * @type String
      * @default ''
      */
     'url': '',

     /**
      * Id to identify the window. This will be used to remember the size and
      * position of the window and restore that geometry when a window with
      * the same id is later opened. If a window with a given id is created
      * while another window with the same id already exists,
      * the currently opened window will be focused instead of creating a new window.
      *
      * @attribute name
      * @type String
      * @defailt undefined
      */
     'name': undefined,
     /**
      * Frame type: none or chrome (defaults to chrome).
      * For none, the -webkit-app-region CSS property can be used to apply
      * draggability to the app's window. -webkit-app-region: drag can be used
      * to mark regions draggable. no-drag can be used to disable this style
      * on nested elements.
      *
      * You can also pass an object of FrameOptions which is available since Chrome 35.
      * See more at https://developer.chrome.com/apps/app_window#type-FrameOptions
      *
      * @attribute frame
      * @type String|Object
      * @defailt undefined
      */
     'frame': undefined,
     /**
      * The initial state of the window, allowing it to be created already
      * fullscreen, maximized, or minimized. Defaults to 'normal'.
      *
      * Possible values are: "normal", "fullscreen", "maximized", or "minimized"
      *
      * @attribute state
      * @type String
      * @defailt 'normal'
      */
     'state': 'normal',
     /**
      * If true, the window will be created in a windowhidden state.
      * Call show() on the window to show it once it has been created.
      * Defaults to false.
      *
      * @attribute windowhidden
      * @type boolean
      * @defailt false
      */
     'windowhidden': false
   },

   /**
    * Created window object.
    * For more details see https://developer.chrome.com/apps/app_window#type-AppWindow
    */
   window: undefined,


   /**
    * Create a new window when URL has changed.
    */
   urlChanged: function(){
     //TODO: create a new window
     if(this.url && this.url.trim() !== ''){
       this.create();
     }
   },

   windowhiddenChanged: function(){
     if(!this.window){
       this.fire('error',{'message':'No active window available'});
       return;
     }

     var state = this.windowhidden;
     if(!state || state === ''){
       state = false;
     }
     if(typeof state === 'string'){
       if(state === 'true'){
         state = true;
       } else {
         state = false;
       }
     }

     if(state){
       this.window.hide();
     } else {
       this.window.show();
     }
   },

   /**
    * Create a new window.
    *
    * The size and position of a window can be specified in a number of different ways.
    * The most simple option is not specifying anything at all,
    * in which case a default size and platform dependent position will be used.
    *
    * To automatically remember the positions of windows you can give them ids (name attribute).
    * If a window has an id, This id is used to remember the size and position
    * of the window whenever it is moved or resized. This size and position is
    * then used instead of the specified bounds on subsequent opening of a window
    * with the same id. If you need to open a window with an id at a location
    * other than the remembered default, you can create it hidden,
    * move it to the desired location, then show it.
    *
    * @param options {Object} a create window options. See https://developer.chrome.com/apps/app_window#type-CreateWindowOptions
    *                         for more details. If this object is not passed to the function
    *                         default values from element's atributtes will be used.
    */
   create: function(options){
     if(!options){
       options = {};
     }
     if(this.name){
      options.id = options.id || this.name;
     }
     if(this.frame){
       options.frame = options.frame || this.frame;
     }
     if(this.state){
       options.state = options.state || this.state;
     }

     var _hidden = this.windowhidden;
     if(typeof _hidden === 'string'){
       if(_hidden === 'true'){
         _hidden = true;
       } else {
         _hidden = false;
       }
     }
     options.hidden = _hidden;

     var context = this;
     chrome.app.window.create(this.url, options, function(createdWindow){
       context.window = createdWindow;
       context.fire('created', {createdWindow: createdWindow});
     });
   },

   /**
    * Query for opened by the app windows.
    * If `name` atributte is set it will return a window opbject for selected id.
    *
    * @return an array of AppWindow objects (https://developer.chrome.com/apps/app_window#type-AppWindow)
    */
   query: function(){
     var result = [];
     if(this.name){
       var _win = chrome.app.window.get(this.name);
       if(_win !== null){
         result.push(_win);
       }
     } else {
       result = chrome.app.window.getAll();
     }
     return result;
   },

   /**
    * Focus on current window.
    */
   focus: function(){
     if(!this.window){
       this.fire('error',{'message':'No active window available'});
       return;
     }
     this.window.focus();
   },

   get fullscreen() {
     if(!this.window){
       return undefined;
     }
     return this.window.isFullscreen();
   },

  set fullscreen(state){
    if(!this.window){
      return;
    }
    if(state){
      this.window.fullscreen();
    } else {

      // it looks like code below doeasn't work. TODO: cancel fullscreen programatically.

      var defaultview = this.window.contentWindow.document.defaultView
      var keyboardEvent = document.createEvent("KeyboardEvent");
      Object.defineProperty(keyboardEvent, 'keyCode', {
        get : function() {
          return this.keyCodeVal;
        }
      });
      Object.defineProperty(keyboardEvent, 'which', {
        get : function() {
          return this.keyCodeVal;
        }
      });
      keyboardEvent.initKeyboardEvent("keydown", true, true, defaultview, false, false, false, false, 27, 27);
      keyboardEvent.keyCodeVal = 27;
      this.window.contentWindow.document.body.dispatchEvent(keyboardEvent);

    }
  }
});